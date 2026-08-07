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
