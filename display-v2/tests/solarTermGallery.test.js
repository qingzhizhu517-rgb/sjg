import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  shouldAutoRotate,
  visibleTermIndexes,
  wrapTermIndex,
} from '../src/utils/solarTermGallery.js'

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

test('仅在页面可见、窗口聚焦且用户未交互时自动轮播', () => {
  const ready = {
    autoPlay: true,
    reducedMotion: false,
    pageVisible: true,
    windowFocused: true,
    pointerInside: false,
    focusWithin: false,
  }

  assert.equal(shouldAutoRotate(ready), true)
  assert.equal(shouldAutoRotate({ ...ready, reducedMotion: true }), false)
  assert.equal(shouldAutoRotate({ ...ready, pageVisible: false }), false)
  assert.equal(shouldAutoRotate({ ...ready, windowFocused: false }), false)
  assert.equal(shouldAutoRotate({ ...ready, pointerInside: true }), false)
  assert.equal(shouldAutoRotate({ ...ready, focusWithin: true }), false)
})
