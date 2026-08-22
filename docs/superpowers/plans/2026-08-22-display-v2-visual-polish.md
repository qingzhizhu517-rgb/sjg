# Display V2 Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stretched full-screen imagery with a scroll-gallery presentation, make curated inkwash WebP assets win consistently, redesign poem detail as a readable horizontal manuscript, and remove the baked checkerboard behind the timeline boat.

**Architecture:** Pure utility modules own image candidate ordering, curated presentation metadata, solar-term windowing, and poem line normalization. Vue components consume those utilities through narrow interfaces: `SolarTermGallery.vue` owns the 24-image interaction, `PoemManuscript.vue` owns the poem sheet, and `useImage.js` remains the single runtime resolver. Database migration V26 normalizes only the 20 reviewed inkwash records to WebP paths.

**Tech Stack:** Vue 3 Composition API, Vite 8, Node built-in test runner, CSS custom properties, GSAP, MyBatis/MySQL migration SQL, Pillow for the one-time transparent WebP conversion.

---

## File map

**New files**

- `display-v2/src/utils/imageCandidates.js` — pure local-path candidate ordering and existing-path selection.
- `display-v2/src/config/curatedMedia.js` — presentation metadata for the 20 reviewed images.
- `display-v2/tests/imageCandidates.test.js` — image-order and fallback regression tests.
- `display-v2/tests/curatedMedia.test.js` — curated aspect-ratio and fit-policy tests.
- `display-v2/src/config/solarTerms.js` — the 24 terms, locations, and public asset paths.
- `display-v2/src/utils/solarTermGallery.js` — circular index/window helpers.
- `display-v2/tests/solarTermGallery.test.js` — navigation-window regression tests.
- `display-v2/src/components/homepage/SolarTermGallery.vue` — bounded main painting, visible thumbnail strip, controls, pause rules.
- `display-v2/src/components/poem/PoemManuscript.vue` — horizontal poem sheet and annotation disclosure.
- `display-v2/tests/poem.test.js` — poem line-normalization tests.
- `backend/src/main/resources/db/migration/V26__preferred_inkwash_media_paths.sql` — canonical WebP paths for 20 reviewed records.

**Modified files**

- `display-v2/src/composables/useImage.js` — use pure candidates, add multi-field resolver, stop `.png → .jpg` corruption.
- `display-v2/src/composables/themeAdapter.js` — prefer anime fields in the single inkwash theme.
- `display-v2/src/composables/useCityEnrichment.js` — fix image field precedence.
- `display-v2/src/components/homepage/FeaturedPoetCard.vue` — resolve anime-only poets and apply portrait metadata.
- `display-v2/src/components/homepage/FeaturedSpotCard.vue` — resolve anime-only spots and apply scene metadata.
- `display-v2/src/components/homepage/CityFeatureSpot.vue` — consume presentation style instead of unconditional 4:3 crop.
- `display-v2/src/views/PoetDetail.vue` — use unified image resolver and portrait presentation.
- `display-v2/src/views/SpotDetail.vue` — use unified image resolver and scene presentation.
- `display-v2/src/views/RegionSpots.vue` — use unified image resolver for cards.
- `display-v2/src/views/CulturalDetail.vue` — prefer curated WebP and use correct aspect ratio.
- `display-v2/src/views/FoodOperaList.vue` — prefer curated WebP for food/opera cards.
- `display-v2/src/components/homepage/RiverHero.vue` — two-column exhibit layout around `SolarTermGallery`.
- `display-v2/src/utils/poem.js` — add horizontal line normalization.
- `display-v2/src/views/PoemDetail.vue` — delegate the poem sheet to `PoemManuscript` and remove vertical layout CSS.
- `display-v2/public/media/inkwash/timeline/boat-rower.webp` — replace baked checkerboard RGB image with cropped RGBA WebP.
- `display-v2/src/components/timeline/InkTimeline.vue` — correct boat aspect ratio/hit target and contain scene art.

---

### Task 1: Make curated media resolution deterministic

**Files:**

- Create: `display-v2/src/utils/imageCandidates.js`
- Create: `display-v2/src/config/curatedMedia.js`
- Create: `display-v2/tests/imageCandidates.test.js`
- Create: `display-v2/tests/curatedMedia.test.js`
- Modify: `display-v2/src/composables/useImage.js`
- Modify: `display-v2/src/composables/themeAdapter.js`
- Modify: `display-v2/src/composables/useCityEnrichment.js`
- Modify: `display-v2/src/components/homepage/FeaturedPoetCard.vue`
- Modify: `display-v2/src/components/homepage/FeaturedSpotCard.vue`
- Modify: `display-v2/src/components/homepage/CityFeatureSpot.vue`
- Modify: `display-v2/src/views/PoetDetail.vue`
- Modify: `display-v2/src/views/SpotDetail.vue`
- Modify: `display-v2/src/views/RegionSpots.vue`
- Modify: `display-v2/src/views/CulturalDetail.vue`
- Modify: `display-v2/src/views/FoodOperaList.vue`

- [ ] **Step 1: Write failing image-candidate tests**

