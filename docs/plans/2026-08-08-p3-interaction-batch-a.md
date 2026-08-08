# P3 沉浸交互 · 批次 A（状态层 + 触屏 + 路由反馈）Implementation Plan

> **状态：✅ 已执行完毕（2026-08-08）**——4 commits: `66b565a`（P3-5+P3-3）、`8bcc410`（P3-4）、`136fc37`（P3-2-lite）、`8ce06ce`（评审修复）。构建 + 17 单测全过；code review 3 中危已修复。进度已回写 `2026-08-05-display-v2-ui-optimization-tasks.md`。

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development / executing-plans。Steps 用 checkbox 追踪。
> 关联：`docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md`（唯一进度源）

**Goal:** 完成 P3 中不依赖重型动效设计的 4 项：P3-5 加载态清理、P3-3 三态统一、P3-4 触屏适配、P3-2 轻量部分（路由进度条 + 方向感过渡）。P3-1 滚动叙事、P3-2 FLIP 共享元素、P3-6 真机验收留批次 B。

**Architecture:** 状态三件套走 `components/homepage/` 下 SkeletonBlock（已有）/ ErrorState（已有）/ **EmptyState（本批新建）**；触屏检测用 `matchMedia('(pointer: coarse)')`，沙盘手势冲突通过 OrbitControls `touches.ONE = null` + canvas `touch-action: pan-y` 解决；路由进度条为 App.vue 全局组件，进度状态由纯函数管理（可单测）。

**Tech Stack:** Vue 3 (script setup)、GSAP 3.15、node:test。

**前置状态（已侦察确认）：**
- MapView 模板：RiverHero → real 沙盘（HUD `hud-desc`/`tip-txt` 含"双击"文案，L76/L106）→ inkwash 长卷 → RiverCityRail → AiChatBox。
- 沙盘交互：`useThreeSandbox.js` L289 OrbitControls（未配 touch）；L643-648 手写 300ms 双击判定；`onPickCity`→openCity（预览卡）、`onDoublePickCity`→router.push。
- CityDetailCard 已有「进入景观」按钮（L58，`@go` → `onCardGo`）——P3-4 的"卡片按钮=进入"已具备，只需去双击。
- 三态缺口：PoemDetail 纯文本"⌛ 加载中"（L10-15）+ 自定义 error-state；SpotDetail 加载整页空白（`v-if="spot"`）；RegionSpots 无 loading + 自定义 error-state；Timeline 无 loading UI；PoetList 图谱区纯文本"加载中…"。
- App.vue 已有 `page-slide` 过渡（无方向感）、无进度条；router 无钩子。
- 空态现状：PoetList/PoetAllList `empty-card`、RegionSpots `empty-state`、SpotDetail `empty-poems`、Timeline `tl-empty` —— 文案与样式各自为政。

---

### Task 1: P3-5 加载态清理

**Files:**
- Modify: `display-v2/src/views/PoemDetail.vue`（"⌛ 加载中" → 诗笺骨架屏）
- Modify: `display-v2/src/views/SpotDetail.vue`（加载空白 → 骨架 + ErrorState）
- Modify: `display-v2/src/views/RegionSpots.vue`（补列表骨架）
- Modify: `display-v2/src/views/Timeline.vue`（补骨架）
- Modify: `display-v2/src/views/PoetList.vue`（图谱区"加载中…"文本 → SkeletonBlock）

- [ ] **Step 1: PoemDetail 诗笺骨架屏**

`PoemDetail.vue` L10-15 的 `<div v-else-if="!poem" class="error-state">…⌛ 加载中...</div>` 替换为诗笺结构骨架（模拟 38vh 锚点带 + 标题 + 正文行）：

```html
  <div v-else-if="!poem" class="poem-skeleton" aria-busy="true" aria-label="诗篇加载中">
    <SkeletonBlock height="38vh" />
    <div class="poem-skeleton__body">
      <SkeletonBlock height="34px" width="42%" />
      <SkeletonBlock height="14px" width="24%" />
      <SkeletonBlock v-for="i in 5" :key="i" height="18px" :width="`${88 - i * 6}%`" />
    </div>
  </div>
```

