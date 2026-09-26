import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv, validateSourceLedger } from './content-ledger-check.mjs'

const columns = [
  'source_key', 'entity_type', 'entity_id', 'entity_name', 'title', 'author_or_org',
  'publication_year', 'identifier', 'url_or_catalog', 'locator', 'rights_note',
  'review_status', 'reviewer', 'reviewed_at', 'notes',
]

function row(overrides = {}) {
  return {
    source_key: 'source-1',
    entity_type: 'poem',
    entity_id: '1',
    entity_name: '诗一',
    title: '《诗一》来源',
    author_or_org: '山东省图书馆',
    publication_year: '2020',
    identifier: 'ISBN-1',
    url_or_catalog: 'https://example.test/catalog/1',
    locator: '第 1 页',
    rights_note: '仅用于研究与教学引用',
    review_status: 'published',
    reviewer: 'reviewer-1',
    reviewed_at: '2026-09-12',
    notes: '',
    ...overrides,
  }
}

function firstTaskRows() {
  return [
    row(),
    row({ source_key: 'source-2', entity_id: '2', entity_name: '诗二' }),
    row({ source_key: 'source-3', entity_id: '3', entity_name: '诗三' }),
    row({ source_key: 'source-4', entity_type: 'scenic_spot', entity_id: '4', entity_name: '景一' }),
    row({ source_key: 'source-5', entity_type: 'scenic_spot', entity_id: '5', entity_name: '景二' }),
    row({ source_key: 'source-6', entity_type: 'scenic_spot', entity_id: '6', entity_name: '景三' }),
    row({ source_key: 'source-7', entity_type: 'timeline', entity_id: '7', entity_name: '时间线' }),
  ]
}

test('parseCsv preserves quoted commas and escaped quotes', () => {
  const csv = 'source_key,title,notes\nsource-1,"书名, 卷一","他说 ""可核验"""\n'
  assert.deepEqual(parseCsv(csv), [{
    source_key: 'source-1',
    title: '书名, 卷一',
    notes: '他说 "可核验"',
  }])
})

test('accepts a complete first-task ledger and verifies task entity coverage', () => {
  const task = {
    resources: firstTaskRows().map((item) => ({
      entityType: item.entity_type,
      entityId: Number(item.entity_id),
    })),
    steps: [{ questions: [{ entityRefs: [
      { type: 'poem', id: 1 },
      { type: 'scenic_spot', id: 4 },
    ] }] }],
  }
  const result = validateSourceLedger(firstTaskRows(), { task, requirePublished: true, requireFirstTaskScope: true })
  assert.deepEqual(result, [])
})

test('rejects placeholders, missing provenance metadata and non-published rows', () => {
  const issues = validateSourceLedger([row({
    title: '待填写',
    author_or_org: '',
    identifier: '',
    url_or_catalog: '',
    locator: '',
    rights_note: '',
    reviewer: '',
    reviewed_at: '',
    review_status: 'approved',
  })], { requirePublished: true })
  assert.ok(issues.some((item) => item.message.includes('占位')))
  assert.ok(issues.some((item) => item.message.includes('作者/机构')))
  assert.ok(issues.some((item) => item.message.includes('标识')))
  assert.ok(issues.some((item) => item.message.includes('定位')))
  assert.ok(issues.some((item) => item.message.includes('版权')))
  assert.ok(issues.some((item) => item.message.includes('published')))
})

test('rejects duplicate source keys and unsupported or invalid entity rows', () => {
  const issues = validateSourceLedger([
    row(),
    row({ source_key: 'source-1', entity_type: 'unknown', entity_id: '0' }),
  ])
  assert.ok(issues.some((item) => item.message.includes('source_key 必须唯一')))
  assert.ok(issues.some((item) => item.message.includes('实体类型')))
  assert.ok(issues.some((item) => item.message.includes('正整数')))
})

test('rejects a task reference not covered by the ledger', () => {
  const task = {
    resources: [{ entityType: 'poem', entityId: 99 }],
    steps: [{ questions: [{ entityRefs: [{ type: 'poem', id: 99 }] }] }],
  }
  const issues = validateSourceLedger([row()], { task })
  assert.ok(issues.some((item) => item.message.includes('任务引用的实体未出现在来源台账')))
})

test('requires the first-task scope when requested', () => {
  const issues = validateSourceLedger([row()], { requireFirstTaskScope: true })
  assert.ok(issues.some((item) => item.message.includes('至少需要 3 个 poem')))
  assert.ok(issues.some((item) => item.message.includes('至少需要 3 个 scenic_spot')))
  assert.ok(issues.some((item) => item.message.includes('至少需要 1 个 timeline')))
})