Create `display-v2/tests/imageCandidates.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildLocalImageCandidates,
  pickExistingImage,
  firstMediaValue,
} from '../src/utils/imageCandidates.js'

test('PNG 数据库路径优先命中同名 WebP，再回退原路径', () => {
  assert.deepEqual(
    buildLocalImageCandidates('/images/poets/li_qingzhao_anime.png'),
    [
      '/images/poets/li_qingzhao_anime.webp',
      '/images/poets/li_qingzhao_anime.png',
    ],
  )
})

test('显式请求水墨候选时，在精确路径之后尝试 _anime 变体', () => {
  assert.deepEqual(
    buildLocalImageCandidates('/images/poets/li_qingzhao.jpg', { inkwash: true }),
    [
      '/images/poets/li_qingzhao.webp',
      '/images/poets/li_qingzhao.jpg',
      '/images/poets/li_qingzhao_anime.webp',
      '/images/poets/li_qingzhao_anime.png',
      '/images/poets/li_qingzhao_anime.jpg',
    ],
  )
})

test('已经带 _anime 的路径不重复追加后缀', () => {
  const paths = buildLocalImageCandidates('/images/spots/daming_lake_anime.png', { inkwash: true })
  assert.equal(paths.filter((path) => path.includes('_anime_anime')).length, 0)
})

test('pickExistingImage 返回第一个真实存在的候选', () => {
  const existing = new Set(['/images/a.png', '/images/a.webp'])
  assert.equal(pickExistingImage('/images/a.png', existing), '/images/a.webp')
})

test('firstMediaValue 跳过空值并保持字段优先顺序', () => {
  assert.equal(firstMediaValue([null, '', '/images/anime.webp', '/images/real.jpg']), '/images/anime.webp')
})
```

Create `display-v2/tests/curatedMedia.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CURATED_MEDIA, getCuratedPresentation } from '../src/config/curatedMedia.js'

test('20 张精选素材全部有展示配置', () => {
  assert.equal(Object.keys(CURATED_MEDIA).length, 20)
})

test('诗人素材使用竖幅展签', () => {
  assert.deepEqual(getCuratedPresentation('/images/poets/li_qingzhao_anime.webp'), {
    aspectRatio: '3 / 4',
    objectFit: 'contain',
    objectPosition: 'center center',
    kind: 'portrait',
  })
})

test('横幅景点保留完整构图', () => {
  assert.equal(getCuratedPresentation('/images/spots/daming_lake_anime.png').objectFit, 'contain')
  assert.equal(getCuratedPresentation('/images/spots/daming_lake_anime.png').aspectRatio, '16 / 9')
})

test('方形文化图使用 1:1', () => {
  assert.equal(getCuratedPresentation('/images/cultural/lu_brocade_weaving.webp').aspectRatio, '1 / 1')
})
```

- [ ] **Step 2: Run the new tests and confirm they fail**

Run from the repository root:

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run test:unit"
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `imageCandidates.js` and `curatedMedia.js`.

- [ ] **Step 3: Implement pure candidate ordering**

Create `display-v2/src/utils/imageCandidates.js`:

```js
const EXT_RE = /\.(?:jpe?g|png|webp)$/i

const unique = (values) => [...new Set(values.filter(Boolean))]

const replaceExtension = (path, extension) =>
  EXT_RE.test(path) ? path.replace(EXT_RE, extension) : path

const appendAnime = (path, extension) => {
  if (!EXT_RE.test(path)) return null
  const base = path.replace(EXT_RE, '')
  return `${base}_anime${extension}`
}

export function buildLocalImageCandidates(rawPath, { inkwash = false } = {}) {
  if (!rawPath || typeof rawPath !== 'string' || !rawPath.startsWith('/')) return []

  const candidates = [replaceExtension(rawPath, '.webp'), rawPath]
  if (inkwash && !/_anime\.(?:jpe?g|png|webp)$/i.test(rawPath)) {
    candidates.push(
      appendAnime(rawPath, '.webp'),
      appendAnime(rawPath, '.png'),
      appendAnime(rawPath, '.jpg'),
    )
  }
  return unique(candidates)
}

export function pickExistingImage(rawPath, existingPaths, options) {
  return buildLocalImageCandidates(rawPath, options)
    .find((candidate) => existingPaths.has(candidate)) || null
}

export function firstMediaValue(values) {
  return values.find((value) => typeof value === 'string' && value.trim()) || null
}
```

- [ ] **Step 4: Add the complete curated presentation map**

Create `display-v2/src/config/curatedMedia.js`:

```js
const portrait = {
  aspectRatio: '3 / 4',
  objectFit: 'contain',
  objectPosition: 'center center',
  kind: 'portrait',
}
const landscape = {
  aspectRatio: '16 / 9',
  objectFit: 'contain',
  objectPosition: 'center center',
  kind: 'landscape',
}
const square = {
  aspectRatio: '1 / 1',
  objectFit: 'cover',
  objectPosition: 'center center',
  kind: 'square',
}

export const CURATED_MEDIA = {
  cao_cao_anime: portrait,
  gu_yanwu_anime: portrait,
  han_yu_anime: portrait,
  li_panlong_anime: portrait,
  li_qingzhao_anime: portrait,
  pu_songling_anime: portrait,
  su_shi_anime: portrait,
  wang_shizhen_anime: portrait,
  wen_tianxiang_anime: portrait,
  xin_qiji_anime: portrait,
  baotu_spring_anime: landscape,
  confucius_temple_anime: landscape,
  daming_lake_anime: landscape,
  mount_tai_anime: {
    ...portrait,
    objectPosition: 'center top',
    kind: 'portrait-scene',
  },
  thousand_buddha_mountain_anime: landscape,
  bengrou_rice: square,
  caozhou_dough_art: square,
  confucius_ceremony: landscape,
  lu_brocade_weaving: square,
  peony_festival: landscape,
}

const basename = (url) => {
  if (!url || typeof url !== 'string') return ''
  const clean = url.split('?')[0].split('#')[0]
  return clean.slice(clean.lastIndexOf('/') + 1).replace(/\.(?:jpe?g|png|webp)$/i, '')
}

export function getCuratedPresentation(url) {
  return CURATED_MEDIA[basename(url)] || {
    aspectRatio: '4 / 3',
    objectFit: 'cover',
    objectPosition: 'center center',
    kind: 'default',
  }
}
```

