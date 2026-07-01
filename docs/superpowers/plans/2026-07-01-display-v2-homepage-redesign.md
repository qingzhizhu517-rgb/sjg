# display-v2 三页面杂志式改版 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 三个用户端主页面（山河图志 / 齐鲁名士 / 文脉长河）升级为「杂志式 Hero + 多区域 + 动效全开」结构，补足内容密度、排版层次、动效表现。

**Architecture:** 在 `display-v2` 现有 Vue 3 + Vite 工程中新增 7 个可复用 homepage 组件 + 3 个 composables，用 GSAP + ScrollTrigger 提供动效；三个 view 文件仅在顶部挂载 HeroBanner + 推荐位 + 卡片墙，原有 3D 地图 / G6 图谱 / 时间线逻辑保持不变。

**Tech Stack:** Vue 3 (Composition API) · Vite 8 · vue-router 4 · GSAP 3.12 + ScrollTrigger · axios · Three.js（已有）· AntV G6（已有）· ECharts（已有）

**前置依赖：**
- 后端已实现 8 个接口（详见 spec §3.2）：`/stats/map`、`/stats/poets`、`/stats/timeline`、`/spots/featured`、`/regions/along-yellow`、`/poets/featured`、`/poems/featured`、`/timeline/:dynasty/featured`
- 如未实现，使用 `src/config/mockDetailData.js` 的 mock 数据兜底

---

## 文件结构

| 路径 | 类型 | 责任 |
|---|---|---|
| `display-v2/package.json` | 修改 | 新增 gsap 依赖 |
| `display-v2/src/composables/useReveal.js` | 新建 | 滚动揭示：GSAP + ScrollTrigger |
| `display-v2/src/composables/useAmbientFx.js` | 新建 | 环境氛围动效（金粉 / 印泥脉冲） |
| `display-v2/src/composables/useHomepageData.js` | 新建 | 三页面统一数据加载与缓存 |
| `display-v2/src/components/homepage/AmbientLayer.vue` | 新建 | 背景层（粒子 / 印章 / 河水光） |
| `display-v2/src/components/homepage/SectionHeading.vue` | 新建 | 通用 section 标题 |
| `display-v2/src/components/homepage/StatTicker.vue` | 新建 | 数字翻牌 |
| `display-v2/src/components/homepage/HeroBanner.vue` | 新建 | 通用 Hero（eyebrow/title/subtitle/stats/cta） |
| `display-v2/src/components/homepage/FeaturedSpotCard.vue` | 新建 | 景点推荐卡 |
| `display-v2/src/components/homepage/FeaturedPoetCard.vue` | 新建 | 名士推荐卡 |
| `display-v2/src/components/homepage/FeaturedPoemCard.vue` | 新建 | 名句推荐卡 |
| `display-v2/src/components/homepage/CityQuickCard.vue` | 新建 | 城市快速入口卡 |
| `display-v2/src/components/homepage/SkeletonBlock.vue` | 新建 | 加载占位 |
| `display-v2/src/components/homepage/ErrorState.vue` | 新建 | 错误态 |
| `display-v2/src/views/MapView.vue` | 修改 | 顶部 Hero + 地图保留 + 推荐位 + 九城卡 |
| `display-v2/src/views/PoetList.vue` | 修改 | 顶部 Hero + 名士墙重构 + 图谱预览 + 推荐位 |
| `display-v2/src/views/Timeline.vue` | 修改 | 顶部 Hero + 时间线保留 + 同期推荐 + 跨朝代对比 |

---

## Phase 1：基础（composables）

### Task 1：安装 GSAP

**Files:**
- Modify: `display-v2/package.json`

- [ ] **Step 1：安装依赖**

```bash
cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm install gsap@^3.12
```

- [ ] **Step 2：验证安装成功**

```bash
ls node_modules/gsap/package.json
cat node_modules/gsap/package.json | grep '"version"'
```

Expected: 显示版本号（3.12.x）。

- [ ] **Step 3：提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/package.json display-v2/package-lock.json
git commit -m "chore(display-v2): add gsap 3.12 dependency"
```

---

### Task 2：useReveal 滚动揭示 composable

**Files:**
- Create: `display-v2/src/composables/useReveal.js`

- [ ] **Step 1：创建文件**

```javascript
// display-v2/src/composables/useReveal.js
import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * 给定 ref 数组，进入视口 15% 时执行 fade-up 入场动画
 * @param {import('vue').Ref<HTMLElement|null>[]} refs
 * @param {object} options
 * @param {number} options.stagger - 子项间隔（秒），默认 0.08
 * @param {number} options.y - 上移距离（px），默认 24
 * @param {number} options.duration - 动画时长（秒），默认 0.6
 * @returns {{ triggers: import('vue').Ref<ScrollTrigger[]>, refresh: () => void }}
 */
export function useReveal(refs, options = {}) {
  const { stagger = 0.08, y = 24, duration = 0.6 } = options
  const triggers = []

  onMounted(() => {
    refs.forEach((ref) => {
      const el = ref.value
      if (!el) return
      const t = gsap.from(el, {
        opacity: 0,
        y,
        duration,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      })
      if (t.scrollTrigger) triggers.push(t.scrollTrigger)
    })
  })

  onBeforeUnmount(() => {
    triggers.forEach((t) => t.kill())
    triggers.length = 0
  })

  return {
    refresh: () => ScrollTrigger.refresh(),
  }
}
```

- [ ] **Step 2：验证文件存在**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/composables/useReveal.js && echo "OK"
```

Expected: `OK`

- [ ] **Step 3：提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/composables/useReveal.js
git commit -m "feat(display-v2): add useReveal composable for GSAP scroll reveal"
```

---

### Task 3：useAmbientFx 环境动效 composable

**Files:**
- Create: `display-v2/src/composables/useAmbientFx.js`

- [ ] **Step 1：创建文件**

```javascript
// display-v2/src/composables/useAmbientFx.js
import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

/**
 * 创建一个常驻 GSAP 动效（金粉缓动 / 印泥脉冲）。
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 * @param {'particles'|'seal'|'river'} variant
 * @returns {{ start: () => void, stop: () => void }}
 */
