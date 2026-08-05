# display-v2 UI 优化 · 任务级实施计划（进度追踪版）

> 创建：2026-08-05 ｜ 关联设计文档：`2026-08-05-display-v2-ui-optimization-design.md`
> **进度标注规则**：`[x]` 已完成 ｜ `[ ]` 未完成 ｜ `[~]` 进行中 ｜ `⏸` 阻塞/后期跟进
> 每完成一项即时勾选并注明日期，**本文件是唯一进度源**，防止漏项。

## 进度总览

| 迭代 | 任务数 | 已完成 | 状态 |
| :-- | :--: | :--: | :-- |
| P0 地基清理 | 8 | 8 | ✅ 完成（2026-08-05） |
| P1 主题架构 | 8 | 6 | 进行中（P1-6/8 待做）|
| P2 视觉升级（含素材） | 9 | 4 | 典型案例素材已生成，页面改造未开始 |
| P3 沉浸交互 | 6 | 0 | 未开始 |
| P4 双布局补全 | 5 | 0 | 未开始 |
| P5 AI 全局化 + 接口风格化 | 5 | 0 | 未开始 |
| 后端下期跟进（⏸ 占位） | 3 | 0 | 阻塞·等排期 |

---

## P0 地基清理（无依赖，可立即开工）

- [x] **P0-1** 删除死文件：`src/style.css`（无 import 且引用未定义 token）、`src/config/mockFallbackDb.js`（无引用）
- [x] **P0-2** 字体瘦身：`index.html` 移除未用家族/字重（Ma Shan Zheng 仅留 inkwash 标题用、Outfit 留 3 档），`variables.css` 的 LXGW @import 收敛到 inkwash.css；全部加 `font-display: swap`
- [x] **P0-3** 对比度修正：`--text-muted` real `#9B8B7F→#6E5D52`、inkwash 同步校验；朱砂小字色 `#C23A2B→#A93226`；全站文本复测 ≥ WCAG AA 4.5:1
- [x] **P0-4** 容器统一：新增 `--container-max: 1280px`，header/footer/各页 max-width 全部收敛
- [x] **P0-5** 重写 `useImage.js`：删除 24 项硬编码白名单 → `import.meta.glob` 构建期注册本地图；**直读后端双字段** `imageUrl/imageAnimeUrl`、`avatarUrl/avatarAnimeUrl`（按主题）；占位改主题化 SVG 印章（首字"文/景"），**禁用李白图兜底**
- [x] **P0-6** 卡片语义化：PoetList/RegionSpots/SpotDetail 等 `<article @click>` → 语义化 `<router-link>` 或补 `tabindex="0" + @keydown.enter/space + role="link"`
- [x] **P0-7** 全局 `:focus-visible` 焦点环体系（real 金色 / inkwash 朱砂，2px outline + offset）
- [x] **P0-8** 验收：构建通过；`npm run build` 无新警告；键盘 Tab 可走遍全站主要卡片

## P1 主题架构（依赖 P0-5）

- [x] **P1-1** 新建 `src/themes/` 骨架：`real/profile.js`、`inkwash/profile.js`、`index.js`（resolveProfile），profile 内含 tokens 引用、字体、动效预设、媒体偏好（real: video-first / inkwash: scroll-first）
- [x] **P1-2** 资源 manifest：`import.meta.glob('/public/media/{real,inkwash}/**')` 自动生成两风格资源清单；实现 `resolveAsset(key, theme)`，命名约定 `{场景}.{slug}.{real|ink}.{mp4|jpg|webp}`
- [x] **P1-3** themeAdapter：`adaptSpot/adaptPoet/adaptPoem(entity, theme)` 投影双字段为单一视图模型；组件只消费投影字段；废弃 `imageFor()` 与 `_anime` 字符串替换
- [x] **P1-4** 内容包分风格：`content/real/cities.js`（展馆解说词风）+ `content/inkwash/cities.js`（诗意题跋风），迁移 `mockDetailData.js` 城市文案，标注为"待后端数据接管"
- [x] **P1-5** MapView 拆分：Three.js 引擎抽为 `composables/useThreeSandbox.js`（init/dispose/flyTo/raycast 接口），MapView 只留编排；目标单文件 < 600 行
- [ ] **P1-6** `ThemeTransition` 全屏转场组件：切 inkwash = 墨晕 clip-path 扩散；切 real = 金色光扫 + 亮度缓入；转场期间锁滚动/锁重复点击；three.js 在遮罩下重建
- [x] **P1-7** `useTheme` 重构：`switchTheme(withTransition)`、`themeProfile` computed、暴露 resolveAsset/resolveContent；保持 localStorage + `<html>` 类机制不变
- [ ] **P1-8** 验收：切换风格无白闪（录屏逐帧检查）；MapView 双布局经 profile 组件映射渲染

