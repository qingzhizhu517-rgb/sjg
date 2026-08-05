# display-v2 全面体检报告与整体优化设计方案

> 日期：2026-08-05 ｜ 范围：`display-v2/`（用户端，Vue 3 + Vite）｜ 状态：**方案待评审，未动代码**
> 评审依据：UI/UX Pro Max 设计审查框架 + Superpowers Brainstorm → Plan 流程

---

# 第一部分：现状体检报告

## 0. 架构现状速览

| 维度 | 现状 |
| :--- | :--- |
| 技术栈 | Vue 3.5 + vue-router 4 + Vite 8，GSAP(ScrollTrigger)、Three.js(3D 沙盘)、ECharts(情感曲线)、G6(关系图谱) |
| 页面 | 8 个视图：MapView(首页/地图)、PoetList、PoetAllList、PoetDetail、PoemDetail、RegionSpots、SpotDetail、Timeline |
| 双主题 | `useTheme.js`：`real`(写实博物馆风) / `inkwash`(水墨风)，localStorage 持久化，`<html>` 挂主题类 |
| 主题实现 | 双层：token 层（variables.css / inkwash.css）+ 布局层（仅 MapView、RegionSpots、SpotDetail 有 v-if/v-else 双布局） |
| 数据 | axios → `/api/public/*`；**后端实体已含双风格字段**（`imageUrl`/`imageAnimeUrl`、`avatarUrl`/`avatarAnimeUrl`，见 docs/data_interfaces.md），但前端未直接使用 |
| AI | AiChatBox（SSE `/api/public/chat`），**仅挂载在 MapView** |

---

## 1. 视觉效果 · 问题清单

| # | 问题 | 位置 | 严重度 |
| :- | :--- | :--- | :-- |
| V1 | **全站无任何视频背景**。唯一视频是 PoemDetail 内诗词赏析播放器；所有 Hero 为静态图或纯 CSS | 全局 | ★★★（与目标直接冲突） |
| V2 | 首页 Hero（RiverHero）仅一张国画 PNG + 纯色底，无层次、无视差、无氛围层 | `homepage/RiverHero.vue` | ★★★ |
| V3 | inkwash 主题地图区"远山"为 CSS 渐变块，黄河为 SVG 虚线 — 与 real 主题精雕 Three.js 沙盘相比**品质落差悬殊**，切换风格像"降级" | `MapView.vue` L131-199 | ★★★ |
| V4 | **图片资源体系失控**：`useImage.js` 硬编码 24 个文件白名单（L36-61），新图必须改代码；白名单缺失时 placeholder 一律用李白图兜底 — 会造成"满屏李白"的语义错误 | `composables/useImage.js` | ★★★ |
| V5 | **后端双风格图片字段被绕开**：后端返回 `imageUrl`/`imageAnimeUrl`，前端却用字符串替换 `.jpg→_anime.jpg` 猜测路径 | `useImage.js` L65-67 | ★★★ |
| V6 | 本地图量失衡：spots 水墨图 12 张 vs 实景图仅 3 张 → real 主题大量卡片 fallback 到 placeholder | `public/images/spots/` | ★★ |
| V7 | 10 张城市插画（`src/assets/illustrations/01~09-city-*.png`）仅城市页使用，首页/其他页未复用，资产利用率低 | `assets/illustrations/` | ★ |
| V8 | 字体加载浪费：index.html 全局加载 Ma Shan Zheng + Outfit 共 5 档字重，但 token 体系未引用；LXGW WenKai 又在 variables.css 里二次 @import | `index.html` L13 / `variables.css` L1 | ★★ |
| V9 | 对比度不达标：`--text-muted #9B8B7F` 于 `#FDFAF5` 底 ≈ 3.3:1，低于 WCAG AA 4.5:1；朱砂 `#C23A2B` 小字白底 ≈ 4.0:1 边缘 | token 层 | ★★ |
| V10 | `style.css` 是**死文件**（无 import），且引用未定义 token（`--bg`、`--shadow-sm/md`），属于残留技术债 | `src/style.css` | ★ |

