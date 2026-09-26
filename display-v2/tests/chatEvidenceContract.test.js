import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/components/AiChatBox.vue', import.meta.url), 'utf8')

test('AI 依据展示使用后端 EvidenceSnippet 的摘要和来源 ID 字段', () => {
  assert.match(source, /item\.snippet/)
  assert.match(source, /item\.sourceIds/)
  assert.match(source, /来源 ID/)
})