## P2 视觉升级（依赖 P1 + 素材）

### 典型案例素材（本轮 AI 生成 · 本地测试）

- [x] **P2-M1** real 黄河航拍 hero 循环视频 → `public/media/real/hero-map.mp4`（AI 生成 + ffmpeg 压缩 20MB→2.4MB，2026-08-05；附 `hero-map-poster.jpg`）
- [x] **P2-M2** inkwash 水墨晕染开场视频 → `public/media/inkwash/hero-open.mp4`（AI 生成 + 压缩至 585KB，2026-08-05；附 `hero-open-poster.jpg`）
- [x] **P2-M3** inkwash 水墨长卷 hero 图 → `public/media/inkwash/hero-scroll.png`（AI 生成，已裁 AI 水印，1216×764，2026-08-05）
- [x] **P2-M4** real 实景补图 ×3 → `public/media/real/spots/{three_confucius,yellow_river_estuary,guangyue_tower}.png`（AI 生成，已裁水印，2026-08-05）

### 大批量素材（⏸ 后期批量生成，仅登记）

- [ ] **P2-M5** ⏸ 九城实景 hero 图全套（当前缺 6 城）→ 后期批量 AI 生成，用户手动上 OSS
- [ ] **P2-M6** ⏸ 其余 9 处景点 real 实景图补齐（对照 `useImage` 原白名单缺口）
- [ ] **P2-M7** ⏸ 城市页短视频（每城 1 段，9 段）
- [ ] **P2-M8** ⏸ 环境音 2 条（real 展馆氛围 / inkwash 流水古琴），默认静音、手动开启
- [ ] **P2-M9** ⏸ 全部终稿素材上传 OSS + 路径切换验证（`VITE_OSS_BUCKET_URL`）

### 页面改造

- [ ] **P2-1** 首页双风格 Hero：real 视频背景（muted/autoplay/loop/playsinline + poster + 深色蒙版）；inkwash 晕染开场后定格长卷；`prefers-reduced-motion`/省流模式降级静态图
- [ ] **P2-2** CityHero 背景媒体化：real 城市实景大图（srcset + blur-up LQIP）；inkwash 复用城市插画做卷轴横展开场
- [ ] **P2-3** 详情页意境背景：PoemDetail/SpotDetail 取关联图模糊铺底（OSS 图片处理参数或 CSS blur），PoemDetail 增加视觉锚点 Hero
- [ ] **P2-4** 图片工程规范：全站 `<img>` 补 `loading="lazy" decoding="async"`；列表图统一 16:10 + `object-fit: cover`；视频 `preload="none"` + IntersectionObserver 入视口播放
- [ ] **P2-5** 验收：Lighthouse LCP < 2.5s；单页媒体增量 < 3MB；两风格 Hero 录屏对比确认差异化

## P3 沉浸交互（依赖 P1）

- [ ] **P3-1** 首页滚动叙事：视频 Hero → StatTicker 数字滚动 → 沙盘/长卷 sticky 段落（滚动驱动镜头缓推）→ RiverCityRail 横向视差 → 名城精选 → 页尾 CTA
- [ ] **P3-2** 路由共享元素过渡：城市卡图 FLIP 至城市页 Hero；进入=推入/返回=浮出的方向感；路由级顶部进度条
- [ ] **P3-3** 三态统一：列表页全接 SkeletonBlock；空态主题化插画+引导文案；错误态统一 ErrorState（重试 + 错误信息）
- [ ] **P3-4** 触屏适配：3D 沙盘单击=预览卡、卡片按钮=进入（去双击交互）；HUD 文案按 `pointer: coarse` 切换；OrbitControls 与页面滚动手势冲突处理
- [ ] **P3-5** 加载态清理：PoemDetail "⌛ 加载中" → 诗笺骨架屏；其余页面排查补骨架
- [ ] **P3-6** 验收：移动端（iOS Safari + Android Chrome）全流程走查无手势冲突、无错位

