# 齐鲁名士详情页桌面重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `display-v2` 齐鲁名士详情页改造成已确认的 B-1 桌面布局：左侧大幅人物画像向右淡出，右侧人物档案，生平宽幅阅读，代表句降级为可点击链接，诗篇网格置底。

**Architecture:** 保持 `PoetDetail.vue` 作为页面容器和 API 边界，只重排其模板与 scoped CSS；头像失败状态在页面内用独立响应式标志控制 `InkPlaceholder`，不改后端接口和全局主题。测试采用现有 Node 内置测试 + 源码结构断言，随后用 Vite 构建和 Playwright 桌面截图检查实际布局。

**Tech Stack:** Vue 3 `<script setup>`, Vue Router, CSS Grid/linear-gradient, Node `node:test`, Vite 8。

---

## 文件地图

- **Modify:** `display-v2/src/views/PoetDetail.vue` — 页面结构、头像失败状态、B-1 桌面样式。
- **Create:** `display-v2/tests/poetDetail.test.js` — 页面结构与关键 CSS 的回归断言。
- **Read:** `display-v2/src/utils/poem.js` — 确认代表句继续使用共享 `pickSignaturePoem`；本计划不改该纯函数。
- **Do not touch:** `backend/src/main/resources/application.yml`、`docs/plans/cultural-games-proposal.md`；它们是当前已有的用户改动。

### Task 1: 添加 PoetDetail 的失败测试

**Files:**
- Create: `display-v2/tests/poetDetail.test.js`
- Read: `display-v2/src/views/PoetDetail.vue`

- [ ] **Step 1: 写源码结构断言**

创建测试，读取 `PoetDetail.vue` 文本并覆盖已批准规格的最小契约：

```js
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const source = await readFile(
  new URL('../src/views/PoetDetail.vue', import.meta.url),
  'utf8',
)

test('B-1 删除头像方印并把代表句放在生平之后', () => {
  assert.doesNotMatch(source, /pd-portrait__seal/)
  assert.match(source, /pd-signature__link/)
  assert.ok(source.indexOf('>生平</h2>') < source.indexOf('>代表句</span>'))
  assert.ok(source.indexOf('>代表句</span>') < source.indexOf('>传世诗篇</h2>'))
})

test('B-1 画像使用大尺寸、3:4 contain 和右侧渐隐层', () => {
  assert.match(source, /\.pd-portrait\s*\{[\s\S]*?width:\s*clamp\(360px/)
  assert.match(source, /aspect-ratio:\s*3\s*\/\s*4/)
  assert.match(source, /object-fit:\s*contain/)
  assert.match(source, /\.pd-hero__art::after\s*\{[\s\S]*?linear-gradient\([^;]*var\(--bg-primary\)/)
})

test('代表句是指向诗词详情的真实链接，并在头像失败时显示占位', () => {
  assert.match(source, /:to="`\/poems\/\$\{signature\.id\}`"/)
  assert.match(source, /avatarLoadFailed/)
  assert.match(source, /InkPlaceholder/)
  assert.match(source, /@error="onAvatarError"/)
})

test('生平正文使用宽幅阅读列而非窄 measure 卡片', () => {
  assert.match(source, /grid-template-columns:\s*minmax\(180px,\s*0\.28fr\)/)
  assert.match(source, /max-width:\s*var\(--measure-wide\)/)
  assert.doesNotMatch(source, /\.pd-bio[\s\S]*?max-width:\s*var\(--measure\)/)
})
```

- [ ] **Step 2: 运行单个新测试，确认红灯**

Run from `display-v2`:

```bash
/mnt/d/app/nodeJs/node.exe --test tests/poetDetail.test.js
```

Expected: FAIL because the current template still contains `.pd-portrait__seal`, has no `pd-signature__link`, and still uses the old 240px/`var(--measure)` rules.

### Task 2: 重排 PoetDetail 模板与头像状态

**Files:**
- Modify: `display-v2/src/views/PoetDetail.vue:9-113`
- Modify: `display-v2/src/views/PoetDetail.vue:140-185`

- [ ] **Step 1: 替换 Hero 模板**