export function useAmbientFx(containerRef, variant = 'particles') {
  let timeline = null

  const buildParticles = (container) => {
    const dots = []
    for (let i = 0; i < 18; i++) {
      const dot = document.createElement('span')
      dot.className = 'ambient-particle'
      dot.style.cssText = `
        position: absolute;
        width: 4px; height: 4px;
        background: #d4af37;
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${0.3 + Math.random() * 0.5};
        pointer-events: none;
      `
      container.appendChild(dot)
      dots.push(dot)
    }
    return dots
  }

  const start = () => {
    const container = containerRef.value
    if (!container) return
    if (timeline) timeline.kill()

    if (variant === 'particles') {
      const dots = buildParticles(container)
      timeline = gsap.timeline({ repeat: -1 })
      dots.forEach((dot, i) => {
        timeline.to(dot, {
          y: '-=30',
          opacity: 0,
          duration: 4 + (i % 5),
          ease: 'sine.inOut',
          delay: i * 0.2,
          onComplete: () => {
            gsap.set(dot, { y: 0, opacity: 0.6 })
          },
        }, 0)
      })
    } else if (variant === 'seal') {
      // 印泥脉冲 — 依赖子元素 .ambient-seal-ring
      const rings = container.querySelectorAll('.ambient-seal-ring')
      timeline = gsap.timeline({ repeat: -1 })
      rings.forEach((ring, i) => {
        timeline.fromTo(ring, { scale: 0.9, opacity: 0.4 }, {
          scale: 1.15,
          opacity: 0,
          duration: 2.4,
          ease: 'sine.out',
          delay: i * 0.6,
        }, 0)
      })
    } else if (variant === 'river') {
      // 河水光带 — 依赖子元素 .ambient-river-stream
      const streams = container.querySelectorAll('.ambient-river-stream')
      timeline = gsap.timeline({ repeat: -1 })
      streams.forEach((s, i) => {
        timeline.to(s, {
          x: '+=200',
          opacity: 0,
          duration: 6,
          ease: 'sine.inOut',
          delay: i * 1.5,
          onComplete: () => gsap.set(s, { x: -200, opacity: 0.7 }),
        }, 0)
      })
    }
  }

  const stop = () => {
    if (timeline) {
      timeline.kill()
      timeline = null
    }
  }

  onMounted(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      start()
    }
  })

  onBeforeUnmount(() => stop())

  return { start, stop }
}
```

- [ ] **Step 2：验证**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/composables/useAmbientFx.js && echo "OK"
```

- [ ] **Step 3：提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/composables/useAmbientFx.js
git commit -m "feat(display-v2): add useAmbientFx composable for ambient animation"
```

---

### Task 4：useHomepageData 数据加载 composable

**Files:**
- Create: `display-v2/src/composables/useHomepageData.js`

- [ ] **Step 1：创建文件**

```javascript
// display-v2/src/composables/useHomepageData.js
import { reactive } from 'vue'
import api from '../api'

/**
 * 统一加载三个页面所需的统计数据与推荐位。
 * 每个数据块独立 try/catch，单块失败不影响其他块。
 */
export function useHomepageData() {
  const state = reactive({
    map: {
      stats: { spots: 0, poets: 0, poems: 0, cities: 0 },
      cities: [],
      featuredSpots: [],
      featuredPoems: [],
      loaded: false,
      error: null,
    },
    poets: {
      stats: { poets: 0, dynasties: 0, poems: 0, locations: 0 },
      featured: [],
      poemOfDay: null,
      loaded: false,
      error: null,
    },
    timeline: {
      stats: { dynasties: 0, events: 0, poets: 0, poems: 0 },
      featuredByDynasty: {},
      loaded: false,
      error: null,
    },
  })

  const fetchMap = async () => {
    try {
      const [stats, cities, spots, poems] = await Promise.allSettled([
        api.get('/stats/map'),
        api.get('/regions/along-yellow'),
        api.get('/spots/featured', { params: { limit: 2 } }),
        api.get('/poems/featured', { params: { limit: 1 } }),
      ])
      if (stats.status === 'fulfilled') state.map.stats = stats.value
      if (cities.status === 'fulfilled') state.map.cities = cities.value
      if (spots.status === 'fulfilled') state.map.featuredSpots = spots.value
      if (poems.status === 'fulfilled') state.map.featuredPoems = poems.value
      state.map.loaded = true
    } catch (e) {
      state.map.error = e.message
      state.map.loaded = true
    }
  }

  const fetchPoets = async () => {
    try {
      const [stats, featured, poem] = await Promise.allSettled([
        api.get('/stats/poets'),
        api.get('/poets/featured', { params: { limit: 2 } }),
        api.get('/poems/featured', { params: { limit: 1 } }),
      ])
      if (stats.status === 'fulfilled') state.poets.stats = stats.value
      if (featured.status === 'fulfilled') state.poets.featured = featured.value
      if (poem.status === 'fulfilled') state.poets.poemOfDay = poem.value
      state.poets.loaded = true
    } catch (e) {
      state.poets.error = e.message
      state.poets.loaded = true
    }
  }

  const fetchTimeline = async () => {
    try {
      const stats = await api.get('/stats/timeline')
      state.timeline.stats = stats
      // 按朝代懒加载：先标记 loaded，详细推荐在组件内按需触发
      state.timeline.loaded = true
    } catch (e) {
      state.timeline.error = e.message
      state.timeline.loaded = true
    }
  }

  const fetchTimelineByDynasty = async (dynastyId) => {
    if (state.timeline.featuredByDynasty[dynastyId]) return
    try {
      const data = await api.get(`/timeline/${dynastyId}/featured`)
      state.timeline.featuredByDynasty[dynastyId] = data
    } catch (e) {
      state.timeline.featuredByDynasty[dynastyId] = { error: e.message }
    }
  }

  return { state, fetchMap, fetchPoets, fetchTimeline, fetchTimelineByDynasty }
}
```

- [ ] **Step 2：验证**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/composables/useHomepageData.js && echo "OK"
```

- [ ] **Step 3：提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/composables/useHomepageData.js
git commit -m "feat(display-v2): add useHomepageData composable for unified data loading"
```

---

## Phase 2：通用组件

### Task 5：AmbientLayer 背景层组件

**Files:**
- Create: `display-v2/src/components/homepage/AmbientLayer.vue`

- [ ] **Step 1：创建文件**

```vue
<!-- display-v2/src/components/homepage/AmbientLayer.vue -->
<template>
  <div ref="container" class="ambient-layer" :class="`variant-${variant}`">
    <template v-if="variant === 'seal'">
      <span class="ambient-seal-ring" v-for="i in 3" :key="i"></span>
    </template>
    <template v-else-if="variant === 'river'">
      <span class="ambient-river-stream" v-for="i in 4" :key="i"></span>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAmbientFx } from '../../composables/useAmbientFx'

