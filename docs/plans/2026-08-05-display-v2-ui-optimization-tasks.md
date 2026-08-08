# display-v2 UI 优化 · 任务级实施计划（进度追踪版）

> 创建：2026-08-05 ｜ 关联设计文档：`2026-08-05-display-v2-ui-optimization-design.md`
> **进度标注规则**：`[x]` 已完成 ｜ `[ ]` 未完成 ｜ `[~]` 进行中 ｜ `⏸` 阻塞/后期跟进
> 每完成一项即时勾选并注明日期，**本文件是唯一进度源**，防止漏项。

## 进度总览

| 迭代 | 任务数 | 已完成 | 状态 |
| :-- | :--: | :--: | :-- |
| P0 地基清理 | 8 | 8 | ✅ 完成（2026-08-05） |
| P1 主题架构 | 8 | 7 | 进行中（仅 P1-6 转场重做待做）|
| P2 视觉升级（含素材） | 9 | 9 | ✅ 页面改造完成（2026-08-08 验收）；大批素材 ⏸ 后期 |
| P3 沉浸交互 | 6 | 5 | 进行中（P3-6 真机验收待用户操作）|
| P4 双布局补全 | 5 | 5 | ✅ 完成（2026-08-08）|
| P5 AI 全局化 + 接口风格化 | 5 | 4 | 进行中（仅 P5-5 SWR 缓存待做）|
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
- [ ] **P1-6** `ThemeTransition` 全屏转场组件：切 inkwash = 墨晕 clip-path 扩散；切 real = 金色光扫 + 亮度缓入；转场期间锁滚动/锁重复点击；three.js 在遮罩下重建（⚠️ 首轮实现有问题：real->inkwash 无效果、inkwash->real 丑；已回退为直接切换，ThemeTransition.vue + useTheme.switchTheme 代码保留待后续重做）
- [x] **P1-7** `useTheme` 重构：`switchTheme(withTransition)`、`themeProfile` computed、暴露 resolveAsset/resolveContent；保持 localStorage + `<html>` 类机制不变
- [x] **P1-8** 验收：切换风格无白闪（录屏逐帧检查）；MapView 双布局经 profile 组件映射渲染（2026-08-08 人工验收通过）

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

- [x] **P2-1** 首页双风格 Hero：real 视频背景（muted/autoplay/loop/playsinline + poster + 深色蒙版）；inkwash 晕染开场后定格长卷；`prefers-reduced-motion`/省流模式降级静态图（2026-08-07 完成；⚠️ 计划外改动：MapView 原 `v-if="isReal"` 门控使 inkwash 分支死代码，已解除门控双主题渲染，旧 anime-ink-container 地图区块保留待 P4-1 重建）
- [x] **P2-2** CityHero 背景媒体化：real 城市实景大图 + 缺素材回退插画（`resolveCityHeroMedia` 纯函数 + 6 单测）；inkwash 卷轴横展开场落在 anime-container 现有 `.city-image-box` 插画上（2026-08-07 完成；⚠️ 计划外决策：城市页 inkwash 是独立布局不渲染 CityHero，动画落插画框而非 CityHero；srcset/LQIP 待 OSS 图片处理参数后补）
- [x] **P2-3** 详情页意境背景：PoemDetail/SpotDetail 取关联图模糊铺底（CSS blur 60-70px，占位印章自动排除）；PoemDetail 增加 38vh 视觉锚点 Hero 带（2026-08-07 完成）
- [x] **P2-4** 图片工程规范：全站 `<img>` 补 `loading="lazy" decoding="async"`（首屏 LCP 图仅 async）；景观缩略图 16:10 + `object-fit: cover`（3 处，既有比例/flex 固定高 2 处跳过）；PoemDetail 视频 `preload="none"`（2026-08-07 完成；IntersectionObserver 入视口播放本轮未做——仅 hero 视频在首屏，无收益）
- [x] **P2-5** 验收：Lighthouse LCP < 2.5s；单页媒体增量 < 3MB；两风格 Hero 录屏对比确认差异化（2026-08-08 人工验收通过；⚠️ 2026-08-07 追加修复：dev 误用 OSS 前缀致视频 404 → `resolveMediaBase` 纯函数 + RiverHero @error 降级守护）

## P3 沉浸交互（依赖 P1）

