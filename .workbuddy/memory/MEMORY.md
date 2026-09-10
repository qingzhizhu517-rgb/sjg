# 项目长期记忆 · sjg-new

> 本文件在 `feat-3d-sandbox-realism` 与 `feat-datav-overhaul` 两个分支上各有一份，内容一致。

## 一、3D 沙盘模块结构（2026-09-10 起）

| 文件 | 职责 |
|---|---|
| `display-v2/src/composables/useThreeSandbox.js` | 引擎：场景装配、光照、拾取、动画循环 |
| `display-v2/src/utils/sandboxTerrain.js` | 纯函数：投影、高度场、分层设色、法线、多边形裁切、地形网格、黄河带状网格 |
| `display-v2/src/utils/sandboxBuildings.js` | 纯函数：确定性 PRNG、按城市等级生成建筑布局 |
| `display-v2/tests/sandbox{Terrain,Buildings}.test.js` | node:test 覆盖，共 34 用例 |

改动沙盘时必须遵守：

1. **坐标基准**：`projectGeo` 以 lon 117.0 / lat 36.4 为原点，`LON_SCALE=3.06` / `LAT_SCALE=3.8`。
   1 世界单位 ≈ 29km。垂直夸张约 30–40×（泰山 1532m → 约 2.2 单位），
   因此**山体坡度必然远陡于现实**，坡上放置物体前要用 `terrainNormalAt` 判坡度。
2. **地形网格是非索引顶点**（每格点 6 个顶点，为支持边界吸附），
   不能用 `computeVertexNormals()`——会退化成面法线。必须用解析法线 `terrainNormalAt`。
3. **绕序固定为 a→c→b / a→d→c**（法线朝 +Y）。写反会导致整片地形被背面剔除，
   表现为「只看到深色底板」，且控制台无任何报错。
4. **贴地物体用 `terrainGroundY(x, z, r)` 而非 `getTerrainHeight`**：
   网格按 0.2 间距采样，山峰处解析高程比插值网面高 0.15+，直接用会悬空。
5. **噪声频率上限 ≈ 3.3**（波长不低于 0.4 单位），否则在 0.2 网格上走样。
6. 性能预算：地形构建现为 ~100ms。加大精度前先测这个数。
7. 沙盘相关逻辑**一律抽成 `src/utils/` 下的纯 `.js` 模块**再写 `node:test`——
   `.vue` SFC 与 three.js 场景在测试环境跑不了（项目既有约定）。

黄河河道实测走向（19 点）在 `sandboxTerrain.js` 的 `YELLOW_RIVER_GEO`，
**数据大屏要画真实河道时直接复用这份数据，别再造一条**。

## 二、数据大屏（sjg-datav）改造要点

> 2026-09-10 已按「三栏 + 底部时间轴」重构，当前结构见下。

### 版式骨架
- 设计稿 1920×1080，`AutoFit` + `useAutoFit` 走 contain 居中缩放（已实测正确，别动）。
- 顶栏 92 / 三栏 `340 + 1fr + 340` / 底部通栏时间轴 148；左右各三张**等高**卡。
- **卡片必须显式声明 flex（`flex: N 1 0`）**。父级是 `height:100%` 的 column flex，
  子项不写 flex 就会被 flex-shrink 按内容比例压扁——右栏曾因此把 8 行榜单裁成 5 行。
- **组件不要写死自身尺寸**（`SentimentCloud` 的 `width=400/height=300` 曾溢出 324px 宽的卡片）。

### 地图（最容易踩的地方）
`echarts/lib/coord/geo/geoCreator.js` 里：
```js
size = parsePercent(layoutSize, Math.min(容器宽, 容器高))
if (aspect > 1) { viewRect.width = size; viewRect.height = size / aspect }
```
**百分比 layoutSize 相对容器短边，且 size 是地图的长边。**
写 `'96%'` 在宽扁容器里只会吃到短边，横向空间全浪费（地图曾因此只占中央栏约四成宽）。
正确做法：按长边显式算绝对像素 —— `fitted = min(boxW, boxH * GEO_ASPECT)`，
`GEO_ASPECT` 由 GeoJSON 实际经纬跨度 × `aspectScale` 现算。
`aspectScale` 用 0.805（cos 36.4°）做地理比例修正，ECharts 默认 0.75。

