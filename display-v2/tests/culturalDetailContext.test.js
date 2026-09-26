import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const readSource = (relativePath) =>
  readFile(new URL(`../src/${relativePath}`, import.meta.url), 'utf8')

test('文化详情页把公开 API 的 sources 交给来源组件且不虚构空来源', async () => {
  const source = await readSource('views/CulturalDetail.vue')

  assert.match(source, /SourceList/)
  assert.match(source, /:sources="sources"/)
  assert.match(source, /sources\.value\s*=\s*Array\.isArray\(data\.sources\)\s*\?\s*data\.sources\s*:\s*\[\]/)
})

test('文化详情路由向 AI 对话发送 cultural_item 上下文', async () => {
  const source = await readSource('components/AiChatBox.vue')

  assert.match(source, /CulturalDetail/)
  assert.match(source, /ctx\.type\s*=\s*['"]cultural_item['"]/)
  assert.match(source, /ctx\.entityId\s*=\s*route\.params\.id/)
  assert.match(source, /cultural_item/)
})

