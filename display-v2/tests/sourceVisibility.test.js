import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const readSource = (relativePath) =>
  readFile(new URL(`../src/${relativePath}`, import.meta.url), 'utf8').catch(() => '')

const sourceUtils = await import('../src/utils/source.js').catch(() => ({}))

test('来源 URL 只允许带主机名的 http(s) 地址', () => {
  const safeSourceUrl = sourceUtils.safeSourceUrl
  assert.equal(safeSourceUrl?.('https://library.example.org/item/42'), 'https://library.example.org/item/42')
  assert.equal(safeSourceUrl?.('HTTP://LIBRARY.EXAMPLE.ORG/item/42'), 'http://library.example.org/item/42')
  assert.equal(safeSourceUrl?.('javascript:alert(1)'), '')
  assert.equal(safeSourceUrl?.('data:text/html,unsafe'), '')
  assert.equal(safeSourceUrl?.('//library.example.org/item/42'), '')
  assert.equal(safeSourceUrl?.('/internal/source/42'), '')
  assert.equal(safeSourceUrl?.('https:///missing-host'), '')
  assert.equal(safeSourceUrl?.('https://user:password@library.example.org/item/42'), '')
})

test('来源记录保留证据字段并丢弃空的或非对象记录', () => {
  const normalizeSourceEntries = sourceUtils.normalizeSourceEntries
  const normalized = normalizeSourceEntries?.([
    {
      sourceId: 7,
      title: ' 齐鲁文献集 ',
      authorOrg: ' 山东省图书馆 ',
      publicationYear: 2024,
      url: 'https://library.example.org/item/7',
      citation: ' 山东省图书馆：《齐鲁文献集》 ',
      locator: ' 第 18 页 ',
      quote: ' 相关原文摘录 ',
      note: ' 用于校正文献年代 ',
      reviewStatus: 'published',
    },
    null,
    {},
    { title: '危险链接', url: 'javascript:alert(1)' },
  ])

  assert.deepEqual(normalized, [
    {
      sourceId: 7,
      title: '齐鲁文献集',
      authorOrg: '山东省图书馆',
      publicationYear: 2024,
      url: 'https://library.example.org/item/7',
      citation: '山东省图书馆：《齐鲁文献集》',
      locator: '第 18 页',
      quote: '相关原文摘录',
      note: '用于校正文献年代',
      reviewStatus: 'published',
    },
    {
      sourceId: null,
      title: '危险链接',
      authorOrg: '',
      publicationYear: '',
      url: '',
      citation: '',
      locator: '',
      quote: '',
      note: '',
      reviewStatus: '',
    },
  ])
  assert.deepEqual(normalizeSourceEntries?.([]), [])
  assert.deepEqual(normalizeSourceEntries?.(null), [])
})

test('来源组件展示完整引用字段并对外链设置安全属性', async () => {
  const source = await readSource('components/SourceList.vue')
  assert.match(source, /来源资料/)
  assert.match(source, /source\.title/)
  assert.match(source, /source\.authorOrg/)
  assert.match(source, /source\.publicationYear/)
  assert.match(source, /source\.citation/)
  assert.match(source, /source\.locator/)
  assert.match(source, /source\.quote/)
  assert.match(source, /source\.note/)
  assert.match(source, /target="_blank"/)
  assert.match(source, /rel="noopener noreferrer"/)
  assert.match(source, /safeSourceUrl/)
  assert.match(source, /v-if="normalizedSources\.length"/)
})

for (const view of ['views/PoemDetail.vue', 'views/PoetDetail.vue', 'views/SpotDetail.vue']) {
  test(`${view} 将公开 API 的 sources 交给来源组件且空数组不虚构来源`, async () => {
    const source = await readSource(view)
    assert.match(source, /SourceList/)
    assert.match(source, /:sources="sources"/)
    assert.match(source, /sources\.value\s*=\s*Array\.isArray\(data\.sources\)\s*\?\s*data\.sources\s*:\s*\[\]/)
  })
}