import SkeletonBlock；删除不再用的 `.error-state/.error-content/.error-icon/.error-text` CSS（确认无其他使用后删）。

- [ ] **Step 2: SpotDetail 补 loading/error**

现状 `v-if="spot"` 之前无 else。确认 script 中是否有 `loading`/`error` ref —— 若无，在数据获取处补：

```js
const loading = ref(true)
const loadError = ref('')
// fetch 内：catch (e) { loadError.value = e?.message || '' } finally { loading.value = false }
```

模板根节点内 `<div v-if="spot">` 之前插：

```html
    <div v-if="loading" class="spot-skeleton" aria-busy="true" aria-label="景观加载中">
      <SkeletonBlock height="320px" />
      <div class="spot-skeleton__rows">
        <SkeletonBlock height="30px" width="38%" />
        <SkeletonBlock v-for="i in 4" :key="i" height="16px" :width="`${92 - i * 8}%`" />
      </div>
    </div>
    <ErrorState v-else-if="loadError" :message="loadError" @retry="loadSpot" />
```

（方法名以文件实际为准，先读后改。）

- [ ] **Step 3: RegionSpots / Timeline / PoetList 补骨架**

- RegionSpots：景点列表区 loading 时渲染 `SkeletonBlock` ×4（高度与卡片一致，grep 实际卡片高度）；无 loading ref 则补（同 Step 2 模式）。
- Timeline：主轴区 loading 骨架（竖条 + 节点圆点占位可用 SkeletonBlock 圆角变体，或直接 3 条横条）。
- PoetList：图谱区"加载中…"纯文本 → `<SkeletonBlock height="420px" />`（高度取图谱容器实际值）。

- [ ] **Step 4: 构建 + grep 复查**

```bash
cd display-v2 && npm run build
grep -rn "加载中" src/views/ --include='*.vue'
```

Expected: 构建通过；剩余"加载中"均为 aria-label 或 HUD stat 占位（MapView hud-stats 的"载入中"属数字占位，保留）。

- [ ] **Step 5: 提交**

```bash
git add display-v2/src/views && git commit -m "feat(display-v2): P3-5 加载态清理 -- 诗笺/详情骨架屏替代纯文本加载"
```

---

### Task 2: P3-3 三态统一（EmptyState 新建 + ErrorState 收敛）

**Files:**
- Create: `display-v2/src/components/homepage/EmptyState.vue`
- Modify: `display-v2/src/views/RegionSpots.vue`、`PoemDetail.vue`（自定义 error-state → ErrorState）
- Modify: `display-v2/src/views/PoetList.vue`、`PoetAllList.vue`、`Timeline.vue`、`SpotDetail.vue`（空态接 EmptyState）

- [ ] **Step 1: 新建 EmptyState.vue**

与 ErrorState 同族（印章字 + 文案 + 可选默认 slot 动作）：

```html
<template>
  <div class="empty">
    <p class="empty__icon">{{ icon }}</p>
    <p class="empty__text">{{ message }}</p>
    <p v-if="hint" class="empty__hint">{{ hint }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '空' },   // 印章单字，主题色 Accent
  message: { type: String, default: '此处暂无内容' },
  hint: { type: String, default: '' },      // 引导文案，如"换个城市看看"
})
</script>
```

样式对齐 ErrorState（`.err` 系）：`padding: 56px 20px; text-align: center`；icon 用 `var(--font-display)` + `var(--accent)` 40% 透明度；hint 用 `var(--text-muted)` 12px。

- [ ] **Step 2: ErrorState 收敛**

- RegionSpots：自定义 `.error-state` 块 → `<ErrorState :message="errorMsg" @retry="load" />`（方法名以实际为准），删冗余 CSS。
- PoemDetail：Task 1 已把"加载中"分支换成骨架；若 fetch 失败当前也落同一分支（`!poem`），需拆 `loading` / `error` 两 ref：失败时 `<ErrorState message="诗篇走丢了，请重试" @retry="loadPoem" />`。

