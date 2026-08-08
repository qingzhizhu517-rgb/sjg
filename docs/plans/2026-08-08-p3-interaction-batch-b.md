# P3 批次 B · 实施计划

> 关联：`docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md`（唯一进度源）
> 批次 A 完成记录：`docs/plans/2026-08-08-p3-interaction-batch-a.md`

## Context

P3 沉浸交互剩余 3 项：
- **P3-1** 首页滚动叙事 — 将 MapView 从平铺堆叠改为 scroll-driven 叙事流
- **P3-2 FLIP** — 城市卡图 → 城市页 Hero 共享元素过渡（批次 A 已完成进度条+方向感，FLIP 延期至此）
- **P3-6** 真机验收 — 移动端全流程走查

### 现有架构关键点

- MapView.vue 1408 行，模板顺序：RiverHero → real-3d-container / anime-ink-container（主题互斥）→ RiverCityRail → AiChatBox
- 无 scroll 事件监听，无 sticky，无 IntersectionObserver
- GSAP 3.15 + ScrollTrigger 已在 4 处使用（StatTicker / CityFeatureSpot / RegionSpots / useReveal）
- useThreeSandbox.js 管理 Three.js 引擎，`controls`/`camera` 在闭包内，未暴露给外部
- RiverHero 仅 entrance GSAP timeline，非 scroll-linked
- RiverCityRail 无动画库，纯 CSS stagger
- 已有 useReveal.js composable（ScrollTrigger.batch 批量入场）
- App.vue 已有 page-slide / page-pop / page-fade 路由过渡（P3 批次 A）

---

## Task 1: P3-1 首页滚动叙事

### 目标

MapView 从平面堆叠改为 6 段 scroll-driven 叙事流：

```
RiverHero（全屏视频/晕染）→ StatTicker（数字滚动）→
沙盘/长卷 sticky（滚动驱动镜头/横移）→ RiverCityRail（视差）→
名城精选（卡片画廊）→ 页尾 CTA
```

### 技术决策

1. **不放大 MapView**：scroll 逻辑抽为 `useScrollNarrative.js` composable，MapView 只做编排
2. **useThreeSandbox 暴露 camera/controls**：新增 `getCamera()` / `getControls()` 方法，供 scroll-driven camera push 读取
3. **sticky 方案**：GSAP ScrollTrigger `pin: true` + `scrub`，双主题分别处理
4. **reduced-motion**：sticky + camera push + 视差全部降级为静态
5. **名城精选**：复用 CityFeatureSpot 组件（已有 ScrollTrigger 入场），新组 FamousCities 做容器编排
6. **页尾 CTA**：简单视觉组件，无重交互

### Step 1: useThreeSandbox 暴露相机接口

**文件**：`display-v2/src/composables/useThreeSandbox.js`

在 return 对象新增：

```js
getCamera: () => camera,
getControls: () => controls,
```

（只读访问，不破坏封装。外部只读取 position/target 做 scroll-driven 插值。）

### Step 2: 新建 useScrollNarrative composable

**文件**：`display-v2/src/composables/useScrollNarrative.js`

API 设计：

```js
export function useScrollNarrative() {
  const stickyProgress = ref(0)  // 0→1，sticky 段落滚动进度

  let _triggers = []

  /** 初始化全部 scroll 叙事 */
  function init({
    isReal,           // Ref<boolean>
    sandboxApi,       // { getCamera, getControls, canvas3d }
    stickyRealRef,    // Ref<HTMLElement> real 沙盘 sticky wrapper
    stickyInkRef,     // Ref<HTMLElement> inkwash 长卷 sticky wrapper
    railRef,          // Ref<HTMLElement> RiverCityRail 容器
  }) {
    if (prefersReduce) return

    // 1. Real sticky：pin 沙盘容器，scrub camera dolly + target 偏移
    // 2. Ink sticky：pin 长卷容器，scrub inner content translateX
    // 3. RiverCityRail parallax：scroll 驱动卡片 y 偏移或 scale
  }

  function dispose() { /* kill all ScrollTriggers */ }

  return { init, dispose, stickyProgress }
}
```