### 数据与筛选
- 已有但**曾长期零消费**的公开接口：`/api/public/events`、`/dynasties`、`/poet-relations`。
  加卡片优先考虑它们。**刻意不用 `/timeline`**——每朝代 4 次查询且返回全量不分页。
- **poets 表没有 region 字段**。城市维度只能走「诗 → `poem.spotId` → `spot.region`」归属；
  诗人的城市归属 = 其诗所在城市。
- 筛选状态支持 `?region=济南&dynasty=4` 深链预置（挂大屏可固定专题，也便于回归验证）。
- `REGION_ORDER` 仍是硬编码九市；`/spots/regions` 已有该信息，可后续改成动态获取。

### 主题与字体
- 主题 token 在 `src/styles/global.css` 的 `:root`。ECharts option 读不到 CSS 变量，
  统一由 `src/theme/chartTheme.ts` 在模块加载时读取并回落默认值；**改配色只改 CSS 即可**。
- ECharts 按需注册集中在 `src/theme/echartsSetup.ts`，加图表类型只改那里。
- 字体分两套栈：标题用 `--dv-serif`（`DvSerif` = Noto Serif SC 子集，354KB 本地托管于
  `public/fonts/dv-serif.woff2`），正文/数字用 `--dv-sans`。
  **字重只用 400**——CJK 合成粗体会糊，层级靠字号/字距/颜色。
  字体子集按「源码 + 后端种子 SQL」抽字，改了大量文案后可重新子集化。
- `Chart.tsx` 实例只初始化一次、option 变化走 `setOption`、尺寸监听用 `ResizeObserver`。
  **父组件仍须 `useMemo` 稳定 option**，否则每次渲染都会重放图表动画。

### 三态
后端不通时不再静默显示 0/`—`：`PanelKit.tsx` 提供 `SkeletonBlock` / `ErrorState` / `EmptyState`，
`useDashboardData` 的 `hasData` 用于区分「加载中」与「真的没数据」。

### 已删除的死代码（勿再引用）
`src/pages/DataV/map/*`、`test.tsx`~`test8.tsx`、`components/TimelineChart.tsx`、
`pages/DataV/stores/index.ts`、`src/types/geojson.d.ts`；
依赖已移除 `three`、`@react-three/fiber`、`@react-three/drei`、`zustand`、`autofit.js`、`gsap`。
⚠️ **CLAUDE.md 说 `map/` 目录不存在，是错的**——它曾存在且是死代码，现已删除。

## 三、本机环境限制（影响所有分支操作）

- **无法新建 `feat/xxx` 这类带斜杠的分支**（`cannot lock ref`）。改用扁平名，
  如 `feat-3d-sandbox-realism`、`feat-datav-overhaul`。
- `git checkout -b` 在受限时会**静默切到未出生分支**（退出码 0、无提交），
  随后 `git status` 把 index 里全部文件显示为 `A`。判别：`git rev-parse HEAD`
  报 `Not a valid object name`。恢复：`git symbolic-ref HEAD refs/heads/master`。
- ⚠️ **`git checkout` 可能静默删掉工作区文件**（实测一次丢了 96 个）。
  index 与 HEAD 完好，`git restore --source=HEAD --worktree .` 可无损还原。
  **每次切分支后必须立刻 `git status --short` 复核，见到 `D` 马上 restore。**
- 提交后 git 后台 `geometric-repack` 可能报 `renaming pack ... File exists`，
  用 `git -c gc.auto=0 -c maintenance.auto=false <cmd>` 规避；不影响提交对象。
- 后端 8080 未运行时系统代理会返回 502；`curl` 用 `localhost` 会命中代理，
  需用 `127.0.0.1` 并加 `--noproxy '*'`。vite 需显式 `--host 127.0.0.1`。

## 四、视觉类改动必须实测截图

纯逻辑测试抓不到渲染层错误（本次绕序 bug、悬空 bug、右栏塌陷都是截图才发现的）。
配方见用户级技能 `webgl-headless-screenshot`（3D/WebGL）与 `spa-stub-visual-review`（SPA + 数据桩）。