- [ ] **Step 3: 空态接入 EmptyState**

| 视图 | 现状类 | icon | message | hint |
|---|---|---|---|---|
| PoetList | `.empty-card` | 名 | 此维度下暂无名士 | 换个筛选条件看看 |
| PoetAllList | `.empty-card` | 名 | 名录暂空 | 稍后再来看看 |
| RegionSpots | `.empty-state` | 景 | 此城景观收录中 | 先去别的城市逛逛 |
| Timeline | `.tl-empty` | 史 | 此朝代暂无史事 | 划到别的朝代看看 |
| SpotDetail | `.empty-poems` | 诗 | 此处暂无关联诗篇 | — |

保留各视图外层容器类（布局），仅替换内部内容为 `<EmptyState>`；删除被替换的空态 CSS。

- [ ] **Step 4: 构建 + 提交**

```bash
cd display-v2 && npm run build
git add display-v2/src && git commit -m "feat(display-v2): P3-3 三态统一 -- EmptyState 组件 + ErrorState 全站收敛"
```

---

### Task 3: P3-4 触屏适配

**Files:**
- Modify: `display-v2/src/composables/useThreeSandbox.js`（coarse 检测 + controls touch 配置 + 去双击）
- Modify: `display-v2/src/views/MapView.vue`（HUD 文案双态）

- [ ] **Step 1: useThreeSandbox coarse 适配**

`init` 内 OrbitControls 创建后（L294 后）插入：

```js
    // 触屏（coarse pointer）：单指留给页面滚动，双指操作沙盘；单击=预览卡（不走双击进入）
    const isCoarse =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches
    if (isCoarse) {
      controls.touches.ONE = null // 单指不旋转 → 浏览器接管纵向滚动
      renderer.domElement.style.touchAction = 'pan-y' // 覆盖 OrbitControls 内置 touch-action:none
    }
```

Raycast 点击判定（L645 附近 `onPointerDown`）双击分支改为：

```js
      if (isDoubleClick && !isCoarse && clickedCity && onDoublePickCity) {
        onDoublePickCity(clickedCity)
        return
      }
```

（保持桌面双击进入不变；coarse 下单击恒走 onPickCity 预览卡，进入由 CityDetailCard「进入景观」按钮完成。）

注意：`onPointerDown` 是闭包内函数，`isCoarse` 定义在 init 作用域即可直接引用。

- [ ] **Step 2: MapView HUD 文案双态**

script 加：

```js
const isCoarsePointer = ref(
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
)
```

模板 L76、L106 改为：

```html
          <p class="hud-desc">{{ isCoarsePointer ? '双指旋转缩放，单指上下滑动页面。' : '拖拽旋转视角，双击节点飞往对应城市。' }}</p>
```

```html
            <span class="tip-txt">{{ isCoarsePointer ? '说明：点按发光节点预览城市文学名胜，点卡片按钮进入城市专栏。' : '说明：单击发光节点预览城市文学名胜，双击进入城市专栏。' }}</span>
```

- [ ] **Step 3: 构建 + 提交**

```bash
cd display-v2 && npm run build
git add display-v2/src/composables/useThreeSandbox.js display-v2/src/views/MapView.vue
git commit -m "feat(display-v2): P3-4 触屏适配 -- 沙盘单指滚动让位/单击预览去双击 + HUD 文案双态"
```

走查（DevTools 设备模拟 iPhone）：沙盘区单指纵向滑 = 页面滚动；双指 = 旋转缩放；单击节点出预览卡；文案变为触屏版。桌面回归：双击进入仍可用。

---

### Task 4: P3-2-lite 路由进度条 + 方向感过渡

