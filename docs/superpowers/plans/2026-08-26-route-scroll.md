# 展示前端统一即时回顶 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 `display-v2` 从列表进入诗人及其他详情页时停留在中下部的问题，并统一所有跨页面导航的即时回顶行为。

**Architecture:** 将滚动决策抽成 `src/utils/routeScroll.js` 的无 DOM 纯函数，由 Vue Router 的 `scrollBehavior` 统一调用。新路径和首次进入返回顶部位置，历史前进/后退恢复保存位置，同路径仅 query/hash 变化返回 `false` 保留当前位置；删除全局平滑滚动声明，页面内需要平滑的调用继续显式指定行为。

**Tech Stack:** Vue 3, Vue Router 4, CSS, Node.js built-in `node:test`, Vite 8。

---

## 文件地图

- **Create:** `display-v2/src/utils/routeScroll.js` — 路由滚动决策纯函数。
- **Create:** `display-v2/tests/routeScroll.test.js` — 路径变化、历史恢复、query/hash 保留和全局 CSS 回归测试。
- **Modify:** `display-v2/src/router/index.js` — 接入共享滚动决策函数。
- **Modify:** `display-v2/src/styles/variables.css` — 移除 `html` 的全局 `scroll-behavior: smooth`。
- **Do not touch:** `backend/src/main/resources/application.yml`、`docs/plans/cultural-games-proposal.md` 及已完成的诗人详情 B-1 文件。

### Task 1: 添加滚动行为回归测试（先红灯）

**Files:**
- Create: `display-v2/tests/routeScroll.test.js`
- Read: `display-v2/src/router/index.js`, `display-v2/src/styles/variables.css`

- [ ] **Step 1: 写失败测试**

创建以下测试。动态加载允许在实现模块尚不存在时以断言失败结束，而不是因模块解析错误中断：

```js
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const loadRouteScroll = async () => {
  try {
    return await import('../src/utils/routeScroll.js')
  } catch {
    return null
  }
}

const [routerSource, variablesSource] = await Promise.all([
  readFile(new URL('../src/router/index.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/variables.css', import.meta.url), 'utf8'),
])

const route = (path, extra = {}) => ({ path, query: {}, hash: '', ...extra })

test('新路径（包括列表到所有详情入口）即时回到顶部', async () => {
  const module = await loadRouteScroll()
  assert.ok(module, 'routeScroll.js must export the route scroll resolver')
  const { resolveRouteScroll } = module
  const entries = [
    ['/poets', '/poets/1'],
    ['/poets', '/poems/1'],
    ['/regions/济南', '/spots/1'],
    ['/festivals', '/festivals/1'],
    ['/crafts', '/crafts/1'],
    ['/literature', '/literature/1'],
    ['/food-opera', '/food-opera/1'],
  ]
  for (const [fromPath, toPath] of entries) {
    assert.deepEqual(resolveRouteScroll(route(toPath), route(fromPath), null), {
      left: 0,
      top: 0,
      behavior: 'auto',
    })
  }
})

test('浏览器前进/后退恢复保存位置且不启用平滑动画', async () => {
  const module = await loadRouteScroll()
  assert.ok(module)
  const savedPosition = { left: 12, top: 864 }
  assert.deepEqual(
    module.resolveRouteScroll(route('/poets'), route('/poets/1'), savedPosition),
    { left: 12, top: 864, behavior: 'auto' },
  )
})

test('同路径仅 query 或 hash 变化时保留当前滚动位置', async () => {
  const module = await loadRouteScroll()
  assert.ok(module)
  const from = route('/poets', { query: { view: 'all' } })
  assert.equal(module.resolveRouteScroll(route('/poets', { query: { view: 'graph' } }), from, null), false)
  assert.equal(module.resolveRouteScroll(route('/poets', { hash: '#results' }), from, null), false)
})

test('首次导航没有来源路由时回到顶部', async () => {
  const module = await loadRouteScroll()
  assert.ok(module)
  assert.deepEqual(module.resolveRouteScroll(route('/map'), null, null), {
    left: 0,
    top: 0,
    behavior: 'auto',
  })
})

test('路由接入共享决策函数，且全局 CSS 不再开启平滑滚动', () => {
  assert.match(routerSource, /resolveRouteScroll/)
  assert.doesNotMatch(variablesSource, /scroll-behavior\\s*:\\s*smooth/)
})
```

- [ ] **Step 2: 运行测试确认红灯**

Run from `display-v2`:

```bash
node --test tests/routeScroll.test.js
```

Expected: tests fail with assertions that `routeScroll.js` is missing, the router has no shared resolver reference, and `variables.css` still contains `scroll-behavior: smooth`.