## P4 双布局补全（依赖 P1，目标 8/8 页）

- [ ] **P4-1** inkwash 水墨长卷地图升级（决策 5）：横向滚动画卷 + 触摸惯性滑动 + 印章热点 + 卷首题跋展开动画；废弃固定百分比定位（解决移动端错位）；与 real 沙盘同契约（`@select-city`、`stats`）
- [ ] **P4-2** PoetList 双布局 + `/poets/all` 合并：PoetAllList 能力（全名录 + 关系图谱）并入 PoetList 视图切换（长廊/图谱/全览三 tab）；`/poets/all` 路由重定向 `/poets?view=all`；删除 PoetAllList.vue
- [ ] **P4-3** PoemDetail 双布局：real 信笺式 / inkwash 诗笺式（竖排选项）
- [ ] **P4-4** Timeline 双布局：real 年表 / inkwash 年轮卷
- [ ] **P4-5** PoetDetail 双布局：real 展馆档案卡 / inkwash 人物小传卷

## P5 AI 全局化 + 接口风格化（依赖 P1）

- [ ] **P5-1** AiChatBox 移至 App.vue 全局挂载，全页面可用
- [ ] **P5-2** 上下文感知：按路由注入语境（城市/实体 ID），快捷问题按页面动态生成；`/chat` 请求带 context 字段
- [ ] **P5-3** 导航 action 兑现：解析 AI 回复导航意图 → 渲染"一键抵达"按钮（`{type:'navigate', target}`）
- [ ] **P5-4** SSE 健壮性：AbortController 终止旧流；路由切换自动断开；错误重试
- [ ] **P5-5** SWR 缓存：缓存键带 theme 维度（`['spots', region, theme]`）；`requestIdleCallback` 预取另一风格首屏资源；切换风格零 loading

## 后端下期跟进（⏸ 阻塞，不在本轮）

- [ ] **B-1** ⏸ 接口支持 `?style=real|inkwash` 维度返回风格化字段
- [ ] **B-2** ⏸ 新增 `/api/public/theme-assets?style=` 下发风格化全局资源（Hero 视频/BGM/纹理 URL）
- [ ] **B-3** ⏸ admin-frontend 管理端暴露双风格素材上传位（数据模型已支持）

---

### 变更日志
- 2026-08-05：初版创建；P2-M1~M4 典型案例素材生成完成（本地）；5 项决策定稿。
- 2026-08-05：P1 批次 A（主题架构资源/数据/状态层）完成 —— themes 骨架(profile+manifest+resolveAsset) + themeAdapter(adaptSpot/Poet/Poem，迁移 FeaturedPoetCard/FeaturedSpotCard) + content 分风格 cities(real 展馆解说词风 / inkwash 诗意题跋风，迁移 mockCities) + useTheme 重构(themeProfile/switchTheme/resolveAsset/resolveContent，删 imageFor)；`npm run build` 通过。P1-3 enrichment 依赖组件待推广。P1-5 MapView 拆分(2338→<600)、P1-6 转场组件待做。
- 2026-08-05：P1-5 MapView 拆分完成 -- Three.js 引擎(920行)抽为 useThreeSandbox composable(init/dispose/flyToCity/setTheme + onPickCity/onDoublePickCity 回调)；MapView script 1101 降至约 180 行；消除 clickLabel/onPointerDown 重复相机动画(共用 flyToCity)；handleResize 的 isReal 检查改为 renderer&&camera。`npm run build` 通过。总行数 2338 降至 1406（style 1020 占大，<600 总目标受 style 拖累，script 达成；style 拆分另议）。
