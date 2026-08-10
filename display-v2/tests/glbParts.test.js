import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HULU_PARTS, matchPartName, expandPatterns } from '../src/config/glbParts.js'

test('命名规范含 10 个保留部件名', () => {
  assert.equal(HULU_PARTS.length, 10)
  assert.ok(HULU_PARTS.includes('gourd_body'))
  assert.ok(HULU_PARTS.includes('painted_layer'))
})

test('精确匹配', () => {
  assert.ok(matchPartName('gourd_body', 'gourd_body'))
  assert.ok(!matchPartName('gourd_body', 'gourd_raw'))
})

test('尾缀通配匹配', () => {
  assert.ok(matchPartName('scene_*', 'scene_base'))
  assert.ok(matchPartName('scene_*', 'scene_prop_dish'))
  assert.ok(!matchPartName('scene_*', 'gourd_body'))
})

test('expandPatterns 展开通配为具体部件集合并去重', () => {
  const all = ['gourd_raw', 'scene_base', 'scene_prop_dish', 'knife_rest']
  const out = expandPatterns(['gourd_raw', 'scene_*'], all)
  assert.deepEqual(out.sort(), ['gourd_raw', 'scene_base', 'scene_prop_dish'])
})

test('expandPatterns 对未命中模式静默跳过', () => {
  const all = ['gourd_raw']
  assert.deepEqual(expandPatterns(['nonexistent'], all), [])
})