- [ ] **Step 5: Integrate the pure resolver into `useImage.js`**

Import the helpers and replace the local resolution and compatibility methods with:

```js
import { buildLocalImageCandidates, firstMediaValue } from '../utils/imageCandidates'

const resolveLocal = (rawPath, options = {}) =>
  buildLocalImageCandidates(rawPath, options)
    .find((candidate) => localImages.has(candidate)) || null

const resolveFirstImage = (values, kind = '文', options = {}) => {
  const isAnime = theme.value === 'inkwash'
  for (const value of values) {
    const parsed = parseFirstUrl(value)
    if (!parsed) continue
    if (parsed.startsWith('http://') || parsed.startsWith('https://')) return parsed
    const local = resolveLocal(parsed, options)
    if (local) return local
  }
  return getPlaceholder(isAnime, kind)
}

const resolveImage = (url, kind = '文') => resolveFirstImage([url], kind)

const getImageUrl = (url, isAnime = false) =>
  resolveFirstImage([url], inferKind(url), { inkwash: isAnime })

return {
  getImageUrl,
  resolveImage,
  resolveFirstImage,
  getPlaceholder,
  firstMediaValue,
}
```

Remove the old `rawPath.replace('.png', '.jpg')` and `_anime.jpg` mutation.

- [ ] **Step 6: Make `themeAdapter.js` prefer inkwash database fields**

Replace the single-field adapter with:

```js
import { useImage } from './useImage'

const adaptEntity = (entity, preferredFields, outField, kind) => {
  if (!entity) return entity
  const { resolveFirstImage } = useImage()
  return {
    ...entity,
    [outField]: resolveFirstImage(preferredFields.map((field) => entity[field]), kind),
  }
}

export const adaptSpot = (spot) =>
  adaptEntity(spot, ['imageAnimeUrl', 'imageUrl'], 'image', '景')

export const adaptPoet = (poet) =>
  adaptEntity(poet, ['avatarAnimeUrl', 'avatarUrl'], 'avatar', '文')

export const adaptPoem = (poem) =>
  adaptEntity(poem, ['imageAnimeUrl', 'imageUrl'], 'image', '文')
```

- [ ] **Step 7: Remove real-field gates and apply presentation metadata**

Apply these exact integration rules:

```js
// FeaturedPoetCard.vue
const avatarUrl = computed(() => adaptPoet(props.poet).avatar)
const avatarPresentation = computed(() => getCuratedPresentation(avatarUrl.value))

// FeaturedSpotCard.vue
const imageUrl = computed(() => adaptSpot(props.spot).image)
const imagePresentation = computed(() => getCuratedPresentation(imageUrl.value))

// useCityEnrichment.js
imageUrl: first ? first.imageAnimeUrl || first.imageUrl || null : null,
```

Bind presentation data on curated `<img>` elements:

```vue
:style="{
  objectFit: presentation.objectFit,
  objectPosition: presentation.objectPosition,
}"
```

Bind the containing media frame where the component supports a variable ratio:

```vue
:style="{ aspectRatio: presentation.aspectRatio }"
```

In `PoetDetail.vue`, `SpotDetail.vue`, `RegionSpots.vue`, `CulturalDetail.vue`, and `FoodOperaList.vue`, replace direct `parseFirstUrl(imageAnimeUrl) || parseFirstUrl(imageUrl)` expressions with `resolveFirstImage([imageAnimeUrl, imageUrl], kind)` and derive `getCuratedPresentation(resolvedUrl)` for the rendered frame.

- [ ] **Step 8: Run tests and build**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run test:unit"
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run build"
```

Expected: all tests pass; Vite build exits 0; no `.png` path is silently rewritten to `.jpg`.

- [ ] **Step 9: Commit media resolution**

```bash
git add display-v2/src/utils/imageCandidates.js display-v2/src/config/curatedMedia.js \
  display-v2/tests/imageCandidates.test.js display-v2/tests/curatedMedia.test.js \
  display-v2/src/composables/useImage.js display-v2/src/composables/themeAdapter.js \
  display-v2/src/composables/useCityEnrichment.js \
  display-v2/src/components/homepage/FeaturedPoetCard.vue \
  display-v2/src/components/homepage/FeaturedSpotCard.vue \
  display-v2/src/components/homepage/CityFeatureSpot.vue \
  display-v2/src/views/PoetDetail.vue display-v2/src/views/SpotDetail.vue \
  display-v2/src/views/RegionSpots.vue display-v2/src/views/CulturalDetail.vue \
  display-v2/src/views/FoodOperaList.vue
git commit -m "feat(display): prioritize curated inkwash media"
```

---

### Task 2: Normalize the 20 database media paths to WebP

**Files:**

- Create: `backend/src/main/resources/db/migration/V26__preferred_inkwash_media_paths.sql`

- [ ] **Step 1: Create the exact, idempotent V26 migration**

Create the file with these statements:

```sql
-- V26: 将 20 张人工确认的水墨素材规范为前端优先使用的 WebP 路径。
-- 幂等: UPDATE 写入固定值，重复执行结果相同。
-- 安全边界: 仅更新精确 id/name/title 命中的 anime 字段，不触碰 real 字段。

