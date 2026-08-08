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