保留返回链接和现有数据字段，将 Hero 改为以下完整结构：

```vue
<div class="pd-hero">
  <div class="pd-hero__wash" aria-hidden="true"></div>
  <div class="pd-hero__content">
    <div class="pd-hero__art">
      <div class="pd-portrait">
        <div class="pd-portrait__frame" :style="{ aspectRatio: avatarPresentation.aspectRatio }">
          <img
            v-if="avatar && !avatarLoadFailed"
            :src="avatar"
            :alt="`${poet.name}画像`"
            class="pd-portrait__img"
            :style="{
              objectFit: avatarPresentation.objectFit,
              objectPosition: avatarPresentation.objectPosition,
            }"
            decoding="async"
            @error="onAvatarError"
          />
          <InkPlaceholder v-else :seed="poet.id || poet.name" kind="文" />
        </div>
      </div>
    </div>
    <div class="pd-info">
      <div class="pd-dynasty-row" v-if="dynasty">
        <span class="pd-dynasty">{{ dynasty.name }}</span>
        <span v-if="dynasty.startYear && dynasty.endYear" class="pd-dynasty-years">
          {{ dynasty.startYear }}—{{ dynasty.endYear }}
        </span>
      </div>
      <h1 class="pd-name">{{ poet.name }}</h1>
      <p class="pd-style" v-if="poet.style">{{ poet.style }}</p>
      <div class="pd-meta" v-if="poet.birthYear || poet.birthplace">
        <span v-if="poet.birthYear">{{ poet.birthYear }}-{{ poet.deathYear || '？' }}</span>
        <span v-if="poet.birthYear && poet.birthplace" class="pd-meta__sep">·</span>
        <span v-if="poet.birthplace">{{ poet.birthplace }}</span>
      </div>
      <p class="pd-lede" v-if="biographyLead">{{ biographyLead }}</p>
      <div class="pd-stats">
        <div class="pd-stat">
          <span class="pd-stat__num">{{ poems.length }}</span>
          <span class="pd-stat__label">传世诗篇</span>
        </div>
        <div class="pd-stat" v-if="lifespan">
          <span class="pd-stat__num">{{ lifespan }}</span>
          <span class="pd-stat__label">春秋享年</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

Use the existing fields and preserve the `dynasty` guard. Do not render `.pd-portrait__seal` or the dynasty-span statistic.

- [ ] **Step 2: Replace the biography block with a wide editorial layout**

Use this complete section before the signature link:

```vue
<section class="pd-section pd-section--bio" data-reveal>
  <div class="pd-section__body">
    <div class="pd-section__header">
      <div class="pd-section__icon" aria-hidden="true">传</div>
      <div class="pd-section__title-group">
        <h2 class="pd-section__title">生平</h2>
        <p class="pd-section__subtitle">
          {{ dynasty ? `${dynasty.name} · ${poet.name}` : poet.name }}
        </p>
      </div>
    </div>
    <div class="pd-bio">{{ biographyText }}</div>
  </div>
</section>
```

- [ ] **Step 3: 将代表句移到生平之后并改成链接**

Replace the current first `section.pd-signature` with a lightweight conditional link after the biography section and before the poems section:

```vue
<router-link
  v-if="signature"
  :to="`/poems/${signature.id}`"
  class="pd-signature__link"
  data-reveal
>
  <span class="pd-signature__label">代表句</span>
  <span class="pd-signature__poem">「{{ signature.firstLine }}」</span>
  <cite class="pd-signature__title">——《{{ signature.title }}》</cite>
  <span class="pd-signature__arrow" aria-hidden="true">→</span>
</router-link>
```

Change decorative section characters to `aria-hidden="true"`, retain visible headings, and keep the existing empty-poems state.

- [ ] **Step 4: Add explicit image failure state and biography text derivation**

In `<script setup>`, add `const avatarLoadFailed = ref(false)` and change the handler to:

```js
const onAvatarError = () => {
  avatarLoadFailed.value = true
}
```

Add these two computed values next to the other page-derived values:

```js
const biographyText = computed(() =>
  poet.value?.biography?.trim() || '生平待考，然其诗已传。',
)