UPDATE poet SET avatar_anime_url='/images/poets/su_shi_anime.webp' WHERE id=17 AND name='苏轼';
UPDATE poet SET avatar_anime_url='/images/poets/xin_qiji_anime.webp' WHERE name='辛弃疾';
UPDATE poet SET avatar_anime_url='/images/poets/li_qingzhao_anime.webp' WHERE name='李清照';
UPDATE poet SET avatar_anime_url='/images/poets/pu_songling_anime.webp' WHERE id=31 AND name='蒲松龄';
UPDATE poet SET avatar_anime_url='/images/poets/cao_cao_anime.webp' WHERE id=51 AND name='曹操';
UPDATE poet SET avatar_anime_url='/images/poets/gu_yanwu_anime.webp' WHERE id=71 AND name='顾炎武';
UPDATE poet SET avatar_anime_url='/images/poets/wang_shizhen_anime.webp' WHERE id=122 AND name='王士禛';
UPDATE poet SET avatar_anime_url='/images/poets/li_panlong_anime.webp' WHERE id=27 AND name='李攀龙';
UPDATE poet SET avatar_anime_url='/images/poets/han_yu_anime.webp' WHERE id=93 AND name='韩愈';
UPDATE poet SET avatar_anime_url='/images/poets/wen_tianxiang_anime.webp' WHERE id=94 AND name='文天祥';

UPDATE scenic_spot SET image_anime_url='/images/spots/baotu_spring_anime.webp' WHERE id=2 AND name='趵突泉';
UPDATE scenic_spot SET image_anime_url='/images/spots/daming_lake_anime.webp' WHERE id=1 AND name='大明湖';
UPDATE scenic_spot SET image_anime_url='/images/spots/mount_tai_anime.webp' WHERE id=14 AND name='泰山';
UPDATE scenic_spot SET image_anime_url='/images/spots/confucius_temple_anime.webp' WHERE id=21 AND name='曲阜孔庙';
UPDATE scenic_spot SET image_anime_url='/images/spots/thousand_buddha_mountain_anime.webp' WHERE id=3 AND name='千佛山';

UPDATE cultural_item SET image_anime_url='/images/cultural/peony_festival.webp' WHERE id=52 AND title='菏泽国际牡丹文化旅游节（曹州牡丹花会）';
UPDATE cultural_item SET image_anime_url='/images/cultural/confucius_ceremony.webp' WHERE id=53 AND title='曲阜祭孔大典';
UPDATE cultural_item SET image_anime_url='/images/cultural/caozhou_dough_art.webp' WHERE id=77 AND title='曹州面塑（面人·曹州面人）';
UPDATE cultural_item SET image_anime_url='/images/cultural/lu_brocade_weaving.webp' WHERE id=78 AND title='鲁锦织造技艺';
UPDATE cultural_item SET image_anime_url='/images/cultural/bengrou_rice.webp' WHERE id=90 AND title='甏肉干饭';
```

- [ ] **Step 2: Statistically verify statement and WebP counts**

```bash
test "$(rg -c '^UPDATE ' backend/src/main/resources/db/migration/V26__preferred_inkwash_media_paths.sql)" -eq 20
test "$(rg -c "\.webp'" backend/src/main/resources/db/migration/V26__preferred_inkwash_media_paths.sql)" -eq 20
git diff --check -- backend/src/main/resources/db/migration/V26__preferred_inkwash_media_paths.sql
```

Expected: both count assertions exit 0 and `git diff --check` prints nothing.

- [ ] **Step 3: Do not apply the migration automatically**

Leave the database unchanged in this task. Record the manual application command for a user-selected environment:

```bash
DB_HOST=127.0.0.1 DB_USER=root DB_PASSWORD='<provided-at-runtime>' DB_NAME=sjg01 \
  python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V26__preferred_inkwash_media_paths.sql
```

- [ ] **Step 4: Commit the migration**

```bash
git add backend/src/main/resources/db/migration/V26__preferred_inkwash_media_paths.sql
git commit -m "chore(db): normalize preferred inkwash media paths"
```

---

### Task 3: Turn the homepage hero into a solar-term scroll gallery

**Files:**

- Create: `display-v2/src/config/solarTerms.js`
- Create: `display-v2/src/utils/solarTermGallery.js`
- Create: `display-v2/tests/solarTermGallery.test.js`
- Create: `display-v2/src/components/homepage/SolarTermGallery.vue`
- Modify: `display-v2/src/components/homepage/RiverHero.vue`

- [ ] **Step 1: Write failing gallery-window tests**

Create `display-v2/tests/solarTermGallery.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wrapTermIndex, visibleTermIndexes } from '../src/utils/solarTermGallery.js'

test('wrapTermIndex 处理首尾循环', () => {
  assert.equal(wrapTermIndex(-1, 24), 23)
  assert.equal(wrapTermIndex(24, 24), 0)
  assert.equal(wrapTermIndex(7, 24), 7)
})

test('桌面窗口为当前、前两项、后三项', () => {
  assert.deepEqual(visibleTermIndexes(5, 24), [3, 4, 5, 6, 7, 8])
})

test('窗口在立春处正确跨年循环', () => {
  assert.deepEqual(visibleTermIndexes(0, 24), [22, 23, 0, 1, 2, 3])
})
```

- [ ] **Step 2: Run tests and confirm the new module is missing**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run test:unit"
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `solarTermGallery.js`.

- [ ] **Step 3: Create the solar-term data source**

Create `display-v2/src/config/solarTerms.js` with all 24 items in this exact order:

```js
const names = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
]