**Real sticky 细节**：
- 记录 initCamPos = camera.position.clone() / initTarget = controls.target.clone()
- ScrollTrigger: `trigger: stickyRealRef`, `start: 'top top'`, `end: '+=150%'`, `pin: true`, `scrub: 1`
- `onUpdate`: `progress` 插值 camera.position 从 init 到 closer（z 减小 30-40%），controls.target 微调

**Ink sticky 细节**：
- 长卷 inner content（parallax layers）原生可横滑；sticky 时段 scroll 驱动横移
- ScrollTrigger: `trigger: stickyInkRef`, `start: 'top top'`, `end: '+=120%'`, `pin: true`, `scrub: 1`
- `onUpdate`: 设置 inner content `transform: translateX(-progress * maxScroll)`

**Rail parallax**：
- ScrollTrigger: `trigger: railRef`, `start: 'top bottom'`, `end: 'bottom top'`
- `onUpdate`: 轻微 y 偏移 + opacity 过渡

### Step 3: 新建叙事文本数据

**文件**：`display-v2/src/content/scrollNarrative.js`

```js
// 沙盘 sticky 段落的叙事文本卡片（real 用展馆解说词风，inkwash 用诗意题跋风）
export const narrativePanels = {
  real: [
    { title: '大河奔流', body: '黄河自西向东穿越山东九市...' },
    { title: '文脉绵长', body: '齐鲁大地孕育了孔子、孟子...' },
    { title: '山河图志', body: '点击城市节点，探寻每座城的文学景观...' },
  ],
  inkwash: [
    { title: '长卷舒展', body: '水墨晕染间，黄河九曲徐徐展开...' },
    { title: '诗路寻踪', body: '沿河而下，每一笔墨痕都是一段文脉...' },
  ],
}
```

### Step 4: MapView 模板重构

**文件**：`display-v2/src/views/MapView.vue`

重组织模板为 scroll-narrative 分段结构：

```html
<div class="map-view scroll-narrative" @mousemove @mouseleave>
  <!-- S1: RiverHero（保持不变，全屏） -->
  <section class="sn-section sn-hero">
    <RiverHero ... />
  </section>

  <!-- S2: StatTicker（Hero 与沙盘之间） -->
  <section class="sn-section sn-stats">
    <div class="sn-container">
      <StatTicker :stats="heroStats" tone="dark" />
    </div>
  </section>

  <!-- S3: Sticky 沙盘/长卷 -->
  <section v-if="isReal" ref="stickyRealRef" class="sn-section sn-sticky-real">
    <div class="sn-sticky-media"><!-- 现有 real-3d-container --></div>
    <div class="sn-narrative-panels"><!-- 叙事文字卡片叠在 sticky 上 --></div>
  </section>
  <section v-else ref="stickyInkRef" class="sn-section sn-sticky-ink">
    <div class="sn-sticky-media"><!-- 现有 anime-ink-container，mouse parallax 保留 --></div>
    <div class="sn-narrative-panels"><!-- 叙事文字卡片 --></div>
  </section>

  <!-- S4: RiverCityRail -->
  <section ref="railRef" class="sn-section sn-rail">
    <RiverCityRail :regions="cityNames" @go="goRegion" />
  </section>

  <!-- S5: 名城精选（新 FamousCities 组件） -->
  <section class="sn-section sn-featured">
    <FamousCities :cities="featuredCities" @go="goRegion" />
  </section>

  <!-- S6: 页尾 CTA（新 FooterCTA 组件，在全站 footer 前） -->
  <section class="sn-section sn-footer-cta">
    <FooterCTA @cta="scrollToTop" />
  </section>

  <!-- 现有：AiChatBox、CityDetailCard 保持不变 -->
  <CityDetailCard ... />
  <AiChatBox />
</div>
```

关键变更：
- 现有 `real-3d-container` / `anime-ink-container` 内容块整体搬家到 S3 的 `.sn-sticky-media` 内
- MapView script：import useScrollNarrative + FamousCities + FooterCTA；onMounted 调 `scrollNarrative.init(...)`；onBeforeUnmount 调 `dispose()`
- 删除现有 `scrollToMap` 简单 scrollIntoView 逻辑（被 scroll narrative 替代）