## 2. 页面布局 · 问题清单

| # | 问题 | 位置 | 严重度 |
| :- | :--- | :--- | :-- |
| L1 | MapView.vue **2338 行单文件**：双布局模板 + Three.js 引擎 + 数据加载全耦合，无法维护/测试 | `views/MapView.vue` | ★★★ |
| L2 | 双布局覆盖面不全：仅 3 个视图有差异化布局；PoetList/PoetAllList/Timeline/PoemDetail/PoetDetail 双主题只是换皮，"风格切换"感知弱 | 5 个视图 | ★★★ |
| L3 | `/poets` 与 `/poets/all` 功能高度重叠（均为长廊+图谱），但 `/poets/all` 无导航入口，属僵尸路由 | `router/index.js` L7 | ★★ |
| L4 | PoemDetail 无 Hero、无视觉锚点，纯文字卡片流，详情页体验单薄 | `views/PoemDetail.vue` | ★★ |
| L5 | Footer 仅两行文字，无站点地图/导航回响，长页结束突兀 | `App.vue` L148-154 | ★ |
| L6 | 移动端：3D 沙盘标签牌点击热区小、OrbitControls 与页面滚动手势冲突未处理；inkwash 印章点位固定百分比定位，小屏会错位重叠 | `MapView.vue` | ★★ |
| L7 | 栅格/容器宽度不统一：header 1400px、`.container` 1200px、各页自写 max-width，视觉边界漂移 | 全局 | ★ |

## 3. 功能布局 · 问题清单

| # | 问题 | 位置 | 严重度 |
| :- | :--- | :--- | :-- |
| F1 | **AiChatBox 只挂在 MapView** — 进入任何其他页面 AI 助手消失，体验断层 | `MapView.vue` L205 | ★★★ |
| F2 | mock 数据定位错乱：`mockCities`/`mockSpots` 被 MapView、RegionSpots、SpotDetail 当作**默认展示数据**（城市简介/历史/玩法全写死），与后端真实数据并存，同一城市两种说法；`mockFallbackDb.js` 定义后无人引用（死代码） | `config/mockDetailData.js` 等 | ★★★ |
| F3 | 无数据缓存：每次进页面重拉 `/poets?size=200`、GeoJSON 虽有缓存但其余接口无；路由来回切换 loading 反复 | `api/index.js` 层 | ★★ |
| F4 | 错误处理三套各自实现（MapView errorMsg / RegionSpots error-state / PoemDetail error-state），ErrorState 组件存在却少被使用 | 各视图 | ★★ |
| F5 | AiChatBox：SSE 无 AbortController，路由切换/连续提问时旧流不终止；quickList 中"带我去泰山一键抵达"承诺了导航能力但未实现 | `AiChatBox.vue` | ★★ |
| F6 | 主题切换瞬间完成：three.js 场景销毁重建、canvas 白闪 150ms+、图片路径突变 — 切换是"硬切"不是"转场" | `useTheme.js` + `MapView.vue` L1270 | ★★★ |

## 4. 交互逻辑 · 问题清单

| # | 问题 | 位置 | 严重度 |
| :- | :--- | :--- | :-- |
| I1 | 大量卡片用 `<article @click>` 无 `tabindex`/键盘事件/role — 键盘与读屏用户不可达 | PoetList、RegionSpots、SpotDetail 等 | ★★★（a11y） |
| I2 | 全站无 `:focus-visible` 焦点样式体系，键盘导航不可见 | 全局 | ★★★（a11y） |
| I3 | 3D 沙盘"双击进入城市"：移动端没有双击心智，HUD 提示文案也不区分触屏 | `MapView.vue` L1004 | ★★ |
| I4 | 路由过渡仅一个简单 fade（page-slide），无共享元素过渡、无路由级进度提示，页面间"跳切"感强 | `App.vue` L226 | ★★ |
| I5 | 滚动揭示靠各页面手动调用 `useReveal.reveal()`，PoetDetail/PoemDetail/SpotDetail 等详情页未接入，动效不一致 | `composables/useReveal.js` | ★ |
| I6 | 加载态不统一：有 SkeletonBlock 组件但 PoemDetail 用"⌛ 加载中..."全文占位，其余页面多为空白 | 各视图 | ★★ |
| I7 | 3D 每帧重建 labels 响应式数组（每帧 9 城 × find），虽量小但属可避免的响应式开销；低性能降级仅覆盖河流 shader | `MapView.vue` L1174-1202 | ★ |

