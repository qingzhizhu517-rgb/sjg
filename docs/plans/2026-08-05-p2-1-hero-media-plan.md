# P2-1 首页双风格 Hero 改造计划

## 目标
`RiverHero.vue` 从静态图（`00-hero-yellow-river.png`）改为双风格媒体 Hero：
- **real**：全屏视频背景（`hero-map.mp4`）+ 深色蒙版 + 文字浮上（浅色文字）
- **inkwash**：保持左右分栏布局，左侧 art 区开场视频（`hero-open.mp4`）@ended 定格长卷图（`hero-scroll.png`），右侧文字不变
- **reduced-motion**：降级静态图（real 用 poster，inkwash 直接 scroll.png）

## 改动文件
- `display-v2/src/components/homepage/RiverHero.vue`（主要改造，模板+script+CSS）
- `MapView.vue`：不改动（RiverHero props/stats 数据流不变）
- `themes/manifest.js`：不改动（`resolveAsset` 已支持 hero-map/hero-open/hero-scroll）

## RiverHero.vue 改造细节

### script setup
- `import { useTheme }`，取 `isReal` + `resolveAsset`
- `heroBg = computed`：real → `resolveAsset('hero-map')`（video+poster）；inkwash → `resolveAsset('hero-scroll')`（image 长卷）
- `inkOpen = computed`：`!isReal` → `resolveAsset('hero-open')`（video 开场）
- `showScroll = ref(false)`：inkwash 开场视频 `@ended` 置 true，切长卷图
- `watch(isReal)`：切 real 时 `showScroll=false`；切 inkwash 时 `showScroll=false`（重新播开场）
- 复用现有 `prefersReduce()` 函数

### 模板
- `.rh` 加 `:class="isReal ? 'rh--real' : 'rh--inkwash'"`
- **real 分支**：
  - `<video v-if="!reduce && heroBg?.type==='video'" class="rh__video-bg" :src :poster autoplay muted loop playsinline>`
  - `<img v-else class="rh__video-bg" :src="heroBg?.poster">`（reduced 降级）
  - `<div class="rh__overlay">`（深色蒙版，rgba(0,0,0,0.45)）
  - `.rh__content` 浮上（z-index 2）+ 题款印章 + 浅色文字
- **inkwash 分支**：保持当前双列
  - 左 art 区：`<video v-if="!reduce && !showScroll && inkOpen?.type==='video'" @ended="showScroll=true" autoplay muted playsinline :poster>` + `<img v-if="reduce || showScroll" :src="heroBg?.url">`（长卷）+ 题款/印章（保留）
  - 右 content 不变

### CSS
- `.rh { position: relative; overflow: hidden; }`
- `.rh--inkwash`：`display: grid; grid-template-columns: 55% 45%`（当前布局）
- `.rh--real`：`display: flex; align-items: center; min-height: 70vh;` + content 居中浮上
- `.rh__video-bg`：`position: absolute; inset: 0; object-fit: cover;`（铺满 .rh）
- `.rh__overlay`：`position: absolute; inset: 0; background: rgba(0,0,0,0.45);`（仅 real）
- real 文字浅色（覆盖 var，用 `#f5efe3`）；inkwash 文字深色（当前）
- `.rh__art`（inkwash art 区）保持 4/3 + 题款/印章

### GSAP 入场
- 保留现有 timeline（art 淡入 + 标题分行 + stats + cta）
- real：art 区隐藏（视频全屏），content 浮上入场（opacity + y）
- inkwash：当前入场不变

## 验证
1. `npm run build` 通过
2. dev server（5176）：
   - real：全屏黄河航拍视频 + 深色蒙版 + 浅色文字浮上
   - inkwash：左侧开场晕染视频 2s → 定格水墨长卷 + 右侧文字
   - reduced-motion：降级静态图
   - 切主题：Hero 布局/媒体切换
3. iOS autoplay：muted + playsinline 保证自动播放

## 风险与边界
- real 全屏视频文字可读性：深色蒙版 0.45 + 浅色文字
- inkwash `@ended` 时序：视频播完切图，若视频短（2s）可接受；reduced-motion 跳过视频直接图
- iOS autoplay：需 `muted` + `playsinline`（已加）
- 省流模式（Data Saver）：本轮不处理，仅 reduced-motion 降级（省流检测 navigator.connection 留后续）
- 视频体积：hero-map.mp4 已压缩 2.4MB，hero-open.mp4 585KB，可接受
