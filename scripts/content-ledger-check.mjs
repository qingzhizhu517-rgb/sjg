import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REQUIRED_COLUMNS = Object.freeze([
  'source_key', 'entity_type', 'entity_id', 'entity_name', 'title', 'author_or_org',
  'publication_year', 'identifier', 'url_or_catalog', 'locator', 'rights_note',
  'review_status', 'reviewer', 'reviewed_at', 'notes',
])

const SUPPORTED_ENTITY_TYPES = new Set([
  'poet', 'poem', 'scenic_spot', 'spot', 'cultural_item', 'event',
  'dynasty', 'timeline', 'poem_analysis', 'poet_relation', 'relation',
])
const REVIEW_STATUSES = new Set(['draft', 'needs_review', 'approved', 'published', 'archived'])
const PLACEHOLDER_PATTERN = /(待填写|待查询|待选择|替换为|TODO|placeholder)/i

/**
 * Parse a small RFC 4180-compatible CSV without treating commas in quoted
 * titles or notes as column separators.
 */
export function parseCsv(text) {
  const input = String(text ?? '').replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    if (row.some((value) => value.trim() !== '')) rows.push(row)
    row = []
  }

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]
    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        field += character
      }
      continue
    }
    if (character === '"' && field.length === 0) {
      quoted = true
    } else if (character === ',') {
      pushField()
    } else if (character === '\n') {
      pushRow()
    } else if (character === '\r') {
      if (input[index + 1] !== '\n') pushRow()
    } else {
      field += character
    }
  }
  if (quoted) throw new Error('CSV 包含未闭合的引号')
  if (field.length > 0 || row.length > 0) pushRow()
  if (rows.length === 0) return []

  const headers = rows.shift().map((header) => header.trim())
  if (headers.some((header) => !header)) throw new Error('CSV 表头不能包含空列名')
  if (new Set(headers).size !== headers.length) throw new Error('CSV 表头不能重复')
  return rows.map((values, rowIndex) => {
    const record = {}
    headers.forEach((header, columnIndex) => {
      record[header] = String(values[columnIndex] ?? '').trim()
    })
    if (values.length > headers.length) {
      throw new Error(`CSV 第 ${rowIndex + 2} 行包含多余列`)
    }
    return record
  })
}

function addIssue(issues, rowIndex, message) {
  issues.push({ path: `rows[${rowIndex}]`, message })
}

function normalizedType(value) {
  const type = String(value ?? '').trim().toLowerCase()
  return type === 'spot' ? 'scenic_spot' : type === 'relation' ? 'poet_relation' : type
}

function positiveId(value) {
  return /^[1-9]\d*$/.test(String(value ?? '').trim())
}

function entityKey(type, id) {
  const normalized = normalizedType(type)
  if (!SUPPORTED_ENTITY_TYPES.has(normalized) || !positiveId(id)) return null
  return `${normalized}:${String(id).trim()}`
}

function inspectPlaceholders(record, rowIndex, issues) {
  Object.entries(record).forEach(([key, value]) => {
    if (typeof value === 'string' && PLACEHOLDER_PATTERN.test(value)) {
      addIssue(issues, rowIndex, `${key} 包含未替换的占位文本`)
    }
  })
}

function taskEntityKeys(task) {
  const keys = new Set()
  const addRef = (ref) => {
    const key = entityKey(ref?.type, ref?.id)
    if (key) keys.add(key)
  }
  const addQuestion = (question) => {
    if (!question || typeof question !== 'object') return
    if (Array.isArray(question.entityRefs) && question.entityRefs.length > 0) {
      question.entityRefs.forEach(addRef)
      return
    }
    const ids = Array.isArray(question.entityIds) ? question.entityIds : []
    ids.forEach((id) => addRef({ type: question.entityType, id }))
  }
  const resources = Array.isArray(task?.resources) ? task.resources : []
  resources.forEach(addRef)
  const steps = Array.isArray(task?.steps) ? task.steps : []
  steps.forEach((step) => {
    const questions = Array.isArray(step?.questions) ? step.questions : []
    questions.forEach(addQuestion)
  })
  return keys
}

