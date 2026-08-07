# P2 视觉升级（页面改造批次）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 display-v2 任务追踪文档（`docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md`）中 P2 视觉升级的页面改造部分：P2-1 收尾提交、P2-2 CityHero 媒体化、P2-3 详情页意境背景、P2-4 图片工程规范、P2-5 验收。

**Architecture:** 媒体资源走 `src/themes/manifest.js` 的 `resolveAsset(key)`（构建期 `import.meta.glob` 扫描 `public/media/{real,inkwash}/`，缺素材自动回退插画）。主题状态走 `useTheme()`（`isReal` / `resolveAsset`）。纯逻辑（城市 Hero 媒体回退、意境背景选图）抽为 `src/utils/` 纯函数，用 node 内置 test runner 单测（`tests/` 目录，`.vue` 不可测，只测纯函数）。视觉改动以 `npm run build` + dev server 人工走查验收。

**Tech Stack:** Vue 3 (script setup)、GSAP、Vite、node:test。

**前置状态（已确认）：**
- 当前分支 `feat/display-v2-relation-graph-v2`，P2-1 RiverHero 改造代码已在工作区未提交（含 3 行调试 console.log 需删）。
- 素材已就位：`public/media/real/hero-map.mp4(+poster)`、`public/media/inkwash/hero-open.mp4(+poster)`、`hero-scroll.png`、`public/media/real/spots/*.png ×3`。
- 九城 real 实景 hero 图（P2-M5）⏸ 后期生成，本轮只做"丢文件即生效"的回退链路。
- `tests/` 目录不存在但 package.json 已配 `npm test` → Task 2 顺带创建。

---

### Task 1: P2-1 RiverHero 收尾（删调试代码 + 构建 + 提交）

**Files:**
- Modify: `display-v2/src/components/homepage/RiverHero.vue`

- [ ] **Step 1: 删除 onMounted 内 3 行调试日志与未用 import**

`RiverHero.vue` 的 `onMounted` 开头删除：

```js
  // 临时调试：确认 manifest 扫描与 resolveAsset 返回
  console.log('[RiverHero] manifest real keys=', Object.keys(assetManifest.real || {}))
  console.log('[RiverHero] manifest inkwash keys=', Object.keys(assetManifest.inkwash || {}))
  console.log('[RiverHero] isReal=', isReal.value, 'heroBg=', heroBg.value, 'inkOpen=', inkOpen.value)
```

script 顶部删除（debug 日志删除后无引用）：

```js
import { assetManifest } from '../../themes/manifest'
```

- [ ] **Step 2: 确认无残留引用**

Run: `cd display-v2 && grep -n "assetManifest\|console.log" src/components/homepage/RiverHero.vue`
Expected: 无输出

- [ ] **Step 3: 构建验证**

Run: `cd display-v2 && npm run build`
Expected: 构建成功，无新 warning；`hero-map.mp4` 等资源不出现在 chunk 中（public 目录原样拷贝）

- [ ] **Step 4: dev 人工走查**

Run: `cd display-v2 && npm run dev`（后端可不启，首页 Hero 不依赖 API）
检查清单：
- real 主题：全屏黄河航拍视频 + 深色蒙版 + 浅色文字浮上，CTA 浅色
- inkwash 主题：左侧晕染开场视频播完 → 定格 `hero-scroll.png` 长卷，右侧文字不变
- 切主题：布局/媒体跟随切换，inkwash 切回重播开场
- 系统开"减少动态效果"：两主题均降级静态图