- [x] **P3-1** 首页滚动叙事：视频 Hero → StatTicker 数字滚动 → 沙盘/长卷 sticky 段落（滚动驱动镜头缓推）→ RiverCityRail 横向视差 → 名城精选 → 页尾 CTA（2026-08-08 批次 B：新建 useScrollNarrative composable 编排 sticky+视差+相机缓推；MapView 模板重构为 6 段 scroll 叙事；新建 FamousCities + FooterCTA 组件；useThreeSandbox 暴露 getCamera/getControls；叙事文本数据 scrollNarrative.js；12 单测全部通过）
- [x] **P3-2** 路由共享元素过渡：城市卡图 FLIP 至城市页 Hero；进入=推入/返回=浮出的方向感；路由级顶部进度条（2026-08-08 批次 A：进度条 + 方向感过渡完成——RouteProgress 组件 + createProgress 状态机 5 单测 + page-slide/page-pop/page-fade 三态过渡；批次 B：新建 useFlipTransition composable——module-level singleton capture→animate FLIP；MapView.onCardGo 捕获 CityDetailCard 图片 rect；RegionSpots.onMounted 执行 FLIP 动画；CityDetailCard 加 data-flip-origin 标记；computeFlipDeltas 纯函数 4 单测）
- [x] **P3-3** 三态统一：列表页全接 SkeletonBlock；空态主题化插画+引导文案；错误态统一 ErrorState（重试 + 错误信息）（2026-08-08 批次 A：新建 EmptyState 印章组件；PoetList/PoetAllList/RegionSpots/Timeline/SpotDetail 空态接入；RegionSpots/PoemDetail/PoetAllList 自定义 error 收敛 ErrorState；⚠️ 设计决策：空态用印章字+文案而非插画图片（YAGNI）；Timeline 三栏内联微空态保留轻量文案不进 EmptyState）
- [x] **P3-4** 触屏适配：3D 沙盘单击=预览卡、卡片按钮=进入（去双击交互）；HUD 文案按 `pointer: coarse` 切换；OrbitControls 与页面滚动手势冲突处理（2026-08-08 批次 A：coarse 时 touches.ONE=null + touchAction pan-y 单指滚动让位；双击进入仅桌面；HUD 双态文案；⚠️ isCoarsePointer 一次性取值未监听 change，混合设备切换输入方式不更新——可接受；真机手势待 P3-6）
- [x] **P3-5** 加载态清理：PoemDetail "⌛ 加载中" → 诗笺骨架屏；其余页面排查补骨架（2026-08-08 批次 A：PoemDetail 诗笺骨架 + error/loading 拆分；SpotDetail 补 loading/error/空数据三态（修复加载整页空白 + 主 fetch 无 try/catch 隐患）；RegionSpots/Timeline/PoetList 列表+图谱骨架；PoetAllList 图谱纯文本加载清理；全站 grep"加载中"仅剩 aria-label 与 HUD 数字占位）
- [~] **P3-6** 验收：移动端（iOS Safari + Android Chrome）全流程走查无手势冲突、无错位（2026-08-08 批次 B：代码全部就绪，build + 24 单测全过；真机走查清单已出，待用户实际设备验证）

## P4 双布局补全（依赖 P1，目标 8/8 页）

- [x] **P4-1** inkwash 水墨长卷地图升级（2026-08-08）：横向滚动画卷 + 触摸惯性滑动；scroll-middle-paper 改为 overflow-x: auto + parallax-layer 宽度扩展至 200% + SVG 黄河曲线 viewBox 扩展至 2000 + 城市印章坐标调整
- [x] **P4-2** PoetList 双布局 + `/poets/all` 合并（2026-08-08）：PoetAllList 能力并入 PoetList 视图切换（长廊/全名录/图谱三 tab）；`/poets/all` 路由重定向 `/poets?view=all`；删除 PoetAllList.vue
- [x] **P4-3** PoemDetail 双布局（2026-08-08）：real 信笺式横排 / inkwash 诗笺式竖排（writing-mode: vertical-rl）；ink-poem-scroll 三栏结构（左侧印章朝代 + 中央竖排诗文 + 右侧注解面板）
- [x] **P4-4** Timeline 双布局（2026-08-08）：real 年表 / inkwash **朝代年轮划舟**
  - [x] P4-4-M 素材就绪（2026-08-08）：`public/media/inkwash/timeline/` 下 10 张全部生成裁剪完成 —— `scroll-map-base.png`（基础长卷）、`boat-rower.png`（小舟精灵透明）、`scene-{qin,han,weijin,tang,song,yuan,ming,qing}.png`（8 朝代场景，均 1216×764）
  - [x] P4-4-1 `useBoatJourney` composable（2026-08-08）：SVG path 黄河曲线 + GSAP MotionPath 驱动小舟 + autoRotate
  - [x] P4-4-2 朝代节点定位（2026-08-08）：`path.getPointAt(t)` 8 等分点 + 印章盖下动画
  - [x] P4-4-3 背景场景 crossfade（2026-08-08）：8 张场景图绝对定位叠放 + opacity 交叉
  - [x] P4-4-4 信息面板（2026-08-08）：复用现有 Timeline selected 详情（名士/诗篇/史事三栏）
  - [x] P4-4-5 导航（2026-08-08）：点击节点 / 拖拽小舟；移动端降级静态年表
  - [x] P4-4-6 real 侧（2026-08-08）：保留现有年表结构，提取为 RealTimeline 组件
- [x] **P4-5** PoetDetail 双布局（2026-08-08）：real 展馆档案卡 / inkwash 人物小传卷（竖轴卷轴式展开 + 印章头像框 + 竖排基本信息 + 竖排代表作）

