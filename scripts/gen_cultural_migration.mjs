#!/usr/bin/env node
/**
 * 九城五类研究数据 → 幂等 SQL seed migration 生成器。
 *
 * 用法（Node 24, 无依赖）:
 *   node scripts/gen_cultural_migration.mjs <输入json> <类别> <V编号>
 *   例: node scripts/gen_cultural_migration.mjs scripts/output/_research_festival.json festival V18
 *
 * 输入 JSON: 数组, 元素字段见 CATEGORY_SCHEMAS; 中文原样, 单引号由本脚本转义。
 * 输出: scripts/output/<编号小写>__<类别>_seed.sql（沿用既有 seed 的「DELETE+INSERT」幂等风格,
 *       detail 表随主表 ON DELETE CASCADE, 先删主行即可）。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const CATEGORY_SCHEMAS = {
  festival: {
    table: 'festival_detail',
    cols: ['festival_date', 'origin', 'customs', 'food'],
  },
  craft: {
    table: 'craft_detail',
    cols: ['craft_category', 'materials', 'tools', 'process', 'inheritors', 'representative_works', 'difficulty_level', 'learning_resources'],
  },
  literature: {
    table: 'literature_detail',
    cols: ['genre', 'origin_region', 'main_characters', 'plot_summary', 'cultural_significance', 'related_scenic_spots', 'collection_source'],
  },
  food_opera: {
    table: 'food_opera_detail',
    cols: ['sub_category', 'cuisine_type', 'ingredients', 'preparation_method', 'representative_dishes', 'historical_origin', 'current_status', 'preservation_level'],
  },
}

/** SQL 单引号转义 */
const q = (s) => (s == null ? 'NULL' : `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`)

/** 数组/字符串 → MySQL JSON 字符串字面量 */
const jsonArr = (v) => {
  if (Array.isArray(v)) return q(JSON.stringify(v))
  if (typeof v === 'string') return q(v) // 已是 JSON 字符串
  return q('[]')
}

function buildSql(entries, category, version) {
  const schema = CATEGORY_SCHEMAS[category]
  if (!schema) throw new Error(`未知类别: ${category}`)
  const out = []
  out.push(`-- ${version}: 九城五类数据采集 · ${category} 种子数据（生成自 scripts/gen_cultural_migration.mjs）`)
  out.push('-- 幂等策略: 按 (category,title) 先删后插; detail 表 FK ON DELETE CASCADE 随主行级联删除')
  out.push('-- 数据来源: 见各条目下方注释, 采集于 2026-08; 存疑内容已标（待考）')
  out.push('')

  entries.forEach((e, i) => {
    const title = String(e.title || '').trim()
    const region = String(e.city || e.region || '').trim()
    const tags = e.tags
    const summary = e.summary || ''
    const content = e.content || ''
    if (!title || !region || !content) {
      throw new Error(`第 ${i + 1} 条缺 title/city/content: ${JSON.stringify(e).slice(0, 120)}`)
    }
    out.push(`-- [${i + 1}] ${title}（${region}）来源: ${e.source || '未标注'}`)
    out.push(`DELETE FROM cultural_item WHERE title=${q(title)} AND category=${q(category)};`)
    out.push(
      `INSERT INTO cultural_item (category, title, summary, content, region, tags, sort_order, status, source) VALUES (` +
      `${q(category)}, ${q(title)}, ${q(summary)}, ${q(content)}, ${q(region)}, ${jsonArr(tags)}, 0, 'published', 'manual');`
    )

    // detail 行（若该类别的字段全为空则跳过）
    const detailVals = schema.cols.map((c) => e[c])
    if (detailVals.some((v) => v !== null && v !== undefined && v !== '')) {
      const where = `(SELECT id FROM cultural_item WHERE title=${q(title)} AND category=${q(category)})`
      out.push(
        `INSERT INTO ${schema.table} (item_id, ${schema.cols.join(', ')}) VALUES (` +
        `${where}, ${schema.cols.map((c) => (c === 'difficulty_level' && e[c] != null ? Number(e[c]) : q(e[c]))).join(', ')});`
      )
    }
    out.push('')
  })

  out.push(`-- 校验: SELECT category, region, COUNT(*) FROM cultural_item WHERE category='${category}' GROUP BY region ORDER BY region;`)
  return out.join('\n')
}

function main() {
  const [, , inputArg, category, version] = process.argv
  if (!inputArg || !category || !version) {
    console.error('用法: node scripts/gen_cultural_migration.mjs <输入json> <类别> <V编号>')
    process.exit(1)
  }
  const inputPath = path.resolve(ROOT, inputArg)
  const entries = JSON.parse(readFileSync(inputPath, 'utf8'))
  if (!Array.isArray(entries)) throw new Error('输入 JSON 必须是数组')

  const sql = buildSql(entries, category, version)
  const outName = `${String(version).toLowerCase()}__${category}_seed.sql`
  const outPath = path.join(ROOT, 'scripts', 'output', outName)
  writeFileSync(outPath, sql, 'utf8')
  console.log(`已生成 ${entries.length} 条 → ${outPath}`)
  console.log('请人工核对后再复制为 backend/src/main/resources/db/migration/ 下的正式 migration 并应用。')
}

main()