- [ ] **Step 5: 提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/components/homepage/RiverHero.vue display-v2/public/media
git commit -m "feat(display-v2): P2-1 首页双风格 Hero -- real 视频背景 / inkwash 晕染开场定格长卷"
```

---

### Task 2: 城市 Hero 媒体回退纯函数 + 单测

**Files:**
- Create: `display-v2/src/utils/cityHeroMedia.js`
- Create: `display-v2/tests/cityHeroMedia.test.js`
- Modify: `display-v2/src/config/cityIllustrations.js`（加 slug 映射导出）

- [ ] **Step 1: 写失败测试**

Create `display-v2/tests/cityHeroMedia.test.js`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveCityHeroMedia } from '../src/utils/cityHeroMedia.js'

const illustration = '/assets/city-jinan.png'

test('inkwash 恒用插画，不查 manifest', () => {
  const resolveAsset = () => ({ url: '/media/inkwash/x.mp4', type: 'video', poster: null })
  const r = resolveCityHeroMedia({ isReal: false, slug: 'jinan', resolveAsset, illustration })
  assert.deepEqual(r, { type: 'image', url: illustration, poster: null, kind: 'illustration' })
})

test('real 有素材时用 manifest 媒体（视频）', () => {
  const resolveAsset = (key) =>
    key === 'city-jinan' ? { url: '/media/real/cities/jinan.mp4', type: 'video', poster: '/media/real/cities/jinan-poster.jpg' } : null
  const r = resolveCityHeroMedia({ isReal: true, slug: 'jinan', resolveAsset, illustration })
  assert.deepEqual(r, { url: '/media/real/cities/jinan.mp4', type: 'video', poster: '/media/real/cities/jinan-poster.jpg', kind: 'media' })
})

test('real 缺素材时回退插画', () => {
  const resolveAsset = () => null
  const r = resolveCityHeroMedia({ isReal: true, slug: 'jinan', resolveAsset, illustration })
  assert.deepEqual(r, { type: 'image', url: illustration, poster: null, kind: 'illustration' })
})

test('real 缺素材且无插画返回 null', () => {
  const r = resolveCityHeroMedia({ isReal: true, slug: 'nowhere', resolveAsset: () => null, illustration: null })
  assert.equal(r, null)
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd display-v2 && node --test tests/cityHeroMedia.test.js`
Expected: FAIL（`Cannot find module '../src/utils/cityHeroMedia.js'`）

- [ ] **Step 3: 实现纯函数**

Create `display-v2/src/utils/cityHeroMedia.js`：

```js
// 解析城市页 Hero 媒体。
// real：优先 manifest 城市实景媒体（`city-{slug}`，视频优先），缺素材回退国画插画；
// inkwash：恒用国画插画（卷轴展开动画由组件层处理）。
// 返回 { type:'video'|'image', url, poster, kind:'media'|'illustration' } 或 null。
export const resolveCityHeroMedia = ({ isReal, slug, resolveAsset, illustration }) => {
  if (!isReal) {
    return illustration ? { type: 'image', url: illustration, poster: null, kind: 'illustration' } : null
  }
  const media = slug ? resolveAsset(`city-${slug}`) : null
  if (media) return { ...media, kind: 'media' }
  return illustration ? { type: 'image', url: illustration, poster: null, kind: 'illustration' } : null
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd display-v2 && node --test tests/cityHeroMedia.test.js`
Expected: PASS（4 个用例）

- [ ] **Step 5: 加城市 slug 映射**

`display-v2/src/config/cityIllustrations.js` 末尾（`CITY_ILLUSTRATIONS` 定义之后）追加：

```js
// 城市名 -> 素材 slug（与 public/media/real/cities/ 文件命名对应，供 resolveCityHeroMedia 使用）
export const CITY_SLUGS = {
  菏泽: 'heze',
  济宁: 'jining',
  泰安: 'taian',
  聊城: 'liaocheng',
  济南: 'jinan',
  德州: 'dezhou',
  淄博: 'zibo',
  滨州: 'binzhou',
  东营: 'dongying',
}
```