## 5. 体检结论一句话

> 骨架（双主题 token + 双布局 + Three.js + 双风格数据字段）已经搭好，但**资源层（图片/视频缺失）、组件层（双布局覆盖 3/8 页）、接口层（双风格字段被绕开）、切换层（硬切无转场）四个环节断裂**，导致"双风格"目前 = 换色 + 部分换图，离"两套独立沉浸体验"差距明显。

---
---

# 第二部分：整体优化设计方案

## 设计总纲

```
一个内核（共享数据与路由）
两套皮肤叙事（real = 数字文博馆 / inkwash = 水墨长卷）
三层注入点（资源 manifest / 布局组件映射 / 数据适配器）
一次仪式化转场（风格切换 = 全屏过渡动画）
```

---

## 目标一：视觉效果提升（冲击力 + 品质感 + 视频/图片背景）

### 1.1 双风格视觉定位（差异化要"叙事级"，不是换色）

| | **real · 数字文博馆** | **inkwash · 水墨长卷** |
| :--- | :--- | :--- |
| 一句话 | 走进一座关于黄河文学的现代博物馆 | 展开一幅可游可居的手绘山水长卷 |
| 底色 | 暖纸白 #FDFAF5 + 暗金 #B8860B | 宣纸米 #F4EFE4 + 朱砂 #C23A2B |
| 质感 | 摄影实景、玻璃拟态、精细阴影、金属描边 | 宣纸纹理、墨色晕染、印章、飞白笔触 |
| 字体 | Noto Serif SC（庄重）+ Outfit（西文数字） | LXGW WenKai（楷意）+ Ma Shan Zheng（标题点睛） |
| 动效性格 | 沉稳缓入、光影浮动（博物馆射灯感） | 晕染扩散、卷轴展开、笔触书写感 |
| 背景媒体 | **航拍/实景视频**（黄河、泰山、大明湖） | **水墨动态长卷**（AI 生成循环水墨视频或分层视差画卷） |

### 1.2 背景媒体运用方案

**A. 首页 Hero（两风格各一版）**
- real：黄河入海口航拍循环视频（8-15s，muted/autoplay/loop/playsinline），上叠 40% 深色渐变蒙版 + 金色细线框，标题压其上。`poster` 用现有国画 PNG；`prefers-reduced-motion` 与移动端数据节省模式下自动降级为静态图。
- inkwash：水墨晕染开场 —— 静态宣纸底 + 一段"墨色晕开"的短视频（或 Lottie/WebGL 晕染 shader），随后定格为长卷；长卷本身做成 **分层视差**（远山/河/近景印章三层，沿用现有 mousemove 视差但升级为 GSAP 平滑插值）。

**B. 城市页 Hero（CityHero）**
- real：该城市代表景观实景大图/短视频做全宽背景（srcset 响应式 + blur-up LQIP）。
- inkwash：复用现有 `assets/illustrations/01~09-city-*.png` 城市插画，做成"卷轴横展"开场动画。

**C. 详情页氛围层**
- PoemDetail/SpotDetail 增加"意境背景"：取该诗/景关联图片，超大尺寸 + 高斯模糊 + 低透明度铺底（CSS `filter: blur(60px)` 或 OSS 图片处理参数），零额外下载成本，品质感立升。

**D. 图片工程规范（一并解决 V4-V7）**
1. **删掉 `useImage.js` 白名单**：改为 `import.meta.glob` 构建期自动注册本地图 + 后端字段直读：
   ```js
   resolveImage(entity, theme) // 优先 entity.imageAnimeUrl / imageUrl（按主题），
                               // 其次 OSS 约定路径 {slug}_ink.jpg / {slug}.jpg，
                               // 最后主题化 SVG 占位（印章"文"/"景"字，不再用李白图）
   ```