const props = defineProps({
  variant: { type: String, default: 'particles' }, // particles | seal | river
})

const container = ref(null)
useAmbientFx(container, props.variant)
</script>

<style scoped>
.ambient-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.ambient-layer.variant-seal .ambient-seal-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 1.5px solid rgba(142, 53, 46, 0.4);
  border-radius: 50%;
  top: 30%;
  left: 70%;
}
.ambient-layer.variant-seal .ambient-seal-ring:nth-child(2) { left: 75%; top: 60%; }
.ambient-layer.variant-seal .ambient-seal-ring:nth-child(3) { left: 65%; top: 45%; }

.ambient-layer.variant-river .ambient-river-stream {
  position: absolute;
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #c27b38, transparent);
  top: 50%;
  left: 0;
  opacity: 0.7;
}
.ambient-layer.variant-river .ambient-river-stream:nth-child(2) { top: 55%; }
.ambient-layer.variant-river .ambient-river-stream:nth-child(3) { top: 45%; }
.ambient-layer.variant-river .ambient-river-stream:nth-child(4) { top: 60%; }
</style>
```

- [ ] **Step 2：验证**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/AmbientLayer.vue && echo "OK"
```

- [ ] **Step 3：提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/components/homepage/AmbientLayer.vue
git commit -m "feat(display-v2): add AmbientLayer background component"
```

---

### Task 6：SectionHeading 通用标题组件

**Files:**
- Create: `display-v2/src/components/homepage/SectionHeading.vue`

- [ ] **Step 1：创建文件**

```vue
<!-- display-v2/src/components/homepage/SectionHeading.vue -->
<template>
  <div class="section-heading">
    <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
    <h2 class="title">{{ title }}</h2>
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<style scoped>
.section-heading {
  text-align: left;
  border-left: 3px solid var(--accent);
  padding-left: 16px;
  margin-bottom: 24px;
}
.eyebrow {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--accent);
  margin-bottom: 4px;
}
.title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  margin: 0 0 6px 0;
}
.subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  letter-spacing: 1px;
}
</style>
```

- [ ] **Step 2：验证 + 提交**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/SectionHeading.vue && \
cd /Users/a1/develop/vibecoding/sjg && \
git add display-v2/src/components/homepage/SectionHeading.vue && \
git commit -m "feat(display-v2): add SectionHeading component"
```

---

### Task 7：StatTicker 数字翻牌组件

**Files:**
- Create: `display-v2/src/components/homepage/StatTicker.vue`

- [ ] **Step 1：创建文件**

```vue
<!-- display-v2/src/components/homepage/StatTicker.vue -->
<template>
  <div ref="root" class="stat-ticker">
    <div v-for="(s, i) in stats" :key="i" class="stat-item">
      <span ref="nums" class="stat-num" :data-target="s.value">0</span>
      <span class="stat-suffix" v-if="s.suffix">{{ s.suffix }}</span>
      <span class="stat-lbl">{{ s.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  stats: { type: Array, required: true },
  // [{ value: 6, suffix: '位', label: '代表人物' }, ...]
})

const root = ref(null)
const nums = ref([])
let triggers = []

onMounted(() => {
  nums.value.forEach((el) => {
    if (!el) return
    const target = Number(el.dataset.target) || 0
    const obj = { v: 0 }
    const t = gsap.to(obj, {
      v: target,
      duration: 1.2,
      ease: 'power1.inOut',
      snap: { v: 1 },
      onUpdate: () => { el.textContent = obj.v },
      scrollTrigger: {
        trigger: root.value,
        start: 'top 85%',
        once: true,
      },
    })
    if (t.scrollTrigger) triggers.push(t.scrollTrigger)
  })
})

onBeforeUnmount(() => {
  triggers.forEach((t) => t.kill())
  triggers = []
})
</script>

<style scoped>
.stat-ticker {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 14px 20px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  margin: 16px 0;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}
.stat-num {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}
.stat-suffix {
  font-size: 13px;
  color: var(--text-secondary);
  margin-left: 2px;
  font-weight: 700;
}
.stat-lbl {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  letter-spacing: 1px;
}
</style>
```

- [ ] **Step 2：验证 + 提交**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/StatTicker.vue && \
cd /Users/a1/develop/vibecoding/sjg && \
git add display-v2/src/components/homepage/StatTicker.vue && \
git commit -m "feat(display-v2): add StatTicker component with GSAP number flip"
```

---

### Task 8：HeroBanner 通用 Hero 组件

**Files:**
- Create: `display-v2/src/components/homepage/HeroBanner.vue`

- [ ] **Step 1：创建文件**

```vue
<!-- display-v2/src/components/homepage/HeroBanner.vue -->
<template>
  <section ref="root" class="hero-banner" :style="{ minHeight: height }">
    <AmbientLayer :variant="ambientVariant" />
    <div ref="content" class="hero-content">
      <span v-if="eyebrow" class="hero-eyebrow">{{ eyebrow }}</span>
      <h1 ref="title" class="hero-title">{{ title }}</h1>
      <p v-if="subtitle" ref="subtitle" class="hero-subtitle">{{ subtitle }}</p>
      <StatTicker v-if="stats && stats.length" :stats="stats" class="hero-stats" />
      <button v-if="ctaLabel" ref="cta" class="hero-cta" @click="$emit('cta')">
        {{ ctaLabel }} ↓
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import AmbientLayer from './AmbientLayer.vue'
import StatTicker from './StatTicker.vue'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  ctaLabel: { type: String, default: '' },
  stats: { type: Array, default: () => [] },
  height: { type: String, default: '50vh' },
  ambientVariant: { type: String, default: 'particles' },
})

defineEmits(['cta'])

