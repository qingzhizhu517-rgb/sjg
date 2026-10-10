import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseEmotionTags, poemEmotionScore, summarizePoemEmotions } from '../src/utils/atlasEmotion.js'

test('情感标签兼容数组、JSON 和分隔文本，同一作品的重复标签只计一次', () => {
  assert.deepEqual(parseEmotionTags(['豪放', ' 豪放 ', null, 2, '悠远', '']), ['豪放', '悠远'])
  assert.deepEqual(parseEmotionTags('["婉约","幽思"]'), ['婉约', '幽思'])
  assert.deepEqual(parseEmotionTags('豪放，悠远、清新'), ['豪放', '悠远', '清新'])
})

test('缺失标签和未知标签不会产生默认情感分值', () => {
  for (const sentimentTags of [null, undefined, '', [], {}, ['待考'], ['constructor', '__proto__']]) {
    assert.equal(poemEmotionScore({ sentimentTags }), null)
  }
  assert.equal(poemEmotionScore({ sentimentTags: ['豪放', '待考'] }), 92)
})

test('朝代均值只取有可映射标签的作品，缺失作品仍保留在样本数中', () => {
  const result = summarizePoemEmotions([
    { sentimentTags: ['豪放', '悠远'] },
    { sentimentTags: ['婉约'] },
    { sentimentTags: ['待考'] },
    {},
  ])
  assert.equal(result.sampleCount, 4)
  assert.equal(result.taggedCount, 3)
  assert.equal(result.scoredCount, 2)
  assert.equal(result.meanScore, 61)
})

test('情感分布按标签出现次数计算，未知标签可统计但不参与曲线赋分', () => {
  const result = summarizePoemEmotions([
    { sentimentTags: ['豪放', '豪放', '悠远'] },
    { sentimentTags: ['豪放', '待考'] },
  ])
  assert.equal(result.tagCount, 4)
  assert.deepEqual(result.tags, [
    { name: '豪放', count: 2, percent: 50 },
    { name: '悠远', count: 1, percent: 25 },
    { name: '待考', count: 1, percent: 25 },
  ])
})

test('空筛选及全缺失标签返回空统计与null均值', () => {
  for (const poems of [[], [{}, { sentimentTags: [] }]]) {
    const result = summarizePoemEmotions(poems)
    assert.equal(result.meanScore, null)
    assert.equal(result.scoredCount, 0)
    assert.equal(result.tagCount, 0)
    assert.deepEqual(result.tags, [])
  }
})