const biographyLead = computed(() => {
  const text = poet.value?.biography?.trim()
  if (!text) return ''
  const sentence = text.match(/^.*?[。！？]/)?.[0] || text
  return sentence.length > 72 ? `${sentence.slice(0, 72)}…` : sentence
})
```

Delete the `dynastySpan` computed value. Reset `avatarLoadFailed.value = false` immediately after assigning `poet.value` in `loadDetail()`, before `nextTick()`. The `v-if="avatar && !avatarLoadFailed"` branch guarantees the placeholder is rendered after an error.

- [ ] **Step 5: Run the new test and expect only style-contract failures**

```bash
/mnt/d/app/nodeJs/node.exe --test tests/poetDetail.test.js
```

Expected: template/state assertions pass; CSS assertions remain red until Task 3.

### Task 3: Implement B-1 desktop CSS

**Files:**
- Modify: `display-v2/src/views/PoetDetail.vue:230-710`

- [ ] **Step 1: Replace Hero rules**

Replace the current Hero, portrait, information, and statistics rules with this grid-based desktop block:

```css
.pd-hero {
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
}
.pd-hero__wash {
  position: absolute;
  inset: 0;
  background: var(--bg-secondary);
  opacity: .72;
  pointer-events: none;
}
.pd-hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(520px, 58%) minmax(420px, 42%);
  align-items: center;
  gap: 0;
  max-width: var(--container-max);
  min-height: 580px;
  margin: 0 auto;
  padding: var(--sp-6) var(--sp-5);
}

.pd-hero__art {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
}

.pd-hero__art::after {
  content: '';
  position: absolute;
  z-index: 3;
  inset: 0 calc(var(--sp-9) * -1) 0 28%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--bg-primary) 20%, transparent) 36%,
    color-mix(in srgb, var(--bg-primary) 76%, transparent) 70%,
    var(--bg-primary) 100%
  );
  pointer-events: none;
}

.pd-portrait {
  position: relative;
  z-index: 1;
  width: clamp(360px, 32vw, 440px);
  flex-shrink: 0;
}

.pd-portrait__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 0;
  box-shadow: var(--card-shadow);
  background: var(--bg-secondary);
}

.pd-portrait__img {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pd-info {
  position: relative;
  z-index: 4;
  padding-left: var(--sp-6);
  color: var(--text-primary);
}

.pd-dynasty-row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}

.pd-dynasty-row::before {
  content: '';
  width: var(--sp-5);
  height: 1px;
  background: var(--accent);
}

.pd-dynasty {
  color: var(--accent-dark);
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 3px;
}

.pd-dynasty-years {
  color: var(--text-muted);
  font-size: var(--fs-caption);
  letter-spacing: 1px;
}

.pd-name {
  margin-bottom: var(--sp-2);
  font-family: var(--font-display);
  font-size: var(--fs-h1);
  font-weight: 600;
  line-height: var(--lh-tight);
  letter-spacing: 8px;
}

.pd-style {
  margin-bottom: var(--sp-4);
  color: var(--text-muted);
  font-size: var(--fs-body);
  font-style: italic;
  letter-spacing: 2px;
}

.pd-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin-bottom: var(--sp-4);
  color: var(--text-secondary);
  font-size: var(--fs-body-sm);
  letter-spacing: 1px;
}

.pd-lede {
  max-width: var(--measure);
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
}

.pd-stats {
  display: flex;
  gap: var(--sp-7);
  margin-top: var(--sp-5);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--border);
}

.pd-stat {
  min-width: 96px;
  text-align: left;
}

.pd-stat__num {
  display: block;
  margin-bottom: var(--sp-1);
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
  line-height: 1;
}

.pd-stat__label {
  color: var(--text-muted);
  font-size: var(--fs-caption);
  letter-spacing: 2px;
}
```

Keep `object-position` from `avatarPresentation`. Do not add the removed seal selector.

- [ ] **Step 2: Make biography wide and signature quiet**

Use these concrete declarations:

```css
.pd-section--bio .pd-section__header {
  margin-bottom: 0;
}