- [ ] **Step 6: 提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/utils/cityHeroMedia.js display-v2/tests/ display-v2/src/config/cityIllustrations.js
git commit -m "feat(display-v2): P2-2 城市 Hero 媒体回退纯函数 + 单测"
```

---

### Task 3: CityHero 媒体化 + RegionSpots 接线

**Files:**
- Modify: `display-v2/src/components/homepage/CityHero.vue`
- Modify: `display-v2/src/views/RegionSpots.vue`

- [ ] **Step 1: CityHero 模板改造 — 背景层抽出为独立 div，支持视频/插画两种媒体**

模板第 2 行整段替换。原：

```html
  <section ref="heroRef" class="city-hero" :style="{ backgroundImage: `url(${illustration})` }">
    <div class="city-hero__veil"></div>
```

新：

```html
  <section ref="heroRef" class="city-hero">
    <!-- 背景媒体层：视频（real 有素材）或图片（插画/实景图） -->
    <div ref="bgRef" class="city-hero__bg" aria-hidden="true">
      <video
        v-if="media?.type === 'video' && !reduce"
        class="city-hero__bg-media"
        :src="media.url"
        :poster="media.poster"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      />
      <div
        v-else
        class="city-hero__bg-media city-hero__bg-media--img"
        :style="{ backgroundImage: `url(${media?.url || illustration})` }"
      ></div>
    </div>
    <div class="city-hero__veil"></div>
```

- [ ] **Step 2: CityHero script 加 props / ref / 入场动画**

props 块（第 50-59 行）追加 `media`：

```js
  media: { type: Object, default: null }, // resolveCityHeroMedia 返回值；null 时回退 illustration
```

script 中 `const heroRef = ref(null)` 之后加：

```js
import { useTheme } from '../../composables/useTheme'

const { isReal } = useTheme()
const bgRef = ref(null)
const reduce = ref(
  typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)
```

（`import { useTheme }` 放到文件顶部 import 区，勿放 mid-script；上面仅为位置示意。）

`onMounted` 的 gsap timeline 创建之后（`tl.fromTo(el.querySelector('.city-hero__veil'), ...)` 这行之前）插入 inkwash 卷轴横展开场：

```js
  // inkwash 插画：卷轴横向展开（从左到右揭示）；reduced-motion 跳过
  if (!isReal.value && !reduce.value && bgRef.value) {
    tl.fromTo(
      bgRef.value,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.inOut' },
      0,
    )
  }
```

并把原 veil 行的 `tl.fromTo(` 改为接在插入代码后（链式调用首行改为 `tl.fromTo(...)` 续接不变，只需保证插入代码在其之前且原链首句以 `tl.fromTo` 开头即可）。

- [ ] **Step 3: CityHero CSS — 背景层样式**

`.city-hero` 规则中删除 `background-size: cover;` 与 `background-position: center 30%;` 两行（背景移到 `__bg` 层）。新增：

```css
.city-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.city-hero__bg-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.city-hero__bg-media--img {
  background-size: cover;
  background-position: center 30%;
}
```

媒体查询 `@media (max-width: 768px)` 内 `.city-hero` 的 `background-position: 62% center;` 改为：

```css
  .city-hero__bg-media--img {
    background-position: 62% center;
  }
```

- [ ] **Step 4: RegionSpots 接线**

`display-v2/src/views/RegionSpots.vue`：
- import 区加：

```js
import { useTheme } from '../composables/useTheme'
import { resolveCityHeroMedia } from '../utils/cityHeroMedia'
import { CITY_SLUGS } from '../config/cityIllustrations'
```

- `const illustrationData = computed(...)`（第 228 行附近）之后加：

```js
const { isReal, resolveAsset } = useTheme()
const heroMedia = computed(() =>
  resolveCityHeroMedia({
    isReal: isReal.value,
    slug: CITY_SLUGS[region.value],
    resolveAsset,
    illustration: illustrationData.value?.img,
  }),
)
```

- 模板 `<CityHero` 上加 prop：

```html
        :media="heroMedia"
```

- [ ] **Step 5: 构建 + 走查**

Run: `cd display-v2 && npm run build`
Expected: 成功
dev 走查（任一城 `/regions/济南`）：
- inkwash：插画从左向右卷轴展开，veil/标题入场照常
- real：当前无 `public/media/real/cities/city-jinan.*`，回退插画直出（无展开动画）
- 验证回退链路：临时放一张 `public/media/real/cities/city-jinan.png`，real 下 Hero 变实景图；删掉文件恢复插画
- reduced-motion：无展开动画，直出

- [ ] **Step 6: 提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/components/homepage/CityHero.vue display-v2/src/views/RegionSpots.vue
git commit -m "feat(display-v2): P2-2 CityHero 背景媒体化 -- real 实景媒体回退插画 / inkwash 卷轴展开"
```

---

### Task 4: 详情页意境背景 + PoemDetail 视觉锚点（P2-3）

**Files:**
- Create: `display-v2/src/utils/moodBackdrop.js`
- Create: `display-v2/tests/moodBackdrop.test.js`
- Modify: `display-v2/src/views/PoemDetail.vue`
- Modify: `display-v2/src/views/SpotDetail.vue`

- [ ] **Step 1: 写失败测试**

Create `display-v2/tests/moodBackdrop.test.js`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickMoodBackdrop } from '../src/utils/moodBackdrop.js'

