import fs from 'node:fs/promises'
import path from 'node:path'

const REQUIRED_TABLES = new Map([
  [27, ['source_document', 'content_source_link', 'content_review']],
  [28, ['ai_audit_log']],
  [29, ['learning_task', 'learning_submission']],
])

const DATA_ONLY_MIGRATIONS = new Set([30, 37])
const GUARDED_SCHEMA_MIGRATIONS = new Set([35, 36])

function versionFromFilename(filename) {
  const match = /^V(\d+)__[^/]+\.sql$/i.exec(filename)
  return match ? Number(match[1]) : null
}

export function inspectMigrationText(filename, text, requiredTables = [], options = {}) {
  const version = versionFromFilename(filename)
  const errors = []
  const allowDataOnly = options.allowDataOnly === true
    || (version !== null && DATA_ONLY_MIGRATIONS.has(version))
  if (version === null) errors.push(`文件名不是 Flyway V{n}__*.sql：${filename}`)
  const hasIdempotentTable = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS/i.test(text)
  const inserts = text.replace(/--[^\n]*/g, '').split(';').filter(statement => /\bINSERT\s+INTO\b/i.test(statement))
  const hasGuardedSourceBackfill = version === 37 && inserts.length > 0 && inserts.every(statement =>
    /INSERT\s+INTO\s+(?:source_document|content_source_link)\b/i.test(statement) && /\bNOT\s+EXISTS\b/i.test(statement),
  )
  const hasIdempotentData = /INSERT[\s\S]*ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(text) || hasGuardedSourceBackfill
  const hasGuardedSchema = GUARDED_SCHEMA_MIGRATIONS.has(version)
    && /information_schema\.(?:columns|statistics)/i.test(text)
    && /SET\s+@\w+\s*=\s*IF\s*\(/i.test(text)
    && /PREPARE\s+\w+\s+FROM\s+@\w+/i.test(text)
    && /DEALLOCATE\s+PREPARE/i.test(text)
  if (!hasIdempotentTable && !hasGuardedSchema && !(allowDataOnly && hasIdempotentData)) {
    errors.push(`${filename} 缺少 CREATE TABLE IF NOT EXISTS`)
  }
  if (allowDataOnly && !hasIdempotentTable && !hasIdempotentData) {
    errors.push(`${filename} 数据迁移缺少${version === 37 ? '逐条 NOT EXISTS 来源保护' : ' ON DUPLICATE KEY UPDATE 幂等保护'}`)
  }
  if (/\bDROP\s+(?:TABLE|DATABASE)\b/i.test(text)) {
    errors.push(`${filename} 包含禁止的 DROP 操作`)
  }
  if (version === 37 && /\b(?:DELETE\s+FROM|UPDATE\s+content_review|SET\s+(?:\w+\.)?status\s*=)/i.test(text)) {
    errors.push(`${filename} 来源回填不得删除实体或修改审核状态`)
  }
  for (const table of requiredTables) {
    const tablePattern = new RegExp(
      'CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+(?:`)?' + table + '(?:`)?\\b',
      'i',
    )
    if (!tablePattern.test(text)) errors.push(`${filename} 缺少必备表 ${table}`)
  }
  return { filename, version, errors }
}

export async function inspectMigrationSet(directory, targetVersions = [27, 28, 29, 30, 35, 36, 37]) {
  const entries = await fs.readdir(directory)
  const files = entries.filter((entry) => /^V\d+__.*\.sql$/i.test(entry)).sort()
  const byVersion = new Map()
  const errors = []
  for (const filename of files) {
    const version = versionFromFilename(filename)
    if (byVersion.has(version)) {
      errors.push(`迁移版本重复：V${version}（${byVersion.get(version)} 与 ${filename}）`)
    } else {
      byVersion.set(version, filename)
    }
  }
  const reports = []
  for (const version of targetVersions) {
    const filename = byVersion.get(version)
    if (!filename) {
      errors.push(`缺少目标迁移 V${version}`)
      continue
    }
    const text = await fs.readFile(path.join(directory, filename), 'utf8')
    const report = inspectMigrationText(filename, text, REQUIRED_TABLES.get(version) ?? [], {
      allowDataOnly: DATA_ONLY_MIGRATIONS.has(version),
    })
    reports.push(report)
    errors.push(...report.errors)
  }
  return {
    directory: path.resolve(directory),
    versions: reports.map((report) => report.version),
    reports,
    errors,
  }
}

export { REQUIRED_TABLES }