### Step 5: 新建 FamousCities 组件

**文件**：`display-v2/src/components/homepage/FamousCities.vue`

```html
<section class="famous-cities">
  <SectionHeading title="名城精选" subtitle="沿黄九城 · 各具风华" />
  <div class="famous-cities__grid">
    <CityFeatureSpot v-for="(c, i) in cities" :key="c.name"
      :index="i" :name="c.name" :description="c.desc"
      :image="c.image" :tag="c.tag"
      :reversed="i % 2 === 1"
      @click="$emit('go', `/regions/${c.name}`)" />
  </div>
</section>
```

复用 CityFeatureSpot（已有 ScrollTrigger 入场动画），FamousCities 只做容器 + SectionHeading。

数据从 MapView 传入（从现有 cityNames + resolveContent 拼装）。

### Step 6: 新建 FooterCTA 组件

**文件**：`display-v2/src/components/homepage/FooterCTA.vue`

简单视觉组件：大水墨/渐变背景 + 竖排大字 "沿河而下，发现更多" + 按钮"返回山河图志"（scroll to top）。双主题差异化（real 金色渐变 / inkwash 水墨）。

### Step 7: 构建 + 提交

```bash
cd display-v2 && npm run build
```

Expected: 构建通过，无新 warning。dev server 启动后手动走查 6 段叙事滚动流畅。

---

## Task 2: P3-2 FLIP 共享元素过渡

### 目标

城市预览卡（CityDetailCard）图片 → 城市页（CityHero / inkwash landscape-img）Hero 背景的 FLIP 过渡。

### 技术决策

1. **module-level singleton 传状态**：`useFlipTransition()` 闭包内 `_pendingFlip` 跨组件共享（无需 provide/inject/store）
2. **目标页 onMounted 执行 FLIP**：在 CityHero 正常入场动画前，先应用 invert + play
3. **不破坏 CityHero 现有动画**：Hero 非背景元素（标题/引用/统计）保留原入场动画；仅背景做 FLIP
4. **maxAge 5s**：超时丢弃 flip 状态，走正常入场（防陈旧状态泄漏）
5. **reduced-motion**：跳过 FLIP，直接正常入场

### Step 1: 新建 useFlipTransition composable

**文件**：`display-v2/src/composables/useFlipTransition.js`

```js
import gsap from 'gsap'

// Module-level singleton — 同路由 SPA 内跨组件共享
let _pendingFlip = null

export function useFlipTransition() {
  /**
   * 导航前捕获源元素位置（MapView 调用）
   * @param {HTMLElement} sourceEl
   * @param {string} key 城市名等唯一 key
   */
  function capture(sourceEl, key) {
    if (!sourceEl) return
    const r = sourceEl.getBoundingClientRect()
    _pendingFlip = {
      key,
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      ts: Date.now(),
    }
  }

  /**
   * 目标页挂载后执行 FLIP 动画（RegionSpots 调用）
   * @param {HTMLElement} targetEl
   * @param {string} key
   * @param {object} opts { duration, ease, maxAge }
   * @returns {gsap.core.Timeline|null}
   */
  function animate(targetEl, key, opts = {}) {
    const { duration = 0.55, ease = 'power3.inOut', maxAge = 5000 } = opts
    if (!_pendingFlip || _pendingFlip.key !== key) return null
    if (Date.now() - _pendingFlip.ts > maxAge) { _pendingFlip = null; return null }
    if (!targetEl) { _pendingFlip = null; return null }

    const from = _pendingFlip.rect
    _pendingFlip = null

    const to = targetEl.getBoundingClientRect()
    const dx = from.left - to.left
    const dy = from.top - to.top
    const sx = from.width / (to.width || 1)
    const sy = from.height / (to.height || 1)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return null

    // Invert → Play
    gsap.set(targetEl, { x: dx, y: dy, scaleX: sx, scaleY: sy })
    return gsap.to(targetEl, {
      x: 0, y: 0, scaleX: 1, scaleY: 1,
      duration, ease,
      onComplete: () => gsap.set(targetEl, { clearProps: 'all' }),
    })
  }

  return { capture, animate }
}
```

