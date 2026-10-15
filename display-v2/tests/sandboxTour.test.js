import test from 'node:test'
import assert from 'node:assert/strict'
import { createTour } from '../src/three/sandbox/tour.js'
import { layoutLabels } from '../src/three/sandbox/core.js'

test('tour is opt-in, pauses without advancing and finishes without looping', () => {
  const tour = createTour(['菏泽', '济南', '东营'], 8)
  assert.equal(tour.step(100), null)
  assert.equal(tour.start().city, '菏泽')
  assert.equal(tour.step(7), null)
  tour.pause()
  assert.equal(tour.step(100), null)
  tour.resume()
  assert.equal(tour.step(7), null)
  assert.equal(tour.step(1).city, '济南')
  assert.equal(tour.step(8).city, '东营')
  assert.equal(tour.step(8).status, 'complete')
  assert.equal(tour.step(100), null)
  assert.equal(tour.stop().city, null)
})

test('manual tour bounds navigation and never advances with motion off', () => {
  const tour = createTour(['菏泽', '东营'])
  assert.equal(tour.start(false).status, 'paused')
  assert.equal(tour.step(100), null)
  assert.equal(tour.move(-1).index, 0)
  assert.equal(tour.move(1).city, '东营')
  assert.equal(tour.move(1).index, 1)
  assert.equal(tour.move(NaN).index, 1)
  tour.stop()
  assert.equal(tour.move(1).status, 'idle')
})

test('narrow screens limit plaques while keeping selected city and short leaders', () => {
  const labels = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '淄博', '滨州', '东营'].map((name, i) => ({
    name,
    x: 70 + i * 24,
    y: 200 + i * 3,
    visible: true,
  }))
  const result = layoutLabels(labels, '济南', 350, 360)
  assert.ok(result.filter((x) => x.visible).length <= 3)
  assert.ok(result.find((x) => x.name === '济南').visible)
  for (const label of result.filter((x) => x.visible)) {
    assert.ok(Math.hypot(label.x - label.anchorX, label.y - label.anchorY) < 85)
    assert.ok(label.y < 360 - 70, 'reserve room for the map note and gesture help')
  }
})
