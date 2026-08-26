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
  assert.doesNotMatch(variablesSource, /scroll-behavior\s*:\s*smooth/)
})
