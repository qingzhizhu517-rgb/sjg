import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

import { consumeSseBuffer } from '../src/utils/sse.js'

test('消费完整 SSE 事件并保留未完成缓冲', () => {
  const result = consumeSseBuffer('data: {"delta":"a"}\n\ndata: {"delta":"b"}')
  assert.deepEqual(result.events, ['{"delta":"a"}'])
  assert.equal(result.rest, 'data: {"delta":"b"}')
})

test('flush 时消费连接关闭前没有空行的最后一个事件', () => {
  const result = consumeSseBuffer('data: {"delta":"b"}', true)
  assert.deepEqual(result.events, ['{"delta":"b"}'])
  assert.equal(result.rest, '')
})

test('flush 不重复已经完整分隔的事件', () => {
  const result = consumeSseBuffer('data: {"delta":"a"}\n\ndata: {"delta":"b"}\n\n', true)
  assert.deepEqual(result.events, ['{"delta":"a"}', '{"delta":"b"}'])
})

test('flush 同时处理完整事件和未完成尾事件且不重复', () => {
  const result = consumeSseBuffer('data: {"delta":"a"}\n\ndata: {"delta":"b"}', true)
  assert.deepEqual(result.events, ['{"delta":"a"}', '{"delta":"b"}'])
})

test('AI 对话和反思反馈都使用统一 SSE flush 解析器', () => {
  const chat = fs.readFileSync(new URL('../src/components/AiChatBox.vue', import.meta.url), 'utf8')
  const reflection = fs.readFileSync(new URL('../src/components/learning/ReflectionStep.vue', import.meta.url), 'utf8')
  assert.match(chat, /consumeSseBuffer\(buffer, true\)/)
  assert.match(reflection, /consumeSseBuffer\(buffer, true\)/)
})

test('两个 SSE 消费端在流结束时 flush TextDecoder', () => {
  const chat = fs.readFileSync(new URL('../src/components/AiChatBox.vue', import.meta.url), 'utf8')
  const reflection = fs.readFileSync(new URL('../src/components/learning/ReflectionStep.vue', import.meta.url), 'utf8')
  assert.match(chat, /decoder\.decode\(\)/)
  assert.match(reflection, /decoder\.decode\(\)/)
})