test('取首个有效 URL', () => {
  assert.equal(pickMoodBackdrop(null, '/images/spots/taishan.jpg', '/x.png'), '/images/spots/taishan.jpg')
})

test('跳过 data: 占位 SVG', () => {
  assert.equal(pickMoodBackdrop('data:image/svg+xml,%3Csvg', '/images/a.jpg'), '/images/a.jpg')
})

test('全是占位或空返回 null', () => {
  assert.equal(pickMoodBackdrop(null, undefined, 'data:image/svg+xml,%3Csvg', ''), null)
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd display-v2 && node --test tests/moodBackdrop.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现纯函数**

Create `display-v2/src/utils/moodBackdrop.js`：

```js
// 挑选详情页意境背景图：按优先级取首个有效 URL。
// 主题化占位印章是 data: SVG，铺底无意义，视为无图。
export const pickMoodBackdrop = (...candidates) => {
  for (const url of candidates) {
    if (url && typeof url === 'string' && !url.startsWith('data:')) return url
  }
  return null
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd display-v2 && node --test tests/moodBackdrop.test.js`
Expected: PASS

- [ ] **Step 5: SpotDetail 加全页模糊铺底**

模板根节点（第 3 行 `<div class="spot-detail" ...>` 内最前）插入：

```html
    <div v-if="moodBg" class="mood-bg" :style="{ backgroundImage: `url(${moodBg})` }" aria-hidden="true"></div>
```

script 中（`imageUrl` computed 附近）加：

```js
import { pickMoodBackdrop } from '../utils/moodBackdrop'

const moodBg = computed(() => pickMoodBackdrop(imageUrl.value))
```

（import 归入顶部 import 区。）

`<style>` 内追加：

```css
/* 意境背景：关联图模糊铺底，内容层之上无交互 */
.mood-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  filter: blur(60px) saturate(0.85);
  opacity: 0.16;
  pointer-events: none;
}

:global(.theme-inkwash) .mood-bg {
  filter: blur(70px) grayscale(0.4);
  opacity: 0.12;
}
```

（`:global` 在 scoped style 内可用；若该文件 style 非 scoped 则去掉 `:global()` 直接 `.theme-inkwash .mood-bg`。先检查文件头部 `<style scoped>` 与否再写。）

- [ ] **Step 6: PoemDetail 加视觉锚点 Hero 带 + 铺底**

模板中 `.detail-top` 之后、`.poem-header` 之前插入：

```html
    <!-- 视觉锚点：关联景观图 Hero 带 -->
    <div v-if="moodBg" class="poem-hero-anchor" :style="{ backgroundImage: `url(${moodBg})` }" aria-hidden="true">
      <div class="poem-hero-anchor__veil"></div>
    </div>
```

同时在 `.poem-detail` 根 div 内最前插入全页铺底（同 SpotDetail 的 `.mood-bg` 结构）。

script 加：

```js
import { adaptSpot, adaptPoem } from '../composables/themeAdapter'
import { pickMoodBackdrop } from '../utils/moodBackdrop'

// 意境背景：优先诗词自身配图，其次关联景点图；占位印章不算
const moodBg = computed(() =>
  pickMoodBackdrop(
    poem.value ? adaptPoem(poem.value).image : null,
    spot.value ? adaptSpot(spot.value).image : null,
  ),
)
```

CSS 追加：

```css
/* 视觉锚点 Hero 带 */
.poem-hero-anchor {
  position: relative;
  height: 38vh;
  min-height: 220px;
  margin: 0 calc(50% - 50vw); /* 破容器全宽 */
  background-size: cover;
  background-position: center 35%;
}

.poem-hero-anchor__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--bg-primary) 0%, transparent 30%, transparent 70%, var(--bg-primary) 100%);
}
```

（`.mood-bg` 样式与 SpotDetail 相同，重复写入本文件 CSS；`.poem-detail` 需确认有 `position: relative` 上下文，若无则给 `.poem-detail` 加 `position: relative;`。）

- [ ] **Step 7: 构建 + 走查**

Run: `cd display-v2 && npm run build && npm run test:unit`
Expected: 构建成功；测试全 PASS
dev 走查：
- `/spots/:id`：页面背后有该景点图的模糊晕染底色；inkwash 更淡更灰
- `/poems/:id`：顶部 38vh 景观图锚点带，上下羽化融入底色；无图诗（占位印章）不出现锚点带与铺底

- [ ] **Step 8: 提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/utils/moodBackdrop.js display-v2/tests/moodBackdrop.test.js display-v2/src/views/PoemDetail.vue display-v2/src/views/SpotDetail.vue
git commit -m "feat(display-v2): P2-3 详情页意境背景 + PoemDetail 视觉锚点 Hero 带"
```

---

### Task 5: 图片工程规范全站清扫（P2-4）

**Files:**
- Modify: `display-v2/src/views/PoemDetail.vue`（视频 preload）
- Modify: `display-v2/src/views/PoetList.vue`、`PoetAllList.vue`、`RegionSpots.vue`
- Modify: `display-v2/src/components/homepage/FeaturedPoetCard.vue`、`FeaturedSpotCard.vue`、`CityDetailCard.vue`、`CityFeatureSpot.vue`、`RiverCityRail.vue`、`TimelineHero.vue`

规则（全站统一，逐个 `<img>` 判定）：
- **首屏 Hero / LCP 图**（RiverHero、CityHero 背景层、SpotDetail 主图、PoetDetail 头像、TimelineHero 主图）：**不加** `loading="lazy"`，只补 `decoding="async"`。
- **卡片 / 列表图**（PoetList、PoetAllList、RegionSpots 列表、各 `*Card`、RiverCityRail）：加 `loading="lazy" decoding="async"`。
- **景观/景点缩略图**统一 16:10：对应 CSS 类加 `aspect-ratio: 16 / 10; object-fit: cover;`（若已有 `object-fit: cover` 只补 aspect-ratio）。诗人头像保持 1:1 不动。
- 视频：PoemDetail 的 `<video :src="poem.videoUrl" controls>` 加 `preload="none"`。

- [ ] **Step 1: 定位全部待改 img**

Run: `cd display-v2 && grep -rn '<img' src/ --include='*.vue' | grep -v 'loading='`
Expected: 列出 18 处，逐一按下表归类

| 文件 | 归类 | 处理 |
|---|---|---|
| `views/PoetList.vue` | 列表 | lazy + async |
| `views/PoetAllList.vue` | 列表 | lazy + async |
| `views/RegionSpots.vue` | 列表 | lazy + async；景点图类补 16:10 |
| `views/PoetDetail.vue` | 首屏头像 | 仅 async |
| `views/SpotDetail.vue` | 首屏主图 | 仅 async |
| `homepage/FeaturedPoetCard.vue` | 卡片 | lazy + async（头像 1:1 不动） |
| `homepage/FeaturedSpotCard.vue` | 卡片 | lazy + async；补 16:10 |
| `homepage/CityDetailCard.vue` | 卡片 | lazy + async；景点图补 16:10 |
| `homepage/CityFeatureSpot.vue` | 卡片 | lazy + async；补 16:10 |
| `homepage/RiverCityRail.vue` | 卡片 | lazy + async |
| `homepage/TimelineHero.vue` | 首屏 | 仅 async |
| `homepage/RiverHero.vue` | 首屏 | 仅 async（inkwash 长卷图） |

- [ ] **Step 2: 批量加属性 + CSS**

示例（PoetList.vue，其余文件同构）：

```html
<img :src="poet.avatar" :alt="poet.name" loading="lazy" decoding="async" />
```

16:10 示例（FeaturedSpotCard.vue 缩略图类）：

```css
.fsp-card__img {
  aspect-ratio: 16 / 10;
  object-fit: cover;
}
```

（类名以各文件实际为准，先 grep 确认再改。）

- [ ] **Step 3: PoemDetail 视频 preload**

```html
<video :src="poem.videoUrl" controls preload="none" class="video-player" />
```

- [ ] **Step 4: 构建 + 走查**

Run: `cd display-v2 && npm run build`
Expected: 成功
dev 走查：诗人列表/城市页滚动，Network 面板确认屏外图片未提前请求；卡片图比例统一 16:10 无拉伸变形。

- [ ] **Step 5: 提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/views display-v2/src/components/homepage
git commit -m "refactor(display-v2): P2-4 图片工程规范 -- lazy/async 属性 + 景观图 16:10 + 视频 preload=none"
```

---

### Task 6: P2-5 + P1-8 验收与进度回写

- [ ] **Step 1: 全量构建与单测**

Run: `cd display-v2 && npm run build && npm run test:unit`
Expected: 全部通过

- [ ] **Step 2: 人工验收清单（dev server）**

- P2-1/2-2/2-3 各走查项复核（real / inkwash / reduced-motion 三态）
- P1-8：主题来回切换 10 次无白闪（ThemeTransition 已回退为直接切换，确认无闪烁即可；录屏逐帧抽查）
- P2-5 性能：Chrome DevTools Lighthouse（`/map` 首页，移动端档）LCP < 2.5s；首页媒体增量（hero-map.mp4 2.4MB + poster）< 3MB
- 两风格 Hero 录屏对比，确认差异化达成

- [ ] **Step 3: 回写任务追踪文档**

`docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md` 勾选：`P1-8`、`P2-1`、`P2-2`、`P2-3`、`P2-4`、`P2-5`（Lighthouse 若 LCP 未达标，P2-5 标 `[~]` 并注明实测值）。

- [ ] **Step 4: 提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md
git commit -m "docs: P2 视觉升级页面改造批次验收回写"
```

---

## Self-Review 记录

- **Spec 覆盖**：tasks 文档 P2 页面改造段 P2-1~P2-5 全覆盖；P2-M5~M9（素材批量/OSS）与 P3+ 不在本批次。P1-8 顺带验收。
- **占位符扫描**：无 TBD/TODO；CSS 类名需现场 grep 确认处已显式标注。
- **类型一致**：`resolveCityHeroMedia` 返回 `{type,url,poster,kind}`，CityHero `media` prop 消费一致；`pickMoodBackdrop(...candidates)` 返回 `url|null`，两详情页 `moodBg` computed 消费一致。
- **风险**：`tests/` 目录由本计划首次创建（package.json 已配 script）；`import.meta.glob` 仅 Vite 可用，故单测只覆盖纯函数，manifest 层不测。