const locations = [
  '青海 · 三江源', '青海 · 扎陵湖', '四川 · 红原大草原', '四川 · 若尔盖草原',
  '甘肃 · 玛曲黄河特大桥', '甘肃 · 阿万仓湿地', '青海 · 龙羊峡水库', '青海 · 李家峡水库',
  '甘肃 · 刘家峡水库', '甘肃 · 兰州市区', '甘肃 · 三河口天鹅滩', '甘肃 · 永泰古城',
  '甘肃 · 黄河石林', '宁夏 · 沙坡头', '宁夏 · 青铜峡大峡谷', '内蒙古 · 河套平原',
  '山西内蒙古 · 老牛湾', '陕西 · 香炉寺', '陕西 · 乾坤湾', '山西 · 壶口瀑布',
  '河南 · 小浪底', '河南 · 黄河滩地公园', '河南 · 东坝头黄河湾', '山东 · 黄河入海口',
]

export const SOLAR_TERMS = names.map((name, index) => ({
  index,
  name,
  location: locations[index],
  image: `/images/solar-terms/term-${String(index + 1).padStart(2, '0')}.jpg`,
}))
```

- [ ] **Step 4: Implement circular window helpers**

Create `display-v2/src/utils/solarTermGallery.js`:

```js
export function wrapTermIndex(index, total) {
  if (!Number.isInteger(total) || total <= 0) return 0
  return ((index % total) + total) % total
}

export function visibleTermIndexes(current, total) {
  return [-2, -1, 0, 1, 2, 3].map((offset) => wrapTermIndex(current + offset, total))
}
```

- [ ] **Step 5: Build `SolarTermGallery.vue` as an isolated component**

The component must own these behaviors:

```js
const activeIndex = ref(0)
const autoPlay = ref(true)
const imageFailed = ref(false)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const activeTerm = computed(() => SOLAR_TERMS[activeIndex.value])
const visibleTerms = computed(() =>
  visibleTermIndexes(activeIndex.value, SOLAR_TERMS.length).map((index) => SOLAR_TERMS[index]),
)

const seek = (index, { restart = true } = {}) => {
  activeIndex.value = wrapTermIndex(index, SOLAR_TERMS.length)
  imageFailed.value = false
  if (restart) restartTimer()
}

const step = (delta) => seek(activeIndex.value + delta)
```

Its template must include:

```vue
<section
  class="solar-gallery"
  aria-label="黄河二十四节气画廊"
  tabindex="0"
  @mouseenter="pauseTimer"
  @mouseleave="restartTimer"
  @focusin="pauseTimer"
  @focusout="restartTimer"
  @keydown.left.prevent="step(-1)"
  @keydown.right.prevent="step(1)"
>
  <figure class="solar-gallery__frame">
    <Transition name="solar-fade" mode="out-in">
      <img
        v-if="!imageFailed"
        :key="activeTerm.index"
        class="solar-gallery__image"
        :src="activeTerm.image"
        :alt="`${activeTerm.name}，${activeTerm.location}`"
        decoding="async"
        @error="imageFailed = true"
      />
      <div v-else :key="`missing-${activeTerm.index}`" class="solar-gallery__missing">
        <span>{{ activeTerm.name }}</span>
        <small>画卷暂缺</small>
      </div>
    </Transition>
    <figcaption class="solar-gallery__caption">
      <span>第 {{ String(activeTerm.index + 1).padStart(2, '0') }} 候</span>
      <strong>{{ activeTerm.name }}</strong>
      <span>{{ activeTerm.location }}</span>
    </figcaption>
  </figure>

  <nav class="solar-gallery__thumbs" aria-label="选择节气">
    <button
      v-for="term in visibleTerms"
      :key="term.name"
      type="button"
      class="solar-gallery__thumb"
      :class="{ 'is-active': term.index === activeIndex }"
      :aria-current="term.index === activeIndex ? 'true' : undefined"
      @click="seek(term.index)"
    >
      <img :src="term.image" alt="" loading="lazy" decoding="async" />
      <span>{{ term.name }}</span>
    </button>
  </nav>

  <div class="solar-gallery__controls">
    <button type="button" aria-label="上一节气" @click="step(-1)">←</button>
    <button type="button" :aria-pressed="autoPlay" @click="toggleAutoPlay">
      {{ autoPlay ? '暂停轮播' : '继续轮播' }}
    </button>
    <button type="button" aria-label="下一节气" @click="step(1)">→</button>
  </div>
</section>
```

CSS requirements are exact:

- `.solar-gallery__frame { aspect-ratio: 16 / 9; }`
- `.solar-gallery__image { width:100%; height:100%; object-fit:contain; }`
- No border radius larger than `var(--radius-sm)`.
- Buttons have a visible `:focus-visible` 2px accent outline and minimum 44px hit size.
- Desktop thumbnails use six columns with the active item spanning two fractional units.
- At `max-width: 760px`, thumbnails become a horizontally scrollable row and every item keeps a visible name.
- `prefers-reduced-motion` disables auto-play and transition animation.
- Add `visibilitychange` cleanup so hidden pages do not keep rotating.

- [ ] **Step 6: Recompose `RiverHero.vue` around the gallery**

Import and render the new component:

```vue
<section ref="root" class="rh">
  <div class="rh__inner">
    <SolarTermGallery class="rh__gallery" />
    <div class="rh__content">
      <!-- retain the existing seal/eyebrow, title, subtitle, stats, and CTA -->
    </div>
  </div>