const root = ref(null)
const title = ref(null)
const subtitle = ref(null)
const cta = ref(null)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const tl = gsap.timeline({ delay: 0.1 })
  if (title.value) tl.from(title.value, { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' })
  if (subtitle.value) tl.from(subtitle.value, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
  if (cta.value) tl.from(cta.value, { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
})
</script>

<style scoped>
.hero-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background: linear-gradient(135deg, #f4efe4 0%, #fbf8f2 100%);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.theme-inkwash .hero-banner {
  background: linear-gradient(135deg, #2a2520 0%, #1a1a1a 100%);
}
.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 900px;
}
.hero-eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 4px 12px;
  border-radius: 2px;
  margin-bottom: 18px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  margin: 0 0 16px 0;
  line-height: 1.1;
}
.hero-subtitle {
  font-family: var(--font-heading);
  font-size: 16px;
  color: var(--text-secondary);
  letter-spacing: 2px;
  line-height: 1.7;
  margin: 0 0 24px 0;
}
.hero-stats {
  justify-content: center;
  display: inline-flex;
}
.hero-cta {
  margin-top: 24px;
  padding: 12px 32px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s;
}
.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(142, 53, 46, 0.25);
}
@media (max-width: 768px) {
  .hero-title { font-size: 40px; letter-spacing: 4px; }
  .hero-subtitle { font-size: 14px; }
}
</style>
```

- [ ] **Step 2：验证 + 提交**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/HeroBanner.vue && \
cd /Users/a1/develop/vibecoding/sjg && \
git add display-v2/src/components/homepage/HeroBanner.vue && \
git commit -m "feat(display-v2): add HeroBanner component with GSAP entrance animation"
```

---

### Task 9：FeaturedSpotCard 景点推荐卡

**Files:**
- Create: `display-v2/src/components/homepage/FeaturedSpotCard.vue`

- [ ] **Step 1：创建文件**

```vue
<!-- display-v2/src/components/homepage/FeaturedSpotCard.vue -->
<template>
  <article class="spot-card card hover-lift" @click="$emit('click')">
    <div class="spot-cover">
      <img :src="imageUrl" :alt="spot.name" @error="onImgError" />
      <span class="spot-city-badge">{{ spot.city }}</span>
    </div>
    <div class="spot-body">
      <h3 class="spot-name">{{ spot.name }}</h3>
      <p v-if="spot.tagline" class="spot-tagline">「{{ spot.tagline }}」</p>
      <p v-if="spot.description" class="spot-desc">{{ spot.description }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useImage } from '../../composables/useImage'

const props = defineProps({
  spot: { type: Object, required: true },
})
defineEmits(['click'])

const { getImageUrl } = useImage()
const imageUrl = computed(() => getImageUrl(props.spot.image || props.spot.coverUrl, false))

const onImgError = (e) => { e.target.src = '/images/poets/li_bai.jpg' }
</script>

<style scoped>
.spot-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
}
.spot-cover {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #e8e4d8;
}
.spot-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.spot-card:hover .spot-cover img { transform: scale(1.06); }
.spot-city-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
}
.spot-body { padding: 18px; }
.spot-name {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  letter-spacing: 2px;
}
.spot-tagline {
  font-size: 12px;
  color: var(--accent);
  font-style: italic;
  margin: 0 0 8px 0;
}
.spot-desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hover-lift { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(61, 43, 31, 0.12);
  border-color: var(--accent);
}
</style>
```

- [ ] **Step 2：验证 + 提交**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/FeaturedSpotCard.vue && \
cd /Users/a1/develop/vibecoding/sjg && \
git add display-v2/src/components/homepage/FeaturedSpotCard.vue && \
git commit -m "feat(display-v2): add FeaturedSpotCard component"
```

---

### Task 10：FeaturedPoetCard 名士推荐卡

**Files:**
- Create: `display-v2/src/components/homepage/FeaturedPoetCard.vue`

- [ ] **Step 1：创建文件**

```vue
<!-- display-v2/src/components/homepage/FeaturedPoetCard.vue -->
<template>
  <article class="poet-card card hover-lift" @click="$emit('click')">
    <div class="poet-avatar">
      <img :src="imageUrl" :alt="poet.name" @error="onImgError" />
    </div>
    <div class="poet-info">
      <h3 class="poet-name">{{ poet.name }}</h3>
      <span class="poet-dynasty">{{ dynastyName }} · {{ poet.title || '文人' }}</span>
      <p v-if="poet.biography" class="poet-bio">{{ poet.biography }}</p>
      <span v-if="poet.style" class="poet-style">风格：{{ poet.style }}</span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useImage } from '../../composables/useImage'

const props = defineProps({
  poet: { type: Object, required: true },
})
defineEmits(['click'])

const { getImageUrl } = useImage()
const imageUrl = computed(() => getImageUrl(props.poet.avatarUrl, false))

const DYNASTY_NAMES = { 1: '先秦', 2: '秦汉', 3: '魏晋', 4: '唐代', 5: '宋代', 6: '元代', 7: '明代', 8: '清代' }
const dynastyName = computed(() => DYNASTY_NAMES[props.poet.dynastyId] || '古代')

const onImgError = (e) => { e.target.src = '/images/poets/li_bai.jpg' }
</script>