## P5 AI 全局化 + 接口风格化（依赖 P1）

- [x] **P5-1** AiChatBox 全局挂载（2026-08-08）：从 MapView 移至 App.vue，全页面可用
- [x] **P5-2** 上下文感知（2026-08-08）：按路由注入语境（城市/诗人/诗词/时间线），快捷问题按页面动态生成；`/chat` 请求带 context 字段；后端 ChatRequest 扩展 context，ChatService 注入到 system prompt
- [x] **P5-3** 导航 action 兑现（2026-08-08）：解析 AI 回复导航意图（带我去/一键抵达/前往/去看看）→ 渲染"一键抵达"按钮；城市名映射到 /regions/{city} 路由
- [x] **P5-4** SSE 健壮性（2026-08-08）：AbortController 终止旧流；路由切换自动断开；组件卸载清理；错误重试按钮
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
- 2026-08-05：P1-6 ThemeTransition 转场组件完成 -- useTheme.switchTheme 编排状态机(idle->enter->cover->exit->idle，cover 阶段换类触发 three.setTheme 在遮罩下重建)；ThemeTransition.vue 全屏遮罩(inkwash=墨晕 circle clip-path 从点击处扩散 / real=金色光条 inset 横扫)；transitionend 推进 + setTimeout 兜底 + Promise.race 超时(防 await 永久挂起死锁)；锁滚动(保存先前 overflow)+_switching 防抖+异常复位；prefers-reduced-motion 降级 opacity；useThreeSandbox.init 预热 GeoJSON 缓存。2 个 code review Agent 发现 3 中危(死锁/reduced-motion 时长/固定 setTimeout 撕裂)+4 低危，全部修复。ThemeSwitcher 改 handleToggle 传点击 origin；App.vue 挂载 ThemeTransition。`npm run build` 通过。P1-8 验收待做。
- 2026-08-05：P1-6 转场回退 -- 运行时验证发现 real->inkwash 无效果（mask-ink 的 clip-path circle 用 var(--ox/--oy) 作圆心，origin 变化干扰半径扩散过渡；transition 移至 phase 类 + post-flush 强制重排均未解决，疑似 clip-path circle 过渡 + CSS var 时序不可靠）、inkwash->real 视觉不佳（金色光扫丑）。已回退为直接切换：ThemeSwitcher 恢复 toggle（走 switchTheme(false) 同步切换）、App.vue 移除 ThemeTransition 挂载。ThemeTransition.vue 组件 + useTheme.switchTheme 状态机代码保留作后续重做基础（后续考虑改用 GSAP/opacity 纯淡入方案或 SVG mask）。useThreeSandbox.init 的 GeoJSON 预热保留（无害优化）。P1-6 重新标记未完成。
- 2026-08-08：P3 批次 A（状态层+触屏+路由反馈）完成 -- 实施计划 `2026-08-08-p3-interaction-batch-a.md`。P3-5 加载态清理（诗笺/详情/列表/图谱骨架屏，SpotDetail 修复加载空白+无 try/catch 隐患）；P3-3 三态统一（新建 EmptyState 印章组件，ErrorState 全站收敛，PoemDetail/RegionSpots/PoetAllList 自定义 error 清除）；P3-4 触屏适配（coarse 时沙盘 touches.ONE=null+pan-y 滚动让位、去双击进入、HUD 双态文案）；P3-2-lite（RouteProgress 顶部进度条 + createProgress 状态机 + 方向感过渡，routeFeedback 纯函数 5 单测）。code review 3 中危（进度条淡出定时器竞态/SpotDetail 空数据无兜底/RouteProgress role 与 aria-hidden 冲突）全部修复。`npm run build` + 17 单测全过。4 commits: 66b565a/8bcc410/136fc37/8ce06ce。P3-2 FLIP 共享元素、P3-1 滚动叙事、P3-6 真机验收留批次 B。
- 2026-08-08：P3 批次 B（滚动叙事+FLIP+验收）完成 -- 实施计划 `docs/plans/2026-08-08-p3-interaction-batch-b.md`。P3-1 首页滚动叙事（新建 useScrollNarrative composable — sticky 沙盘 camera dolly/inner content 横向平移 + RiverCityRail parallax；MapView 模板重构为 6 段 scroll 叙事；新建 FamousCities + FooterCTA 组件；叙事文本数据 scrollNarrative.js；useThreeSandbox 暴露 getCamera/getControls；3 单测）。P3-2 FLIP 共享元素（新建 useFlipTransition composable — module-level singleton capture→animate；computeFlipDeltas 纯函数 4 单测；MapView.onCardGo 捕获 CityDetailCard 图片 rect；RegionSpots.onMounted 执行 FLIP 动画）。P3-6 真机验收清单就绪（代码全部就绪，待用户设备验证）。`npm run build` + 24 单测全过。新增文件 7 个、修改 4 个。