</section>
```

Use this layout contract:

```css
.rh {
  min-height: 720px;
  padding: var(--sp-8) var(--sp-5);
  background: var(--bg-primary);
}

.rh__inner {
  width: min(100%, var(--container-max));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 2.1fr) minmax(300px, 1fr);
  gap: var(--sp-8);
  align-items: center;
}

@media (max-width: 980px) {
  .rh { min-height: 0; padding: var(--sp-6) var(--sp-4); }
  .rh__inner { grid-template-columns: 1fr; gap: var(--sp-6); }
}
```

Remove the full-screen `.rh__stack`, `.rh__veil`, right-edge `.rh__terms` rail, and the unmatched extra `}` after `.rh__content`. Change dark-overlay text colors to normal design tokens because the content now sits on paper.

- [ ] **Step 7: Run gallery tests and production build**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run test:unit"
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run build"
```

Expected: tests pass; build exits 0; all 24 `term-*.jpg` assets appear in the Vite asset graph; no hero image uses viewport-sized `cover`.

- [ ] **Step 8: Commit the homepage gallery**

```bash
git add display-v2/src/config/solarTerms.js display-v2/src/utils/solarTermGallery.js \
  display-v2/tests/solarTermGallery.test.js \
  display-v2/src/components/homepage/SolarTermGallery.vue \
  display-v2/src/components/homepage/RiverHero.vue
git commit -m "feat(display): turn solar terms into a scroll gallery"
```

---

### Task 4: Replace vertical poem layout with a horizontal manuscript

**Files:**

- Modify: `display-v2/src/utils/poem.js`
- Create: `display-v2/tests/poem.test.js`
- Create: `display-v2/src/components/poem/PoemManuscript.vue`
- Modify: `display-v2/src/views/PoemDetail.vue`

- [ ] **Step 1: Write failing poem-normalization tests**

Create `display-v2/tests/poem.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitPoemLines } from '../src/utils/poem.js'

test('尊重数据库原有换行', () => {
  assert.deepEqual(splitPoemLines('山明水净夜来霜，\n数树深红出浅黄。'), [
    '山明水净夜来霜，',
    '数树深红出浅黄。',
  ])
})

test('单段长文本按句末标点切行并保留标点', () => {
  assert.deepEqual(splitPoemLines('常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。'), [
    '常记溪亭日暮，沉醉不知归路。',
    '兴尽晚回舟，误入藕花深处。',
  ])
})

test('空内容返回空数组', () => {
  assert.deepEqual(splitPoemLines(null), [])
  assert.deepEqual(splitPoemLines('   '), [])
})

test('标点后没有正文时不产生空行', () => {
  assert.deepEqual(splitPoemLines('争渡，争渡！'), ['争渡，争渡！'])
})
```

- [ ] **Step 2: Run tests and confirm `splitPoemLines` is missing**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run test:unit"
```

Expected: FAIL because `splitPoemLines` is not exported.

- [ ] **Step 3: Add line normalization to `utils/poem.js`**

Append:

```js
export function splitPoemLines(content) {
  if (typeof content !== 'string' || !content.trim()) return []
  const explicit = content
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (explicit.length > 1) return explicit

  const sentences = explicit[0].match(/[^。！？；]+[。！？；]?/g) || []
  return sentences.map((line) => line.trim()).filter(Boolean)
}
```

- [ ] **Step 4: Create `PoemManuscript.vue`**

The component interface is:

```js
const props = defineProps({
  poem: { type: Object, required: true },
  poet: { type: Object, default: null },
  dynasty: { type: Object, default: null },
  spot: { type: Object, default: null },
  moodBg: { type: String, default: null },
  tags: { type: Array, default: () => [] },
})

const showAnnotation = ref(Boolean(props.poem.annotation))
const lines = computed(() => splitPoemLines(props.poem.content))
```

Use this semantic structure:

```vue
<article class="manuscript">
  <div
    v-if="moodBg"
    class="manuscript__wash"
    :style="{ backgroundImage: `url(${moodBg})` }"
    aria-hidden="true"
  ></div>

  <header class="manuscript__header">
    <span class="manuscript__seal" aria-hidden="true">{{ dynasty?.name?.charAt(0) || '诗' }}</span>
    <p class="manuscript__eyebrow">{{ dynasty?.name || '佚代' }} · 齐鲁诗笺</p>
    <h1>{{ poem.title }}</h1>
    <p class="manuscript__byline">
      <router-link v-if="poet" :to="`/poets/${poet.id}`">{{ poet.name }}</router-link>
      <span v-if="poet && spot">·</span>
      <router-link v-if="spot" :to="`/spots/${spot.id}`">{{ spot.name }}</router-link>
    </p>
  </header>

  <div class="manuscript__body" aria-label="诗词正文">
    <p v-for="(line, index) in lines" :key="`${index}-${line}`">{{ line }}</p>
  </div>

  <div v-if="tags.length" class="manuscript__tags" aria-label="情感标签">
    <span v-for="tag in tags" :key="tag">{{ tag }}</span>
  </div>

  <details v-if="poem.annotation" class="manuscript__annotation" :open="showAnnotation">
    <summary @click.prevent="showAnnotation = !showAnnotation">
      {{ showAnnotation ? '收起注解' : '展开注解' }}
    </summary>
    <p v-if="showAnnotation">{{ poem.annotation }}</p>
  </details>
