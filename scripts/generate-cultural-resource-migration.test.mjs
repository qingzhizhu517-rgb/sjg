import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCultureResourceMigration } from './generate-cultural-resource-migration.mjs'

const entry = { category: 'craft', title: "工艺'试例", image: '/images/cultural/lu_brocade_weaving.webp', sources: [{ url: 'https://www.ihchina.cn/project_details/1.html', title: '来源', authorOrg: '机构' }] }
test('来源回填按名称类别绑定且保留审核状态与已有资源', () => {
  const sql = buildCultureResourceMigration({ entries: [entry] })
  assert.match(sql, /c\.category = 'craft' AND c\.title = '工艺''试例'/)
  assert.match(sql, /c\.image_anime_url IS NULL OR c\.image_anime_url = ''/)
  assert.match(sql, /NOT EXISTS \(SELECT 1 FROM source_document/)
  assert.match(sql, /NOT EXISTS \(SELECT 1 FROM content_source_link/)
  assert.doesNotMatch(sql, /\bDELETE\s+FROM|UPDATE\s+content_review|SET\s+.*status\s*=/i)
  assert.match(sql, /正文所有待考断言已复核/)
})
test('拒绝非HTTPS、携凭据URL和不属于文化目录的本地素材', () => {
  for (const url of ['http://example.com', 'https://user:password@example.com']) {
    assert.throws(() => buildCultureResourceMigration({ entries: [{ ...entry, sources: [{ url }] }] }))
  }
  assert.throws(() => buildCultureResourceMigration({ entries: [{ ...entry, image: '/private/secret.webp' }] }))
})