<style scoped>
.poet-card {
  display: flex;
  gap: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  height: 280px;
}
.poet-avatar {
  flex-shrink: 0;
  width: 96px;
  height: 100%;
  overflow: hidden;
  border-radius: 2px;
  background: #e8e4d8;
}
.poet-avatar img {
  width: 100%; height: 100%; object-fit: cover;
}
.poet-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.poet-name {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  letter-spacing: 2px;
}
.poet-dynasty {
  font-size: 12px;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 10px;
}
.poet-bio {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.poet-style {
  font-size: 11px;
  color: var(--text-muted);
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
}
.hover-lift { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(61, 43, 31, 0.12);
  border-color: var(--accent);
}
</style>
```

- [ ] **Step 2：验证 + 提交**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/FeaturedPoetCard.vue && \
cd /Users/a1/develop/vibecoding/sjg && \
git add display-v2/src/components/homepage/FeaturedPoetCard.vue && \
git commit -m "feat(display-v2): add FeaturedPoetCard component"
```

---

### Task 11：FeaturedPoemCard 名句推荐卡

**Files:**
- Create: `display-v2/src/components/homepage/FeaturedPoemCard.vue`

- [ ] **Step 1：创建文件**

```vue
<!-- display-v2/src/components/homepage/FeaturedPoemCard.vue -->
<template>
  <article class="poem-card card hover-lift" @click="$emit('click')">
    <span class="poem-eyebrow">今日名句</span>
    <blockquote class="poem-content">
      <p class="poem-text">「{{ poem.content }}」</p>
    </blockquote>
    <div class="poem-meta">
      <span class="poem-author">—— {{ poem.author || '佚名' }}</span>
      <span v-if="poem.title" class="poem-title">《{{ poem.title }}》</span>
    </div>
  </article>
</template>

<script setup>
defineProps({
  poem: { type: Object, required: true },
})
defineEmits(['click'])
</script>

<style scoped>
.poem-card {
  background: linear-gradient(135deg, #fdf8e6 0%, #f4efe4 100%);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 24px;
  cursor: pointer;
  text-align: left;
  position: relative;
  overflow: hidden;
}
.theme-inkwash .poem-card {
  background: linear-gradient(135deg, #2a2520 0%, #1a1a1a 100%);
}
.poem-eyebrow {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 2px 8px;
  border-radius: 2px;
  margin-bottom: 12px;
}
.poem-content {
  margin: 0;
  padding: 0;
  border: none;
}
.poem-text {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.8;
  letter-spacing: 2px;
  margin: 0 0 16px 0;
}
.poem-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-top: 1px dashed var(--border-light);
  padding-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}
.poem-title { font-style: italic; }
.hover-lift { transition: all 0.3s; }
.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(142, 53, 46, 0.1);
  border-color: var(--accent);
}
</style>
```

- [ ] **Step 2：验证 + 提交**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/FeaturedPoemCard.vue && \
cd /Users/a1/develop/vibecoding/sjg && \
git add display-v2/src/components/homepage/FeaturedPoemCard.vue && \
git commit -m "feat(display-v2): add FeaturedPoemCard component"
```

---

### Task 12：CityQuickCard 城市快速入口卡

**Files:**
- Create: `display-v2/src/components/homepage/CityQuickCard.vue`

- [ ] **Step 1：创建文件**

```vue
<!-- display-v2/src/components/homepage/CityQuickCard.vue -->
<template>
  <article class="city-card card hover-lift" @click="$emit('click')">
    <div class="city-stamp">{{ city[0] }}</div>
    <div class="city-body">
      <h3 class="city-name">{{ city }}</h3>
      <p v-if="poem" class="city-poem">「{{ poem }}」</p>
    </div>
    <span class="city-arrow">→</span>
  </article>
</template>

<script setup>
defineProps({
  city: { type: String, required: true },
  poem: { type: String, default: '' },
})
defineEmits(['click'])
</script>

<style scoped>
.city-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.city-stamp {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #8e352e;
  color: #fff;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  border-radius: 2px;
  letter-spacing: 0;
}
.theme-real .city-stamp { background: #c23a2b; }
.city-body { flex: 1; min-width: 0; }
.city-name {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  letter-spacing: 2px;
}
.city-poem {
  font-size: 11px;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.city-arrow {
  color: var(--text-muted);
  font-size: 16px;
  transition: transform 0.3s;
}
.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(61, 43, 31, 0.1);
  border-color: var(--accent);
}
.hover-lift:hover .city-arrow { transform: translateX(4px); color: var(--accent); }
</style>
```

- [ ] **Step 2：验证 + 提交**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/CityQuickCard.vue && \
cd /Users/a1/develop/vibecoding/sjg && \
git add display-v2/src/components/homepage/CityQuickCard.vue && \
git commit -m "feat(display-v2): add CityQuickCard component"
```

---

### Task 13：SkeletonBlock + ErrorState 工具组件

**Files:**
- Create: `display-v2/src/components/homepage/SkeletonBlock.vue`
- Create: `display-v2/src/components/homepage/ErrorState.vue`

- [ ] **Step 1：创建 SkeletonBlock**

```vue
<!-- display-v2/src/components/homepage/SkeletonBlock.vue -->
<template>
  <div class="skeleton-block" :style="{ height: height, width: width }">
    <div class="skeleton-shimmer"></div>
  </div>
</template>

<script setup>
defineProps({
  height: { type: String, default: '120px' },
  width: { type: String, default: '100%' },
})
</script>

<style scoped>
.skeleton-block {
  position: relative;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  overflow: hidden;
}
.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 1.6s infinite;
}
@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
</style>
```

- [ ] **Step 2：创建 ErrorState**

```vue
<!-- display-v2/src/components/homepage/ErrorState.vue -->
<template>
  <div class="error-state-block">
    <p class="error-icon">!</p>
    <p class="error-text">{{ message || '加载失败，请稍后重试' }}</p>
    <button v-if="retry" class="error-retry" @click="$emit('retry')">重新加载</button>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  retry: { type: Boolean, default: true },
})
defineEmits(['retry'])
</script>

<style scoped>
.error-state-block {
  text-align: center;
  padding: 40px 20px;
}
.error-icon {
  font-size: 36px;
  font-weight: 900;
  color: var(--accent);
  opacity: 0.5;
  margin: 0 0 12px 0;
}
.error-text {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}
.error-retry {
  padding: 6px 18px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}
.error-retry:hover {
  color: var(--accent);
  border-color: var(--accent);
}
</style>
```

- [ ] **Step 3：验证 + 提交**

```bash
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/SkeletonBlock.vue && \
test -f /Users/a1/develop/vibecoding/sjg/display-v2/src/components/homepage/ErrorState.vue && \
cd /Users/a1/develop/vibecoding/sjg && \
git add display-v2/src/components/homepage/ && \
git commit -m "feat(display-v2): add SkeletonBlock and ErrorState utility components"
```

---

## Phase 3：页面集成

### Task 14：重写 MapView（山河图志）

**Files:**
- Modify: `display-v2/src/views/MapView.vue`

- [ ] **Step 1：在 template 顶部插入 Hero（修改 lines 1-15 之后）**

在 `MapView.vue` 的 `<template>` 块最顶部（`<div class="map-view">` 内、`<div v-if="errorMsg">` 之前）插入：

```vue
    <HeroBanner
      eyebrow="山东 · 黄河入海"
      title="山河图志"
      subtitle="数字人文视域下黄河流域（山东段）文学景观时空交互"
      :stats="mapStats"
      cta-label="开启沉浸式探索"
      ambient-variant="river"
      @cta="scrollToMap"
    />
```

- [ ] **Step 2：包装原 3D 容器为可滚动 section**

找到 `<div class="real-3d-container" v-if="isReal">` 整段，包裹：

```vue
    <section ref="mapSection" id="map-section" class="map-section">
      <!-- 原 real-3d-container 内容 -->
    </section>
```

并在 `<div class="anime-ink-container animate-fade-in" v-else>` 整段同样包裹：

```vue
    <section ref="mapSection" id="map-section" class="map-section">
      <!-- 原 anime-ink-container 内容 -->
    </section>
```

- [ ] **Step 3：在 AiChatBox 之前插入推荐位 + 九城卡（修改 lines 181 之前）**

在 `<AiChatBox />` 之前插入：

```vue
    <!-- 本期推荐 -->
    <section v-if="data.map.featuredSpots.length || data.map.featuredPoems.length" class="featured-row">
      <SectionHeading eyebrow="本期推荐" title="齐鲁胜迹 · 一席之地" subtitle="编辑部精选两处代表性文学景观" />
      <div class="featured-grid">
        <FeaturedSpotCard
          v-for="spot in data.map.featuredSpots"
          :key="spot.id"
          :spot="spot"
          @click="$router.push(`/spots/${spot.id}`)"
        />
        <FeaturedPoemCard
          v-if="data.map.featuredPoems[0]"
          :poem="data.map.featuredPoems[0]"
          @click="$router.push(`/poems/${data.map.featuredPoems[0].id}`)"
        />
      </div>
    </section>

    <!-- 九城快速入口 -->
    <section v-if="data.map.cities.length" class="cities-section">
      <SectionHeading eyebrow="沿黄九城" title="九府通衢 · 黄河入海" subtitle="自菏泽入境，至东营归海，沿黄九城一站直达" />
      <div class="cities-grid">
        <CityQuickCard
          v-for="city in data.map.cities"
          :key="city.name || city"
          :city="city.name || city"
          :poem="city.poem || ''"
          @click="$router.push(`/regions/${city.name || city}`)"
        />
      </div>
    </section>
```

- [ ] **Step 4：在 `<script setup>` 添加 imports、state、handlers**

在 `import { mockCities } from '../config/mockDetailData'` 之后加：

```javascript
import { ref as useRef, onMounted as useMounted } from 'vue'
import HeroBanner from '../components/homepage/HeroBanner.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'
import FeaturedSpotCard from '../components/homepage/FeaturedSpotCard.vue'
import FeaturedPoemCard from '../components/homepage/FeaturedPoemCard.vue'
import CityQuickCard from '../components/homepage/CityQuickCard.vue'
import { useHomepageData } from '../composables/useHomepageData'
```

- [ ] **Step 5：实例化 data composable + mapSection ref + scrollToMap**

在 `const { isReal, isAnime } = useTheme()` 之后加：

```javascript
const { state: data, fetchMap } = useHomepageData()
const mapStats = useRef([])
const mapSection = useRef(null)

const scrollToMap = () => {
  mapSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

useMounted(() => {
  fetchMap().then(() => {
    const s = data.map.stats
    mapStats.value = [
      { value: s.spots || 10, suffix: '处', label: '核心景点' },
      { value: s.poets || 6, suffix: '位', label: '文人大家' },
      { value: s.poems || 8, suffix: '篇', label: '传世名篇' },
      { value: s.cities || 9, suffix: '城', label: '沿黄城市' },
    ]
  })
})
```

- [ ] **Step 6：在 `<style scoped>` 末尾追加新样式**

在 `</style>` 之前加：

```css
.map-section {
  min-height: calc(100vh - var(--nav-height));
  position: relative;
}
.featured-row,
.cities-section {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 40px;
}
.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.cities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) {
  .featured-grid { grid-template-columns: repeat(2, 1fr); }
  .cities-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .featured-grid,
  .cities-grid { grid-template-columns: 1fr; }
  .featured-row,
  .cities-section { padding: 0 20px; }
}
```

- [ ] **Step 7：本地启动并验证**

```bash
cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run dev &
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5175/
```

Expected: 200
浏览器手动打开 `http://localhost:5175/map`，确认 Hero 显示 + 3D 地图仍在 + 推荐位与九城卡可见。

- [ ] **Step 8：提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/views/MapView.vue
git commit -m "feat(display-v2): add Hero, featured row and 9-city section to MapView"
```

---

### Task 15：重写 PoetList（齐鲁名士）

**Files:**
- Modify: `display-v2/src/views/PoetList.vue`

- [ ] **Step 1：在 `<div class="poets-view">` 内顶部插入 Hero**

```vue
    <HeroBanner
      eyebrow="齐鲁文脉"
      title="齐鲁名士"
      subtitle="探寻黄河流域历代齐鲁大家之生平轨迹与文学连结"
      :stats="poetStats"
      cta-label="切换至「关系图谱」视图"
      ambient-variant="seal"
      @cta="activateGraphTab"
    />
```

- [ ] **Step 2：在 Graph tab 之前插入推荐位 section（在 `<div class="graph-tab-content">` 之前）**

```vue
    <!-- 本期推荐 -->
    <section v-if="poetData.poets.featured.length || poetData.poets.poemOfDay" class="poets-featured">
      <SectionHeading eyebrow="本期推荐" title="二安遗韵 · 名士新声" subtitle="编辑部今日精选两位代表人物与一首传世名句" />
      <div class="poets-featured-grid">
        <FeaturedPoetCard
          v-for="poet in poetData.poets.featured"
          :key="poet.id"
          :poet="poet"
          @click="$router.push(`/poets/${poet.id}`)"
        />
        <FeaturedPoemCard
          v-if="poetData.poets.poemOfDay"
          :poem="poetData.poets.poemOfDay"
          @click="$router.push(`/poems/${poetData.poets.poemOfDay.id}`)"
        />
      </div>
    </section>
```

- [ ] **Step 3：调整 G6 图谱容器高度为 360px（修改 line 580 区域）**

找到 `.g6-container-canvas { height: 520px; ... }`，改为：

```css
.g6-container-canvas {
  width: 100%;
  height: 360px;
  /* 其余不变 */
}
```

并在 `<div ref="g6Container" class="g6-container-canvas"></div>` 后加：

```vue
        <div class="graph-cta">
          <button class="graph-expand-btn" @click="activeTab = 'graph'">展开完整关系图谱 →</button>
        </div>
```

- [ ] **Step 4：更新 `<script setup>` imports**

在 `import { Graph } from '@antv/g6'` 之前加：

```javascript
import HeroBanner from '../components/homepage/HeroBanner.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'
import FeaturedPoetCard from '../components/homepage/FeaturedPoetCard.vue'
import FeaturedPoemCard from '../components/homepage/FeaturedPoemCard.vue'
import { useHomepageData } from '../composables/useHomepageData'
```

- [ ] **Step 5：实例化 data composable + poetStats + activateGraphTab**

在 `const { isAnime } = useTheme()` 之后加：

```javascript
const { state: poetData, fetchPoets } = useHomepageData()
const poetStats = ref([])

const activateGraphTab = () => {
  activeTab.value = 'graph'
  nextTick(() => setTimeout(initG6, 100))
}
```

在 `onMounted` 内 `poets.value = data.records` 之后加：

```javascript
  fetchPoets().then(() => {
    const s = poetData.poets.stats
    poetStats.value = [
      { value: s.poets || 6, suffix: '位', label: '代表人物' },
      { value: s.dynasties || 4, suffix: '朝', label: '跨越朝代' },
      { value: s.poems || 8, suffix: '篇', label: '传世名篇' },
      { value: s.locations || 50, suffix: '+', label: '创作地点' },
    ]
  })
```

- [ ] **Step 6：在 `<style scoped>` 末尾追加样式**

```css
.poets-featured {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 40px;
}
.poets-featured-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.graph-cta {
  margin-top: 16px;
  text-align: center;
}
.graph-expand-btn {
  padding: 10px 24px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s;
}
.graph-expand-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(142, 53, 46, 0.2);
}
@media (max-width: 1024px) {
  .poets-featured-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .poets-featured-grid { grid-template-columns: 1fr; }
  .poets-featured { padding: 0 20px; }
}
```

- [ ] **Step 7：本地启动并验证**

```bash
cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run dev &
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5175/poets
```

Expected: 200。浏览器打开 `http://localhost:5175/poets`，确认 Hero + 名士墙 + 图谱预览 + 推荐位。

- [ ] **Step 8：提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/views/PoetList.vue
git commit -m "feat(display-v2): add Hero, featured row and graph preview to PoetList"
```

---

### Task 16：重写 Timeline（文脉长河）

**Files:**
- Modify: `display-v2/src/views/Timeline.vue`

- [ ] **Step 1：替换 `page-hero` 为 HeroBanner**

把 `<div class="page-hero">` 整段替换为：

```vue
    <HeroBanner
      eyebrow="朝代年轮"
      title="文脉长河"
      subtitle="沿着历史的河流，见证诗与时代的交响"
      :stats="timelineStats"
      cta-label="查看完整年表"
      ambient-variant="particles"
      @cta="scrollToTimeline"
    />
```

- [ ] **Step 2：在 timeline-container 后追加同期推荐 + 跨朝代对比**

```vue
    <section v-if="selectedDynasty" class="sync-recommend">
      <SectionHeading
        :eyebrow="dynastyNames[selectedDynasty] || '本期推荐'"
        :title="`${dynastyNames[selectedDynasty] || ''} · 同期名士与名篇`"
        subtitle="沿时间线点选朝代，查看该时期的代表人物与传世诗篇"
      />
      <div v-if="syncDataLoading" class="sync-loading">
        <SkeletonBlock height="200px" />
      </div>
      <div v-else-if="syncData" class="sync-grid">
        <div v-for="poet in syncData.poets" :key="poet.id" class="sync-poet-item">
          <span class="sync-poet-name">{{ poet.name }}</span>
          <span class="sync-poet-dyn">[{{ dynastyNames[poet.dynastyId] }}]</span>
        </div>
        <div v-for="poem in syncData.poems" :key="poem.id" class="sync-poem-item">
          <blockquote>{{ poem.content }}</blockquote>
          <cite>—— {{ poem.author }}</cite>
        </div>
      </div>
    </section>

    <section class="dynasty-evolution">
      <SectionHeading
        eyebrow="诗风演变"
        title="跨朝代对比 · 五千年文脉"
        subtitle="从诗经现实主义到元曲民俗，一脉相承又各具风姿"
      />
      <div class="evolution-timeline">
        <div v-for="(stage, i) in evolution" :key="i" class="evolution-stage">
          <span class="stage-name">{{ stage.name }}</span>
          <span class="stage-style">{{ stage.style }}</span>
          <span v-if="i < evolution.length - 1" class="stage-arrow">→</span>
        </div>
      </div>
    </section>
```

- [ ] **Step 3：更新 `<script setup>`**

替换整个 script 块：

```javascript
<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import api from '../api'
import HeroBanner from '../components/homepage/HeroBanner.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import TimelineItem from '../components/TimelineItem.vue'
import { useHomepageData } from '../composables/useHomepageData'

const timeline = ref([])
const loaded = ref(false)
const errorMsg = ref(null)
const timelineStats = ref([])
const timelineRef = ref(null)
const selectedDynasty = ref(null)
const syncData = ref(null)
const syncDataLoading = ref(false)
const { state: homeData, fetchTimeline, fetchTimelineByDynasty } = useHomepageData()

const dynastyNames = {
  1: '先秦', 2: '秦汉', 3: '魏晋南北朝', 4: '唐代',
  5: '宋代', 6: '元代', 7: '明代', 8: '清代'
}

const evolution = [
  { name: '诗经', style: '现实主义' },
  { name: '楚辞', style: '浪漫主义' },
  { name: '唐诗', style: '气象万千' },
  { name: '宋词', style: '婉约豪放' },
  { name: '元曲', style: '民俗市井' },
]

const loadTimeline = async () => {
  errorMsg.value = null
  try {
    timeline.value = await api.get('/timeline')
  } catch (err) {
    console.error('加载朝代时间线失败:', err)
    errorMsg.value = '加载朝代数据失败，请稍后重试'
  } finally {
    loaded.value = true
  }
}

const scrollToTimeline = () => {
  timelineRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const onSelectDynasty = async (dynastyId) => {
  selectedDynasty.value = dynastyId
  syncDataLoading.value = true
  await fetchTimelineByDynasty(dynastyId)
  syncData.value = homeData.timeline.featuredByDynasty[dynastyId]
  syncDataLoading.value = false
}

onMounted(async () => {
  await loadTimeline()
  await fetchTimeline()
  const s = homeData.timeline.stats
  timelineStats.value = [
    { value: s.dynasties || 8, suffix: '朝', label: '朝代跨度' },
    { value: s.events || 50, suffix: '+', label: '关键事件' },
    { value: s.poets || 6, suffix: '位', label: '代表人物' },
    { value: s.poems || 8, suffix: '篇', label: '传世名篇' },
  ]
})
</script>
```

- [ ] **Step 4：在 TimelineItem 上加 @click 事件**

将 `<TimelineItem ... />` 改为：

```vue
        <TimelineItem
          v-for="item in timeline"
          :key="item.dynasty.id"
          :dynasty="item.dynasty"
          :events="item.events"
          :poets="item.poets"
          :poems="item.poems"
          @click="onSelectDynasty(item.dynasty.id)"
        />
```

> 注：若 TimelineItem 内部根元素没有 emit click，需在 TimelineItem.vue 根节点加 `@click="$emit('click')"`。

- [ ] **Step 5：在 `<style scoped>` 末尾追加样式**

```css
.sync-recommend,
.dynasty-evolution {
  max-width: 1000px;
  margin: 0 auto 60px;
  padding: 0 24px;
}
.sync-loading { margin-top: 20px; }
.sync-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
}
.sync-poet-item,
.sync-poem-item {
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 4px;
}
.sync-poet-name {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-right: 8px;
}
.sync-poet-dyn {
  font-size: 12px;
  color: var(--accent);
}
.sync-poem-item blockquote {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  font-style: italic;
}
.sync-poem-item cite {
  font-size: 12px;
  color: var(--text-muted);
  font-style: normal;
}
.evolution-timeline {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 4px;
}
.evolution-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: rgba(184, 134, 11, 0.04);
}
.stage-name {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.stage-style {
  font-size: 11px;
  color: var(--accent);
  margin-top: 4px;
}
.stage-arrow {
  font-size: 20px;
  color: var(--accent);
  font-weight: 700;
}
@media (max-width: 768px) {
  .sync-grid { grid-template-columns: 1fr; }
  .evolution-timeline { gap: 8px; padding: 12px; }
  .stage-arrow { display: none; }
}
```

- [ ] **Step 6：本地启动并验证**

```bash
cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run dev &
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5175/timeline
```

Expected: 200。浏览器打开 `http://localhost:5175/timeline`，确认 Hero + 时间线 + 同期推荐 + 跨朝代对比。

- [ ] **Step 7：提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/views/Timeline.vue
git commit -m "feat(display-v2): add Hero, sync recommendations and dynasty evolution to Timeline"
```

---

## Phase 4：验收

### Task 17：双主题视觉验收

**Files:** (无)

- [ ] **Step 1：本地 dev server 已运行**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5175/
```

Expected: 200

- [ ] **Step 2：在 real 主题下访问三个页面并截图**

```bash
# 浏览器手动：
# 1) 打开 http://localhost:5175/map  → 截图
# 2) 打开 http://localhost:5175/poets → 截图
# 3) 打开 http://localhost:5175/timeline → 截图
# 保存为 docs/superpowers/screenshots/2026-07-01-{map,poets,timeline}-real.png
```

- [ ] **Step 3：切换至 inkwash 主题并截图**

```bash
# 浏览器点击右上角"主题切换"按钮，再访问三个页面并截图
# 保存为 docs/superpowers/screenshots/2026-07-01-{map,poets,timeline}-inkwash.png
```

- [ ] **Step 4：人工对照 DoD 列表逐项打勾**

逐条对照 spec §七 11 条 DoD，记录未达标项。

- [ ] **Step 5：如有未达标项，单独修复并 commit**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add <修复文件>
git commit -m "fix(display-v2): address acceptance gaps from D17 review"
```

---

### Task 18：移动端响应式验收

**Files:** (无)

- [ ] **Step 1：Chrome DevTools 切换至 iPhone 12 (390x844)**

访问 `http://localhost:5175/map`、`/poets`、`/timeline` 三个页面。

- [ ] **Step 2：逐项检查**

- [ ] Hero 标题字号自动缩小（已通过 @media (max-width: 768px) 实现）
- [ ] 卡片墙单列布局
- [ ] 名士墙单列
- [ ] 3D 地图 / G6 图谱在移动端仍可用

- [ ] **Step 3：如有视觉问题，单独修复并 commit**

---

### Task 19：内存泄漏 / ScrollTrigger 清理验收

**Files:** (无)

- [ ] **Step 1：检查 onBeforeUnmount 是否在所有使用 useReveal / useAmbientFx / StatTicker 的组件中存在**

```bash
cd /Users/a1/develop/vibecoding/sjg/display-v2/src
grep -l "useReveal\|useAmbientFx\|StatTicker" components/homepage/ views/
```

Expected: 列出所有相关文件。

- [ ] **Step 2：打开 Chrome DevTools → Performance Memory → 多次切换三个页面，记录堆**

- [ ] **Step 3：人工检查是否还有遗留 ScrollTrigger**

```javascript
// 在浏览器 Console 运行：
window.ScrollTrigger?.getAll().length
```

Expected: 切换页面后该值不持续增长（≤10）。

- [ ] **Step 4：如有泄漏，定位并修复（最常见遗漏：`HeroBanner` 未在 onBeforeUnmount 清理 GSAP timeline）**

```javascript
// 在 HeroBanner.vue 的 script setup 中追加：
import { onBeforeUnmount } from 'vue'
let entranceTimeline = null
onMounted(() => {
  // ... 把 const tl = gsap.timeline(...) 改为 entranceTimeline = gsap.timeline(...)
})
onBeforeUnmount(() => {
  entranceTimeline?.kill()
})
```

- [ ] **Step 5：修复后重新验收（回到 Task 19 Step 2）**

---

### Task 20：最终提交并推送

**Files:** (无)

- [ ] **Step 1：检查 git status 干净**

```bash
cd /Users/a1/develop/vibecoding/sjg
git status
```

Expected: 无未提交修改

- [ ] **Step 2：查看所有新提交**

```bash
git log --oneline origin/master..HEAD
```

- [ ] **Step 3：推送**

```bash
git push origin master
```

- [ ] **Step 4：完成。**

---

## 自审

1. **Spec 覆盖**：spec §一（架构）→ Task 1, 2, 3, 4 · §二（三页面设计）→ Task 14, 15, 16 · §三（数据流）→ Task 4 · §四（动效）→ Task 2, 3, 7, 8 · §五（错误处理）→ Task 13 · §六（测试）→ Task 17, 18, 19 · §七（DoD 11 条）→ Task 17 · 全部覆盖。

2. **占位符扫描**：未发现 TBD / TODO / "implement later"。

3. **类型一致性**：
   - `useReveal(refs, options)` 的 `refs` 是 `Ref<HTMLElement|null>[]`
   - `useAmbientFx(containerRef, variant)` 参数对齐
   - `useHomepageData()` 暴露 `state` / `fetchMap` / `fetchPoets` / `fetchTimeline` / `fetchTimelineByDynasty`
   - `state.map.featuredSpots` / `state.poets.featured` / `state.poets.poemOfDay` / `state.timeline.featuredByDynasty[id]` 全部对齐
   - 组件 props: `eyebrow`、`title`、`subtitle`、`cta-label`（HeroBanner） / `stats`（StatTicker） / `spot` / `poet` / `poem`（推荐卡） — 一致

4. **范围检查**：单一连贯功能（一种设计语言 + 13 新组件 + 3 页面改造），可作为一个 plan 实施。