.pd-section--bio .pd-section__body {
  display: grid;
  grid-template-columns: minmax(180px, .28fr) minmax(0, 1fr);
  gap: var(--sp-7);
  align-items: start;
}

.pd-bio {
  max-width: var(--measure-wide);
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.pd-signature__link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: baseline;
  gap: var(--sp-4);
  margin-bottom: var(--sp-9);
  padding: var(--sp-5) 0;
  color: inherit;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  text-decoration: none;
}

.pd-signature__link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.pd-signature__label {
  color: var(--accent);
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 3px;
}

.pd-signature__poem {
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-lead);
  line-height: var(--lh-body);
  letter-spacing: 2px;
}

.pd-signature__title {
  color: var(--text-muted);
  font-size: var(--fs-body-sm);
  font-style: normal;
  letter-spacing: 1px;
  white-space: nowrap;
}

.pd-signature__arrow {
  color: var(--accent);
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.pd-signature__link:hover .pd-signature__arrow,
.pd-signature__link:focus-visible .pd-signature__arrow {
  transform: translateX(var(--sp-1));
}
```

These declarations retain visible focus, avoid nested card chrome, and keep `pd-signature__link` as a router link.

- [ ] **Step 3: Preserve existing small-screen stacking without expanding scope**

Replace the affected rules inside the existing `@media (max-width: 1024px)` block with:

```css
.pd-hero__content {
  grid-template-columns: 1fr;
  gap: var(--sp-6);
  min-height: auto;
  text-align: center;
}
.pd-hero__art { min-height: auto; justify-content: center; }
.pd-hero__art::after {
  inset: 45% 0 calc(var(--sp-7) * -1);
  background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 100%);
}
.pd-portrait { width: clamp(240px, 45vw, 360px); }
.pd-info { padding-left: 0; }
.pd-dynasty-row, .pd-meta, .pd-stats { justify-content: center; }
.pd-lede { margin: 0 auto; }
.pd-section--bio .pd-section__body { grid-template-columns: 1fr; gap: var(--sp-5); }
.pd-signature__link { grid-template-columns: 1fr; text-align: left; }
.pd-signature__title { white-space: normal; }
```

Keep the existing 768px single-column poem grid and smaller page padding. Do not introduce new mobile-only components or interactions.

- [ ] **Step 4: Run the new test and confirm green**

```bash
/mnt/d/app/nodeJs/node.exe --test tests/poetDetail.test.js
```

Expected: all new PoetDetail tests PASS.

### Task 4: Run project verification and desktop visual checks

**Files:**
- Read: `display-v2/src/views/PoetDetail.vue`
- Read: `display-v2/tests/poetDetail.test.js`

- [ ] **Step 1: Run the complete display-v2 unit suite**

```bash
cd display-v2
npm run test:unit
```

Expected: all tests PASS, including the existing suite and the new PoetDetail tests.

- [ ] **Step 2: Build the production bundle**

```bash
npm run build
```

Expected: Vite build exits 0 and writes `display-v2/dist`.

- [ ] **Step 3: Check whitespace and inspect the diff**

```bash
cd ..
git diff --check
git diff -- display-v2/src/views/PoetDetail.vue display-v2/tests/poetDetail.test.js
```

Expected: no whitespace errors; diff contains only B-1 page/test changes.

- [ ] **Step 4: Verify desktop geometry in a browser**

Start the Vite app on port 5176 with `npm run dev -- --port 5176`, then inspect at 1440×900 and 1920×1080. Confirm:

```text
hero portrait width >= 360px
portrait and info column do not overlap
right fade ends before the name/lede text
biography body is wider than the old 34em card
signature appears after biography and has a keyboard focus ring
poem grid remains below signature
```

Also test a broken avatar URL in dev tools or a fixture and confirm `InkPlaceholder` appears instead of an empty frame.

- [ ] **Step 5: Commit the focused implementation**

```bash
git add display-v2/src/views/PoetDetail.vue display-v2/tests/poetDetail.test.js
git commit -m "feat(display): redesign poet detail for desktop editorial hero"
```

Do not stage or commit `backend/src/main/resources/application.yml` or `docs/plans/cultural-games-proposal.md`.