2. 占位图改为**主题化生成占位**（SVG 印章 + 名称首字），消灭"满屏李白"。
3. 全部 `<img>` 加 `loading="lazy" decoding="async"`；列表图统一裁切比例（16:10）与 `object-fit: cover`；补拍/补齐 real 主题实景图缺口（当前 3 vs 12）。
4. 视频统一走 OSS + `preload="none"` + IntersectionObserver 入视口才加载播放。

### 1.3 视觉规范修正
- 提升 `--text-muted` 对比度至 ≥4.5:1（real: #8A7A6C → 建议 #7D6E60；inkwash 同步校验）；朱砂用于小字时加深到 `#A93226`。
- 清理死文件 `style.css`、`mockFallbackDb.js`；字体按需加载（index.html 只留实际使用的家族与字重，加 `font-display: swap`）。
- 统一容器：全部页收敛到 `--container-max: 1280px` 一档 + 宽屏特型 1440px 一档。

---

## 目标二：沉浸式体验（浏览与交互流程）

### 2.1 仪式化主题转场（解决 F6，是"双风格"的仪式感核心）

切换不再是硬切，而是一次 800ms 左右的全屏转场：
1. 用户点击 ThemeSwitcher → 触发 `ThemeTransition` 全屏遮罩组件；
2. **切向 inkwash**：以点击处为圆心，墨色圆形 `clip-path` 晕开扩散铺满屏幕（配合宣纸纹理），扩散中段切换主题类与资源；
3. **切向 real**：金色光线扫过 + 画面从"卷轴收起"过渡到"展馆灯亮"（brightness/饱和度缓动）；
4. 技术要点：转场遮罩内**预置目标主题首帧截图/主色**，避免白闪；MapView 的 three.js 场景在遮罩保护下销毁重建，用户无感知；转场期间锁定滚动与重复点击。

### 2.2 滚动叙事升级（首页）

首页从"Hero + 地图 + 城市栏"的堆叠，改为"沿河而下"叙事流：
`视频 Hero → 数据 ticker（已有 StatTicker，加数字滚动）→ 3D 沙盘/水墨长卷（sticky 段落，滚动驱动镜头缓推）→ 九城 RiverCityRail（横向滚动带，scroll-driven 视差）→ 名城精选 → 页尾 CTA`。
工具：现有 GSAP + ScrollTrigger 即可，不引入新库。

### 2.3 路由与微交互编排
- 路由过渡编排化：列表卡片 → 详情页的**共享元素过渡**（城市卡图片 FLIP 到城市页 Hero 图）；方向感区分（进入详情 = 推入，返回 = 浮出）。
- 全局补齐 `:focus-visible` 金色/朱砂焦点环；所有可点击卡片改为 `<a>/<button>` 语义或补 `tabindex + keydown(Enter/Space) + role="link"`。
- 触屏适配：3D 沙盘改为"单击 = 预览卡，卡片内按钮 = 进入"；inkwash 卷轴支持横向触摸滑动；HUD 文案按 `pointer: coarse` 切换。
- 加载/空/错三态统一：所有列表页接入 SkeletonBlock；空态用主题化插画 + 引导文案；错误态统一走 ErrorState（含重试按钮与错误码上报）。

### 2.4 AI 小文全局化与上下文感知（解决 F1/F5）
- AiChatBox 上移到 `App.vue` 全局挂载；
- **上下文注入**：按当前路由自动带上语境（城市页 → "正浏览济南"，详情页 → 实体 ID 传给 `/chat` 的 context 字段），快捷问题按页面动态生成；
- 兑现"带我去泰山"：AI 回复中解析导航意图，返回结构化 action（`{type:'navigate', target:'/spots/3'}`），前端渲染为可点击的"一键抵达"按钮；
- SSE 加 AbortController，路由切换/重新提问时终止旧流。