- [ ] **Step 3: Commit the red test**

```bash
git add tests/routeScroll.test.js
git commit -m "test(display): define immediate route scroll contract"
```

### Task 2: 实现纯函数并接入 Vue Router

**Files:**
- Create: `display-v2/src/utils/routeScroll.js`
- Modify: `display-v2/src/router/index.js:1,29-32`

- [ ] **Step 1: 添加最小纯函数实现**

创建：

```js
// 统一计算展示前端的路由滚动策略。
// 新路径即时回顶；历史导航恢复位置；同路径 query/hash 变化保持当前位置。
export const resolveRouteScroll = (to, from, savedPosition) => {
  if (savedPosition) {
    return {
      left: savedPosition.left ?? 0,
      top: savedPosition.top ?? 0,
      behavior: 'auto',
    }
  }

  if (!from || to?.path !== from.path) {
    return { left: 0, top: 0, behavior: 'auto' }
  }

  return false
}
```

- [ ] **Step 2: 让路由只负责转发参数**

在 `display-v2/src/router/index.js` 顶部加入：

```js
import { resolveRouteScroll } from '../utils/routeScroll.js'
```

并替换 `scrollBehavior`：

```js
scrollBehavior(to, from, savedPosition) {
  return resolveRouteScroll(to, from, savedPosition)
}
```

- [ ] **Step 3: 运行回归测试确认路由行为绿灯**

```bash
node --test tests/routeScroll.test.js
```

Expected: 前 4 个行为测试通过；最后一个综合源码契约测试暂时因 `variables.css` 仍有 `scroll-behavior: smooth` 而失败，待 Task 3 移除全局声明后再全绿。

- [ ] **Step 4: Commit the router implementation**

```bash
git add src/utils/routeScroll.js src/router/index.js
git commit -m "fix(display): restore immediate route scroll behavior"
```

### Task 3: 移除全局平滑滚动竞态源

**Files:**
- Modify: `display-v2/src/styles/variables.css:116-120`

- [ ] **Step 1: 删除全局 CSS 平滑声明**

将 `html` 规则从：

```css
html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

改为：

```css
html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

保留 `PoetList.vue`、`MapView.vue` 等页面已有的显式 `scrollIntoView({ behavior: 'smooth' })`，不新增隐式平滑滚动。

- [ ] **Step 2: 运行滚动测试与显式滚动调用检查**

```bash
node --test tests/routeScroll.test.js
rg -n "scrollIntoView\\(" src --glob '*.vue' --glob '*.js'
```

Expected: 5 tests pass；所有保留的 `scrollIntoView` 调用均显式传入 `behavior` 或属于内部容器滚动，不再有全局 `html` 平滑声明。

- [ ] **Step 3: Commit the CSS fix**

```bash
git add src/styles/variables.css
git commit -m "fix(display): disable global smooth scrolling"
```

### Task 4: 全量验证与桌面验收

**Files:**
- Read only: all `display-v2` tests, route files, affected detail views

- [ ] **Step 1: 运行完整单元测试**

```bash
npm run test:unit
```

Expected: all existing tests and the new route scroll tests pass with zero failures.

- [ ] **Step 2: 运行生产构建和差异检查**

```bash
npm run build
git diff --check HEAD~3..HEAD
```

Expected: Vite exits with code 0；差异检查无输出。以实现开始前的提交 `4098769` 为基准运行 `git diff --check 4098769..HEAD`，覆盖本次实现提交范围。

- [ ] **Step 3: 检查所有详情路由均走统一策略**

确认 `src/router/index.js` 的单一 `scrollBehavior` 覆盖 `/poets/:id`、`/poems/:id`、`/spots/:id`、`/festivals/:id`、`/crafts/:id`、`/literature/:id`、`/food-opera/:id`，且列表 query 更新仍由纯函数返回 `false`。

- [ ] **Step 4: 桌面浏览器手测**

在 1440×900 或更大窗口执行：

1. `/poets` 滚到中下部，点击诗人进入 `/poets/:id`，确认切换后和异步数据加载完成后 `scrollY === 0`。
2. 从景点/文化列表进入诗词、景点、节庆、工艺、文学、饮食戏曲详情，重复顶部检查。
3. 浏览器后退返回列表，确认保存的列表滚动位置恢复。
4. 切换诗人 tab、朝代筛选、时间轴和文化列表 query，确认当前位置保持，页面自己的结果区滚动仍正常。

- [ ] **Step 5: Commit any verification-only documentation if needed**

不要提交构建产物、截图或本地环境文件；只保留实现、测试和已批准的设计/计划文档。