export function validateSourceLedger(rows, {
  task = null,
  rejectPlaceholders = true,
  requirePublished = false,
  requireFirstTaskScope = false,
} = {}) {
  const issues = []
  if (!Array.isArray(rows) || rows.length === 0) {
    return [{ path: '$', message: '来源台账至少需要一行记录' }]
  }

  const first = rows[0] ?? {}
  REQUIRED_COLUMNS.forEach((column) => {
    if (!Object.prototype.hasOwnProperty.call(first, column)) {
      issues.push({ path: '$', message: `来源台账缺少必需列：${column}` })
    }
  })
  if (issues.some((item) => item.path === '$')) return issues

  const sourceKeys = new Set()
  const entityKeys = new Set()
  const entityCounts = new Map()

  rows.forEach((record, index) => {
    const rowIndex = index + 2
    const sourceKey = String(record.source_key ?? '').trim()
    if (!sourceKey) addIssue(issues, rowIndex, 'source_key 不能为空')
    else if (sourceKeys.has(sourceKey)) addIssue(issues, rowIndex, 'source_key 必须唯一')
    else sourceKeys.add(sourceKey)

    const type = normalizedType(record.entity_type)
    if (!SUPPORTED_ENTITY_TYPES.has(type)) addIssue(issues, rowIndex, `实体类型不受支持：${record.entity_type || '空'}`)
    if (!positiveId(record.entity_id)) addIssue(issues, rowIndex, 'entity_id 必须是正整数')
    const key = entityKey(type, record.entity_id)
    if (key) {
      entityKeys.add(key)
      entityCounts.set(type, (entityCounts.get(type) ?? 0) + 1)
    }

    for (const [field, label] of [
      ['entity_name', '实体名称'],
      ['title', '来源标题'],
      ['author_or_org', '作者/机构'],
      ['locator', '定位信息'],
      ['rights_note', '版权说明'],
      ['reviewer', '审核人'],
      ['reviewed_at', '审核时间'],
    ]) {
      if (!String(record[field] ?? '').trim()) addIssue(issues, rowIndex, `${label}不能为空`)
    }

    const year = String(record.publication_year ?? '').trim()
    if (!/^\d{4}$/.test(year)) addIssue(issues, rowIndex, '出版年份必须是四位数字')
    if (!String(record.identifier ?? '').trim() && !String(record.url_or_catalog ?? '').trim()) {
      addIssue(issues, rowIndex, '必须填写标识或 URL/馆藏信息之一')
    }

    const status = String(record.review_status ?? '').trim().toLowerCase()
    if (!REVIEW_STATUSES.has(status)) addIssue(issues, rowIndex, `审核状态不受支持：${status || '空'}`)
    if (requirePublished && status !== 'published') {
      addIssue(issues, rowIndex, '正式交付台账的审核状态必须为 published')
    }
    if (rejectPlaceholders) inspectPlaceholders(record, rowIndex, issues)
  })

  if (requireFirstTaskScope) {
    for (const [type, minimum, label] of [
      ['poem', 3, 'poem'],
      ['scenic_spot', 3, 'scenic_spot'],
      ['timeline', 1, 'timeline'],
    ]) {
      if ((entityCounts.get(type) ?? 0) < minimum) {
        issues.push({ path: '$', message: `首批一城一课至少需要 ${minimum} 个 ${label} 实体` })
      }
    }
  }

  if (task) {
    taskEntityKeys(task).forEach((key) => {
      if (!entityKeys.has(key)) {
        issues.push({ path: '$.task', message: `任务引用的实体未出现在来源台账：${key}` })
      }
    })
  }
  return issues
}

export function formatIssues(issues) {
  return issues.map(({ path: pathName, message }) => `${pathName || '$'}: ${message}`).join('\n')
}

function option(name, fallback = null) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : fallback
}

async function main() {
  const ledgerPath = process.argv[2] || 'docs/content/first-task-source-ledger.csv'
  const taskPath = option('--task')
  const allowTemplate = process.argv.includes('--allow-template')
  const requireFirstTaskScope = process.argv.includes('--require-first-task-scope')
  const rows = parseCsv(await fs.readFile(ledgerPath, 'utf8'))
  const task = taskPath ? JSON.parse(await fs.readFile(taskPath, 'utf8')) : null
  const issues = validateSourceLedger(rows, {
    task,
    rejectPlaceholders: !allowTemplate,
    requirePublished: !allowTemplate,
    requireFirstTaskScope,
  })
  if (issues.length > 0) {
    console.error(`来源台账检查失败：${path.resolve(ledgerPath)}`)
    console.error(formatIssues(issues))
    process.exitCode = 1
    return
  }
  console.log(`来源台账检查通过：${path.resolve(ledgerPath)}（${rows.length} 行）`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`来源台账检查无法执行：${error.message}`)
    process.exitCode = 1
  })
}