---

## 目标三：双风格切换机制（独立资源 / 交互 / 接口）

### 3.1 总体架构：ThemeProfile 驱动

```
src/themes/
├── real/
│   ├── profile.js        # tokens 引用、字体、动效预设、媒体偏好(video-first)
│   ├── manifest.js       # 本风格资源清单（构建期 glob 自动生成）
│   └── layouts/          # real 专属布局组件（SandboxHero.vue、ExhibitCityHero.vue…）
├── inkwash/
│   ├── profile.js
│   ├── manifest.js
│   └── layouts/          # inkwash 专属布局（ScrollHero.vue、InkMapScroll.vue…）
└── index.js              # resolveProfile(theme) + 组件映射 + 资源解析器
```

页面组件只写**语义结构**，风格差异通过三处注入：

**① 资源层（每风格独立资源）**
```js
// manifest.js 由 import.meta.glob('/public/media/{real,inkwash}/**') 生成
resolveAsset('hero.map', theme)  
// real    → /media/real/hero-map.mp4   (视频优先，poster 兜底)
// inkwash → /media/inkwash/hero-map.jpg (长卷图 + 视差配置)
```
资源命名约定：`{场景}.{实体slug}.{real|ink}.{mp4|jpg|webp}`，OSS 同构。新增素材只放目录，不改代码。

**② 布局/交互层（每风格独立交互逻辑）**
```vue
<component :is="profile.components.MapHero" v-bind="heroProps" />
```
- real 的 MapHero = Three.js 沙盘（拖拽旋转、点击预览、飞行镜头）；
- inkwash 的 MapHero = 水墨长卷（横向卷轴、触摸滑动、印章热点、卷首题跋动画）；
- 两版组件实现同一 props/events 契约（`@select-city`、`stats`），页面无感知。
- 推广范围：当前仅 3/8 页有双布局 → 目标 8/8，优先级：PoetList（长廊 vs 名帖墙）、PoemDetail（信笺 vs 诗笺）、Timeline（年表 vs 年轮卷）、PoetDetail（展馆卡 vs 人物小传卷）、PoetAllList（合并或改造，见 L3）。

**③ 数据接口层（每风格独立数据视图）**

后端实体已有 `imageUrl`/`imageAnimeUrl` 双字段 —— 方案分两步：

- **近期（纯前端，零后端改动）**：新增 `themeAdapter` 中间层 —
  ```js
  // api 响应 → 按当前 theme 投影为单一视图模型
  adaptSpot(spot, theme) => { ...spot, image: theme==='inkwash' ? spot.imageAnimeUrl : spot.imageUrl }
  ```
  组件只消费投影后字段，永远不再碰 `_anime` 字符串 hack。文案类 mock（城市简介等）从 `mockDetailData` 迁移为**按风格分文件的内容包** `content/real/cities.js`（展馆解说词风）与 `content/inkwash/cities.js`（诗意题跋风），实现"文案也分风格"。
- **远期（建议后端配合）**：
  1. 接口支持 `?style=real|inkwash` 维度，返回该风格的图片/文案/BGM/视频字段，减少载荷；
  2. 新增 `/api/public/theme-assets?style=` 下发风格化全局资源（Hero 视频 URL、背景乐、纹理），替代前端硬编码路径；
  3. 管理端 admin-frontend 增加双风格素材上传位（数据模型已支持，只需 UI 暴露）。

**缓存与切换流畅性**
- SWR 缓存键带风格维度：`['spots', region, theme]`，切换风格时若已有缓存则**零 loading 瞬时呈现**，后台静默校验；
- 空闲时（`requestIdleCallback`）预取另一风格的首屏关键资源（Hero 媒体 poster、首屏图片），配合 2.1 的转场遮罩，切换主观延迟 ≈ 0。

### 3.2 useTheme 重构要点
- 保持现有 localStorage + `<html>` 类机制（已验证可靠）；
- 新增：`themeProfile` computed（暴露当前 profile）、`switchTheme(withTransition=true)`（编排转场 → 换类 → 资源预取）、`resolveAsset/resolveContent` 两个解析器；
- `imageFor()` 废弃，由 `themeAdapter` + `resolveAsset` 取代。