**Files:**
- Create: `display-v2/src/utils/routeFeedback.js`（纯函数：方向判定 + 进度状态机）
- Create: `display-v2/tests/routeFeedback.test.js`
- Create: `display-v2/src/components/RouteProgress.vue`
- Modify: `display-v2/src/App.vue`（挂载进度条 + 动态过渡名）
- Modify: `display-v2/src/router/index.js`（beforeEach/afterEach 钩子）

- [ ] **Step 1: 写失败测试**

`tests/routeFeedback.test.js`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveNavDirection, createProgress } from '../src/utils/routeFeedback.js'

test('首次导航无方向（淡入）', () => {
  assert.equal(resolveNavDirection(null, 1), 'fade')
})

test('position 增大 = 前进推入', () => {
  assert.equal(resolveNavDirection(1, 2), 'forward')
})

test('position 减小 = 返回浮出', () => {
  assert.equal(resolveNavDirection(3, 1), 'back')
})

test('同 position（replace）= 淡入', () => {
  assert.equal(resolveNavDirection(2, 2), 'fade')
})

test('进度状态机：start 起步走细流，finish 收满后归隐', () => {
  let now = 0
  const p = createProgress({ now: () => now, tickMs: 200 })
  p.start()
  assert.ok(p.value() > 0 && p.value() < 0.3)
  now += 600
  p.tick()
  const mid = p.value()
  assert.ok(mid > 0.2 && mid < 0.9) // 细流缓增不触顶
  p.finish()
  assert.equal(p.value(), 1)
  p.reset()
  assert.equal(p.value(), 0)
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd display-v2 && node --test tests/routeFeedback.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现纯函数**

`src/utils/routeFeedback.js`：

```js
// 路由方向判定：基于 history.state.position（vue-router HTML5 模式维护）
// 返回 'forward' | 'back' | 'fade'
export const resolveNavDirection = (prevPos, nextPos) => {
  if (prevPos == null || nextPos == null || prevPos === nextPos) return 'fade'
  return nextPos > prevPos ? 'forward' : 'back'
}

// 顶部进度条状态机（nprogress 风格细流）：start 起步 0.08，tick 缓增逼近 0.9 不触顶，
// finish 直接收满，reset 归隐。时间源注入以便测试。
export const createProgress = ({ now = () => Date.now(), tickMs = 200 } = {}) => {
  let value = 0
  let startedAt = null
  return {
    start() {
      value = 0.08
      startedAt = now()
    },
    tick() {
      if (startedAt == null || value >= 0.9 || value === 1) return
      const elapsed = Math.max(0, now() - startedAt)
      const steps = Math.floor(elapsed / tickMs)
      // 细流：每 tick 增量按剩余距离衰减
      value = Math.min(0.9, 0.08 + (0.9 - 0.08) * (1 - Math.pow(0.82, steps)))
    },
    finish() {
      value = 1
    },
    reset() {
      value = 0
      startedAt = null
    },
    value: () => value,
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd display-v2 && node --test tests/routeFeedback.test.js`
Expected: PASS（5 用例）

- [ ] **Step 5: RouteProgress.vue 组件**

`src/components/RouteProgress.vue`：fixed 顶栏 2px，`z-index: 200`，背景 `var(--accent)`，`transform: scaleX(value)` + `transform-origin: left`，过渡 0.2s；`finish` 后 300ms 淡出再 reset。接收 `progress`（0-1）与 `visible` props。reduced-motion 下取消细流动画直接 0/1 切换。

- [ ] **Step 6: router 钩子 + App.vue 接线**

`router/index.js`：导出前不做钩子（保持纯路由表）；钩子在 App.vue `onMounted` 注册（`router.beforeEach` 返回移除函数，配合 `onUnmounted` 清理），避免循环 import。App.vue：

```js
import { useRouter } from 'vue-router'
import RouteProgress from './components/RouteProgress.vue'
import { resolveNavDirection, createProgress } from './utils/routeFeedback'

const router = useRouter()
const progress = createProgress()
const progressValue = ref(0)
const progressVisible = ref(false)
const navDirection = ref('fade')
let progressTimer = null
let lastPos = null

onMounted(() => {
  const removeBefore = router.beforeEach((to, from, next) => {
    navDirection.value = resolveNavDirection(lastPos, window.history.state?.position ?? null)
    lastPos = window.history.state?.position ?? lastPos
    progress.start()
    progressValue.value = progress.value()
    progressVisible.value = true
    progressTimer = setInterval(() => {
      progress.tick()
      progressValue.value = progress.value()
    }, 200)
    next()
  })
  const removeAfter = router.afterEach(() => {
    clearInterval(progressTimer)
    progress.finish()
    progressValue.value = 1
    setTimeout(() => {
      progressVisible.value = false
      progress.reset()
      progressValue.value = 0
    }, 350)
  })
  onUnmounted(() => { removeBefore(); removeAfter(); clearInterval(progressTimer) })
})
```

模板 `<header>` 前挂 `<RouteProgress :progress="progressValue" :visible="progressVisible" />`；`<transition :name="navTransition">` 其中 `navTransition = computed(() => ({ forward: 'page-slide', back: 'page-pop', fade: 'page-fade' })[navDirection.value])`。

全局 CSS 新增 `page-pop`（返回=浮出：enter 从 -8px/0.98 上浮，leave 下沉）与 `page-fade`（纯 opacity）。注意 history.state.position 在 beforeEach 时已是目标值（vue-router 先 push 后解析的场景例外，可接受；首跳 fade）。

- [ ] **Step 7: 构建 + 全量测试 + 提交**

```bash
cd display-v2 && npm run build && npm run test:unit
git add display-v2/src display-v2/tests
git commit -m "feat(display-v2): P3-2-lite 路由顶部进度条 + 前进/返回方向感过渡"
```

---

### Task 5: 批次验收与进度回写

- [ ] **Step 1: 全量验证**

```bash
cd display-v2 && npm run build && npm run test:unit
```

Expected: 构建通过、无新 warning；测试全 PASS。

- [ ] **Step 2: 人工验收清单（dev server）**

- 各详情/列表页刷新：骨架屏 → 内容；断网（DevTools offline）：ErrorState 统一出现且可重试
- 空态：时间线选无史事朝代、城市筛选为空等，EmptyState 印章+引导文案正确
- DevTools iPhone 模拟：沙盘单指滑动滚页面、双指旋转、单击出卡、HUD 触屏文案
- 路由来回切换：顶部进度条细流→收满→淡出；前进推入/返回浮出方向正确；主题切换进度条色随 --accent
- reduced-motion：进度条/骨架 shimmer 降级

- [ ] **Step 3: 回写任务追踪文档**

`docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md`：
- `P3-5`、`P3-3`、`P3-4` 勾选 `[x]`（注明日期与走查结论）
- `P3-2` 标 `[~]`（进度条+方向过渡完成；FLIP 共享元素延期批次 B）
- 进度总览表 P3 行更新为 4/6
- 变更日志追加本批记录

- [ ] **Step 4: 提交**

```bash
git add docs/plans/ && git commit -m "docs: P3 批次 A（状态层+触屏+路由反馈）验收回写"
```

---

## Self-Review 记录

- **Spec 覆盖**：P3-5/P3-3/P3-4 全覆盖；P3-2 明确拆分（进度条+方向感本批，FLIP 延期）；P3-1（滚动叙事涉 MapView 段落重构与镜头缓推，需设计迭代）、P3-6（真机验收）批次 B。
- **风险**：`controls.touches.ONE = null` 依赖 three 内部对 null 的容错（state=NONE，不处理单指）——已在 three r150+ 源码确认该分支安全，若构建后行为异常，回退方案为 `controls.enableRotate = false`（coarse 时整体禁旋转）。history.state.position 时序在 `mode="out-in"` 过渡下无竞态。
- **类型一致**：`createProgress` 返回值 App.vue 按 `.value()` 消费；EmptyState props 与五个调用点一一对应。
- **YAGNI**：不做空态插画图片（印章字 + 文案已达设计语言一致）；不做进度条百分比数字。
