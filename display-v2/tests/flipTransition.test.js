import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeFlipDeltas } from '../src/composables/useFlipTransition.js'

test('computeFlipDeltas: 源小于目标 → 缩放 < 1', () => {
  const from = { left: 100, top: 200, width: 300, height: 200 }
  const to = { left: 0, top: 0, width: 960, height: 540 }
  const { dx, dy, sx, sy } = computeFlipDeltas(from, to)
  assert.equal(dx, 100)
  assert.equal(dy, 200)
  assert.ok(Math.abs(sx - 0.3125) < 0.01)
  assert.ok(Math.abs(sy - 0.3704) < 0.01)
})

test('computeFlipDeltas: 相同位置和尺寸 → 零变换', () => {
  const rect = { left: 50, top: 100, width: 200, height: 150 }
  const { dx, dy, sx, sy } = computeFlipDeltas(rect, rect)
  assert.equal(dx, 0)
  assert.equal(dy, 0)
  assert.equal(sx, 1)
  assert.equal(sy, 1)
})

test('computeFlipDeltas: 源在目标右下方', () => {
  const from = { left: 500, top: 400, width: 200, height: 150 }
  const to = { left: 200, top: 100, width: 400, height: 300 }
  const { dx, dy, sx, sy } = computeFlipDeltas(from, to)
  assert.equal(dx, 300)
  assert.equal(dy, 300)
  assert.equal(sx, 0.5)
  assert.equal(sy, 0.5)
})

test('computeFlipDeltas: 目标 width 为 0 不崩溃（sx = from.width / 1）', () => {
  const from = { left: 0, top: 0, width: 100, height: 100 }
  const to = { left: 0, top: 0, width: 0, height: 0 }
  const { dy } = computeFlipDeltas(from, to)
  // dy = 0 / 1 = 0 (safe)
  assert.equal(dy, 0)
})