---

## 实施路线图（建议 6 个迭代，每个独立可交付）

| 迭代 | 内容 | 对应问题 | 依赖 |
| :-- | :--- | :--- | :--- |
| **P0 地基清理** | 删死文件；对比度/字体/容器规范修正；`useImage` 重写（读后端双字段 + glob 注册 + 主题化占位）；卡片语义化与 focus 体系 | V4/V5/V8/V9/V10、L7、I1/I2 | 无 |
| **P1 主题架构** | ThemeProfile/manifest/adapter 三层落地；MapView 拆分（Three.js 引擎抽为 composable）；转场组件 | F6、L1、I7 | P0 |
| **P2 视觉升级** | 首页双风格 Hero 媒体（视频/水墨）；CityHero 背景媒体；详情页意境背景；图片工程规范全量落地 | V1-V7、L4 | P1 + 素材到位 |
| **P3 沉浸交互** | 滚动叙事首页；路由共享元素过渡；三态统一；触屏适配 | I3-I6、L6 | P1 |
| **P4 双布局补全** | PoetList/PoemDetail/Timeline/PoetDetail 双风格布局；`/poets/all` 合并为 `/poets?view=all` 全览模式 | L2/L3 | P1 |
| **P5 AI 全局化 + 接口风格化** | AiChatBox 全局 + 上下文 + 导航 action；SWR 缓存；与后端对齐 `?style=` 与 theme-assets 接口 | F1/F2/F3/F5 | P1，后端排期 |

**素材策略（按决策 1）**：本轮 AI 生成**典型案例** —— real 黄河航拍 hero 视频 1 段、inkwash 水墨晕染开场视频 1 段、inkwash 水墨长卷 hero 图 1 张、real 实景补图 3 张（三孔/黄河入海口/光岳楼），存 `public/media/{real,inkwash}/` 本地测试；其余大批量素材（九城实景图全套、各景点视频、环境音）已列入任务文档 P2-MEDIA 批次，后期批量生成并由用户手动上 OSS。

---
*决策已定稿，任务级实施计划（带完成/未完成进度标注）见同目录 `2026-08-05-display-v2-ui-optimization-tasks.md`。经确认后按 Superpowers 流程进入 TDD 开发。*

## 决策记录（2026-08-05 已拍板 ✅）

1. **视频素材** → **AI 生成**。本轮先生成典型案例（视频 + 图片）存入 `display-v2/public/media/{real,inkwash}/` 本地测试；大批量素材**只写入任务计划，后期批量生成**；后期由用户手动上传 OSS，前端路径约定保持 OSS/本地同构，切换零改代码。
2. **接口风格化** → **本轮纯前端 adapter 落地**（themeAdapter + manifest + 内容包），后端 `?style=` 与 theme-assets 接口**下期跟进**。进度管理要求：任务计划每项标注完成/未完成状态 → 见配套任务文档 `2026-08-05-display-v2-ui-optimization-tasks.md`。
3. **`/poets/all` 去留** → **合并进 `/poets`**：作为"全览模式"（名录总表视图切换项），`/poets/all` 路由重定向至 `/poets?view=all`，删除 PoetAllList 冗余实现（1639 行），其独有能力（全名录 + 关系图谱）并入 PoetList 的视图切换。
4. **性能预算** → **认可基线**：首屏 LCP < 2.5s；单页媒体增量 < 3MB（视频 `preload="none"` 惰性加载不计入）；低端机与 `prefers-reduced-motion` 自动降级静态图。
5. **inkwash 地图** → **升级为可横滑长卷**：横向滚动画卷（触摸滑动 + 惯性）、印章热点、卷首题跋展开动画，替代现有固定百分比定位的静态布局（同时解决移动端错位问题 L6）。

---
*本方案经评审确认后，将按 Superpowers 流程拆分为任务级实施计划（TDD），再进入开发。*
