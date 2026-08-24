import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitPoemLines } from '../src/utils/poem.js'

test('尊重数据库原有换行', () => {
  assert.deepEqual(splitPoemLines('山明水净夜来霜，\n数树深红出浅黄。'), [
    '山明水净夜来霜，',
    '数树深红出浅黄。',
  ])
})

test('单段长文本按句末标点切行并保留标点', () => {
  assert.deepEqual(splitPoemLines('常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。'), [
    '常记溪亭日暮，沉醉不知归路。',
    '兴尽晚回舟，误入藕花深处。',
  ])
})

test('空内容返回空数组', () => {
  assert.deepEqual(splitPoemLines(null), [])
  assert.deepEqual(splitPoemLines('   '), [])
})

test('标点后没有正文时不产生空行', () => {
  assert.deepEqual(splitPoemLines('争渡，争渡！'), ['争渡，争渡！'])
})
