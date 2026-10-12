import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const q = value => `'${String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "''")}'`
export function buildCultureResourceMigration(catalog) {
  const sql = [
    '-- V37: 齐鲁文化来源与本地插画补充；按类别和名称匹配，不依赖环境中的实体 ID。',
    '-- 由 scripts/generate-cultural-resource-migration.mjs 生成；不修改正文或审核状态。',
    '-- 来源支持扩展观察，正文内待考断言尚需逐句复核；外部媒体版权仍归原机构。',
    '-- 来源与关系写入不含 DELETE；已有配图与已有来源保留。',
    '',
  ]
  for (const entry of catalog.entries) {
    const where = `c.category = ${q(entry.category)} AND c.title = ${q(entry.title)}`
    sql.push(`-- ${entry.title}`)
    if (entry.image) {
      if (!/^\/images\/cultural\/[a-z0-9_]+\.webp$/.test(entry.image)) throw new Error('非法本地素材路径')
      sql.push(`UPDATE cultural_item c SET c.image_anime_url = ${q(entry.image)}`)
      sql.push(`WHERE ${where} AND (c.image_anime_url IS NULL OR c.image_anime_url = '');`)
    }
    for (const source of entry.sources) {
      const parsed = new URL(source.url)
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('来源必须是无凭据 HTTPS URL')
      const year = Number.isInteger(source.publicationYear) ? source.publicationYear : 'NULL'
      const sourceType = /(?:\.gov\.cn|\.edu\.cn)$/.test(parsed.hostname) || parsed.hostname === 'www.ihchina.cn' ? 'official_site' : 'article'
      const copyrightNote = source.copyrightNote || entry.realAssets?.find(asset => asset.sourceUrl === source.url)?.license || '保留原页链接；未发现开放转载许可，不搬运外部图像、声音或节目。'
      const note = `扩展资料：${source.note || '用于文化观察与比较'}；2026-10-12 核验来源原页；不表示正文所有待考断言已复核。`
      sql.push('INSERT INTO source_document (source_type, title, author_org, publication_year, url, copyright_note)')
      sql.push(`SELECT ${q(sourceType)}, ${q(source.title)}, ${q(source.authorOrg)}, ${year}, ${q(source.url)}, ${q(copyrightNote)}`)
      sql.push(`WHERE EXISTS (SELECT 1 FROM cultural_item c WHERE ${where})`)
      sql.push(`AND NOT EXISTS (SELECT 1 FROM source_document s WHERE s.url = ${q(source.url)});`)
      sql.push('INSERT INTO content_source_link (entity_type, entity_id, source_document_id, locator, note)')
      sql.push(`SELECT 'cultural_item', c.id, s.id, '来源原页：扩展观察', ${q(note.slice(0, 490))}`)
      sql.push(`FROM cultural_item c JOIN source_document s ON s.id = (SELECT MIN(id) FROM source_document WHERE url = ${q(source.url)})`)
      sql.push(`WHERE ${where}`)
      sql.push("AND NOT EXISTS (SELECT 1 FROM content_source_link l WHERE l.entity_type = 'cultural_item' AND l.entity_id = c.id AND l.source_document_id = s.id AND l.locator = '来源原页：扩展观察');")
    }
    sql.push('')
  }
  return sql.join('\n').trimEnd() + '\n'
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const input = process.argv[2] || 'display-v2/src/content/culture/enrichment.json'
  const output = process.argv[3] || 'backend/src/main/resources/db/migration/V37__culture_resources.sql'
  const catalog = JSON.parse(await readFile(input, 'utf8'))
  if (catalog.entries.some(entry => !entry.sources.length)) throw new Error('尚有条目缺少来源，不生成不完整迁移')
  await writeFile(output, buildCultureResourceMigration(catalog))
  console.log(`已生成 ${output}，${catalog.entries.length} 条目；未应用数据库。`)
}