### Step 2: MapView 的 onCardGo 中捕获

**文件**：`display-v2/src/views/MapView.vue`

```js
import { useFlipTransition } from '../composables/useFlipTransition'

const { capture: captureFlip } = useFlipTransition()

const onCardGo = (route) => {
  if (route) {
    const imgEl = document.querySelector('.city-card__img')
    captureFlip(imgEl, selectedCity.value)
    router.push(route)
  }
  closeCity()
}
```

### Step 3: RegionSpots 的 onMounted 中执行 FLIP

**文件**：`display-v2/src/views/RegionSpots.vue`

```js
import { useFlipTransition } from '../composables/useFlipTransition'
import { nextTick, onMounted } from 'vue'

const { animate: animateFlip } = useFlipTransition()

onMounted(async () => {
  // ... 现有加载逻辑 ...

  await nextTick()
  // real 目标 = CityHero 背景 div；inkwash 目标 = .city-landscape-img
  const target = document.querySelector(
    isReal.value ? '.city-hero__bg-media--img' : '.city-landscape-img'
  )
  if (target) {
    animateFlip(target, region.value, { duration: 0.6 })
  }
})
```

注意：如果 `CityHero` 有视频素材（无 img div），FLIP 自然跳过（target 为 null），走正常入场。

### Step 4: 构建 + 单测 + 提交

```bash
cd display-v2 && npm run build
```

---

## Task 3: P3-6 真机验收

代码任务已完成后的最终验证，无代码产出。

走查清单：
- [ ] iOS Safari：3D 沙盘双指旋转/缩放、单指上下滑动页面（不触发旋转）、点按节点出预览卡
- [ ] iOS Safari：各页面布局无错位、overflow 无横向滚动条
- [ ] Android Chrome：同上手势验证
- [ ] 双端：滚动叙事 6 段落流畅（sticky 不抖、camera push 平滑）
- [ ] 双端：FLIP 过渡视觉正确
- [ ] reduced-motion：所有动效降级为静态
- [ ] 记录已知问题（如 touches.ONE=null 在 iOS Safari 的 pointercancel 行为）

---

## Task 4: 进度回写

**文件**：`docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md`

- P3-1 勾 `[x]`
- P3-2 从 `[~]` 改为 `[x]`
- P3-6 勾 `[x]`
- 进度总览 P3 行 3/6 → 6/6
- 变更日志追加

同时创建 `docs/plans/2026-08-08-p3-interaction-batch-b.md`（本计划归档）。

---

## 文件变更总览

| 操作 | 文件 |
|:--|:--|
| **Create** | `src/composables/useScrollNarrative.js` |
| **Create** | `src/composables/useFlipTransition.js` |
| **Create** | `src/content/scrollNarrative.js` |
| **Create** | `src/components/homepage/FamousCities.vue` |
| **Create** | `src/components/homepage/FooterCTA.vue` |
| **Modify** | `src/composables/useThreeSandbox.js`（暴露 getCamera/getControls） |
| **Modify** | `src/views/MapView.vue`（模板重构 + useScrollNarrative + flip capture） |
| **Modify** | `src/views/RegionSpots.vue`（flip animate） |
| **Modify** | `docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md` |

## 验证步骤

```bash
cd display-v2
npm run build          # 构建通过，无新 warning
npm run test:unit      # 全量单测通过
```

人工走查（dev server）：
- 首页从头滚到尾：6 段落依次出现，sticky 不抖
- real 主题：沙盘 sticky 时相机缓推
- inkwash 主题：长卷 sticky 时横向平移
- 点击城市 → 城市页：图片 FLIP 过渡（如有）
- 切换主题：scroll narrative 正确响应主题变化
- reduced-motion：所有动效降级

## 提交策略

建议 3 commits：
1. `feat(display-v2): P3-1 首页滚动叙事 -- sticky沙盘/长卷 + StatTicker + 视差 + 名城精选 + 页尾CTA`
2. `feat(display-v2): P3-2 FLIP共享元素 -- 城市卡图过渡至城市页Hero`
3. `docs: P3 批次 B 验收回写 + 实施计划归档`
