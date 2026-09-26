import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('./src/views/AiMetrics.vue', import.meta.url), 'utf8')

test('AI 指标页展示错误率并按百分比格式化', () => {
  assert.match(source, /key:\s*'errorRate'\s*,\s*label:\s*'错误率'/)
  assert.match(source, /\['errorRate',\s*'feedbackRate',\s*'helpfulRate'\]/)
})