</article>
```

CSS contract:

```css
.manuscript {
  position: relative;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--border);
  padding: clamp(32px, 6vw, 72px) clamp(20px, 7vw, 88px);
  box-shadow: 0 24px 64px color-mix(in srgb, var(--text-primary) 10%, transparent);
}

.manuscript__body {
  position: relative;
  z-index: 1;
  max-width: 30em;
  margin: var(--sp-7) auto 0;
  text-align: center;
  font-family: var(--font-display);
  font-size: clamp(20px, 2.2vw, 24px);
  line-height: 2.1;
  letter-spacing: 0.08em;
}

.manuscript__body p { margin: 0; }
.manuscript__body p + p { margin-top: var(--sp-2); }
.manuscript__annotation { max-width: 65ch; margin: var(--sp-7) auto 0; }
.manuscript__wash { opacity: 0.08; background-size: cover; filter: grayscale(0.35); }
```

Add a 2px accent `:focus-visible` outline on links and `<summary>`. At `max-width: 640px`, use 20px horizontal padding and 18–20px body text. Under `prefers-reduced-motion`, disable line-entry animation.

- [ ] **Step 5: Replace the old vertical sheet in `PoemDetail.vue`**

Import the component:

```js
import PoemManuscript from '../components/poem/PoemManuscript.vue'
import { parseTags } from '../utils/poem'
```

Replace `.ink-poem-scroll`, both vertical sidebars, vertical annotation, tags, and seal markup with:

```vue
<PoemManuscript
  :poem="poem"
  :poet="poet"
  :dynasty="dynasty"
  :spot="spot"
  :mood-bg="moodBg"
  :tags="sentimentTags"
/>
```

Delete `showAnnotation`, `poemLines`, the vertical writing-mode CSS, horizontal scrollbars, and the old `.mood-bg` full-page layer. Increase `.poem-detail` to `max-width: 1120px`; keep the back button, background section, AI analysis, and video section unchanged.

- [ ] **Step 6: Run poem tests and build**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run test:unit"
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run build"
```

Expected: line-splitting tests pass; no `writing-mode: vertical-rl` remains in `PoemDetail.vue` or `PoemManuscript.vue`; build exits 0.

- [ ] **Step 7: Commit the poem redesign**

```bash
git add display-v2/src/utils/poem.js display-v2/tests/poem.test.js \
  display-v2/src/components/poem/PoemManuscript.vue display-v2/src/views/PoemDetail.vue
git commit -m "feat(display): redesign poem detail as horizontal manuscript"
```

---

### Task 5: Remove the boat checkerboard and refine timeline scenes

**Files:**

- Modify binary: `display-v2/public/media/inkwash/timeline/boat-rower.webp`
- Modify: `display-v2/src/components/timeline/InkTimeline.vue`

- [ ] **Step 1: Capture the current asset failure as measurable facts**

Run:

```bash
'/mnt/c/Users/Aohs/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' - <<'PY'
from PIL import Image
p = r'E:\Aohs\vibecoding\sjg-new\display-v2\public\media\inkwash\timeline\boat-rower.webp'
im = Image.open(p)
assert im.mode == 'RGB'
assert im.size == (1024, 942)
print('red condition confirmed:', im.mode, im.size)
PY
```

Expected: prints `red condition confirmed: RGB (1024, 942)`.

- [ ] **Step 2: Convert the baked light checkerboard into alpha and crop the subject**

Run this one-time deterministic conversion from the repository root:

```bash
'/mnt/c/Users/Aohs/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' - <<'PY'
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

path = Path(r'E:\Aohs\vibecoding\sjg-new\display-v2\public\media\inkwash\timeline\boat-rower.webp')
source = Image.open(path).convert('RGB')
gray = source.convert('L')

# The baked checkerboard is near-white. Map luminance >= 232 to transparent,
# <= 205 to opaque, and preserve pale ink as a soft alpha transition.
alpha = gray.point(lambda value: 0 if value >= 232 else 255 if value <= 205 else round((232 - value) * 255 / 27))
alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))

rgba = source.convert('RGBA')
rgba.putalpha(alpha)
bbox = alpha.getbbox()
if bbox is None:
    raise SystemExit('no boat pixels found')

left, top, right, bottom = bbox
pad = 12
crop = (
    max(0, left - pad),
    max(0, top - pad),
    min(rgba.width, right + pad),
    min(rgba.height, bottom + pad),
)
rgba = rgba.crop(crop)
rgba.save(path, 'WEBP', lossless=True, method=6)
print('wrote', path, rgba.size, rgba.mode)
PY
```

- [ ] **Step 3: Verify alpha, crop margins, and file size**

```bash
'/mnt/c/Users/Aohs/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' - <<'PY'
from pathlib import Path
from PIL import Image

path = Path(r'E:\Aohs\vibecoding\sjg-new\display-v2\public\media\inkwash\timeline\boat-rower.webp')
im = Image.open(path).convert('RGBA')
alpha = im.getchannel('A')
hist = alpha.histogram()
total = im.width * im.height
transparent_ratio = hist[0] / total
subject_ratio = sum(hist[17:]) / total
bbox = alpha.getbbox()
assert im.mode == 'RGBA'
assert transparent_ratio >= 0.15, transparent_ratio
assert subject_ratio >= 0.10, subject_ratio
assert bbox is not None
left, top, right, bottom = bbox
assert 4 <= left <= 16 and 4 <= top <= 16
assert 4 <= im.width - right <= 16 and 4 <= im.height - bottom <= 16
assert path.stat().st_size <= 300_000, path.stat().st_size
print('boat asset valid', im.size, transparent_ratio, subject_ratio, path.stat().st_size)
PY
```

