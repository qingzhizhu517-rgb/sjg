import test from 'node:test'
import assert from 'node:assert/strict'
import { buildReadingExportMarkdown } from '../src/utils/readingExport.js'
const materials = [{ id: 12, label: 'A', title: '甲', author: '杜甫', dynasty: '唐', lines: [{ number: 1, text: '原文' }], sources: [{ title: '书', locator: '卷一', url: 'https://example.org/book' }] }, { id: 19, label: 'B', title: '乙', lines: [{ number: 1, text: '另一篇' }], sources: [] }]
test('导出包含实际来源、材料链接、选句和个人判断', () => {
  const text = buildReadingExportMarkdown({ materials, answer: '我的判断', selected: [{ label: 'A', number: 1, text: '伪造' }], origin: 'https://sjg.example', preview: false })
  assert.match(text, /https:\/\/sjg.example\/poems\/12/); assert.match(text, /卷一/); assert.match(text, /我的判断/); assert.match(text, /\[A:1\] 原文/); assert.doesNotMatch(text, /伪造/)
  assert.match(text, /材料 B.*来源未登记/)
})
test('AI导出可选；未完成和样本不会被导出成已完成真实生成', () => {
  const options = { materials, answer: '', selected: [], preview: true, ai: { text: '线索', status: 'stopped', mode: 'compare' } }
  assert.doesNotMatch(buildReadingExportMarkdown(options), /线索/)
  const text = buildReadingExportMarkdown({ ...options, includeAi: true })
  assert.match(text, /设计预览样本/); assert.match(text, /导读示例/); assert.match(text, /未完成/)
})