Expected: prints `boat asset valid ...`; every assertion passes.

- [ ] **Step 4: Use a correctly proportioned interactive boat wrapper**

Replace the direct image interaction in `InkTimeline.vue` with:

```vue
<button
  ref="boatRef"
  type="button"
  class="ink-timeline__boat-hit"
  aria-label="拖拽小舟沿河探寻"
  @pointerdown="onPointerDown"
  @pointermove="onPointerMove"
  @pointerup="onPointerUp"
>
  <img :src="boatRower" class="ink-timeline__boat" alt="" draggable="false" />
</button>
```

Use this CSS:

```css
.ink-timeline__boat-hit {
  position: absolute;
  z-index: 10;
  width: clamp(82px, 7vw, 120px);
  aspect-ratio: 1.45 / 1;
  padding: 8px;
  border: 0;
  background: transparent;
  cursor: grab;
  touch-action: pan-y;
  transform-origin: 50% 50%;
}

.ink-timeline__boat-hit:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.ink-timeline__boat {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 5px 8px rgba(31, 26, 22, 0.28));
  pointer-events: none;
}
```

Remove the old forced `width:60px; height:60px` rules. `useBoatJourney` continues to transform `boatRef`, now the wrapper button.

- [ ] **Step 5: Contain and mask the timeline scene images**

Change scene CSS to:

```css
.ink-timeline__scenes {
  position: absolute;
  inset: 4% 2%;
  overflow: hidden;
  pointer-events: none;
  mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
}

.ink-timeline__scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.ink-timeline__scene--active { opacity: 0.32; }
```

Keep the current-and-neighbor lazy mount logic, river path, nodes, drag, cruise, and keyboard behavior unchanged.

- [ ] **Step 6: Run tests and build**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run test:unit"
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run build"
```

Expected: tests and build pass; the generated WebP remains under 300KB and has alpha.

- [ ] **Step 7: Commit the timeline fix**

```bash
git add display-v2/public/media/inkwash/timeline/boat-rower.webp \
  display-v2/src/components/timeline/InkTimeline.vue
git commit -m "fix(display): remove boat background and refine timeline scenes"
```

---

### Task 6: Full visual audit, cross-project checks, and final verification

**Files:**

- Modify only if a verified regression exists: `admin-frontend/src/**`
- Modify only if a verified regression exists: `sjg-datav/src/**`

- [ ] **Step 1: Run the complete display test suite**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run test:unit"
```

Expected: all prior 30 tests plus the new media, gallery, and poem tests pass with 0 failures.

- [ ] **Step 2: Build all three frontends**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run build"
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\admin-frontend && D:\app\nodeJs\npm.cmd run build"
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\sjg-datav && D:\app\nodeJs\npm.cmd run build"
```

Expected: all builds exit 0. Existing bundle-size warnings may remain, but no new broken media import or TypeScript error is accepted.

- [ ] **Step 3: Run backend tests**

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\backend && D:\app\maven\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd -q test"
```

Expected: Maven exits 0; intentional LLM fallback warnings do not count as failures.

- [ ] **Step 4: Perform responsive visual inspection**

Start the display app:

```bash
cmd.exe /c "cd /d E:\Aohs\vibecoding\sjg-new\display-v2 && D:\app\nodeJs\npm.cmd run dev -- --host 127.0.0.1"
```

Inspect these routes at 1440×900, 1920×1080, 768×1024, and 390×844:

- `/map` — current painting is contained; six nearby terms are visible on desktop; named horizontal strip is discoverable on mobile; title/statistics do not overlap imagery.
- `/poems/3` or another known poem — body is horizontal, selectable, centered, and has no horizontal scrollbar.
- `/timeline` — boat has no white/checker rectangle, keeps its natural ratio, and remains draggable; scenes no longer crop aggressively.
- `/poets/3`, `/spots/1`, `/culture`, `/festivals`, `/crafts`, `/food-opera` — reviewed WebP assets render without placeholder fallback and retain their intended ratios.

Keyboard checks:

- Tab focus is visible on gallery thumbnails, controls, poem links/annotation, timeline nodes, and boat.
- Left/right keys change the active solar term and timeline dynasty where documented.
- With reduced motion enabled, gallery auto-play and decorative entry animation stop.

- [ ] **Step 5: Only fix admin/DataV when the audit proves a regression**

If both projects display the new `/images/...webp` paths correctly, make no changes. If a broken path is observed, update only the responsible resolver or `<img>` fit rule, rerun that project's build, and create a narrowly scoped commit describing the verified regression.

- [ ] **Step 6: Run repository and archive checks**

```bash
git diff --check
git status --short --branch
cd /mnt/e/Aohs/vibecoding/sjg-new-archive-20260821 && sha256sum -c manifests/database-snapshot.sha256
```

Expected: no whitespace errors; only intentional files are modified; archived database snapshot remains valid.

- [ ] **Step 7: Review commit boundaries**

```bash
git log --oneline -8
git show --stat --oneline HEAD
```

Expected functional commits:

1. `feat(display): prioritize curated inkwash media`
2. `chore(db): normalize preferred inkwash media paths`
3. `feat(display): turn solar terms into a scroll gallery`
4. `feat(display): redesign poem detail as horizontal manuscript`
5. `fix(display): remove boat background and refine timeline scenes`
