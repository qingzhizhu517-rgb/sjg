import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SUPPORTED_ENTITY_TYPES = new Set([
  'poet', 'poem', 'spot', 'scenic_spot', 'cultural_item', 'event',
])
const STEP_TYPES = new Set(['evidence', 'compare', 'reflection'])
const PLACEHOLDER_PATTERN = /(替换为|待填写|TODO|placeholder)/i

function issue(issues, pathName, message) {
  issues.push({ path: pathName, message })
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0
}

function inspectPlaceholders(value, pathName, issues) {
  if (typeof value === 'string' && PLACEHOLDER_PATTERN.test(value)) {
    issue(issues, pathName, '包含未替换的占位文本')
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectPlaceholders(item, `${pathName}[${index}]`, issues))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      inspectPlaceholders(item, pathName ? `${pathName}.${key}` : key, issues)
    })
  }
}

function validateSourceIds(value, pathName, issues) {
  if (!Array.isArray(value) || value.length === 0) {
    issue(issues, pathName, '必须绑定至少一个来源 ID')
    return
  }
  value.forEach((sourceId, index) => {
    if (!isPositiveInteger(sourceId)) issue(issues, `${pathName}[${index}]`, '来源 ID 必须是正整数')
  })
}

function validateEntityRef(ref, pathName, issues) {
  if (!ref || typeof ref !== 'object') {
    issue(issues, pathName, '实体引用必须是对象')
    return false
  }
  const type = String(ref.type ?? '').trim().toLowerCase()
  if (!SUPPORTED_ENTITY_TYPES.has(type)) {
    issue(issues, `${pathName}.type`, `不支持的实体类型：${type || '空'}`)
  }
  if (!isPositiveInteger(ref.id)) {
    issue(issues, `${pathName}.id`, '实体 ID 必须是正整数')
  }
  return SUPPORTED_ENTITY_TYPES.has(type) && isPositiveInteger(ref.id)
}

function normalizeEntityType(type) {
  const normalized = String(type ?? '').trim().toLowerCase()
  return normalized === 'spot' ? 'scenic_spot' : normalized
}

function questionEntityKeys(question) {
  const keys = new Set()
  if (!question || typeof question !== 'object') return keys

  if (Array.isArray(question.entityRefs) && question.entityRefs.length > 0) {
    question.entityRefs.forEach((ref) => {
      const type = normalizeEntityType(ref?.type)
      if (SUPPORTED_ENTITY_TYPES.has(type) && isPositiveInteger(ref?.id)) {
        keys.add(`${type}:${ref.id}`)
      }
    })
    return keys
  }

  const type = normalizeEntityType(question.entityType)
  if (!SUPPORTED_ENTITY_TYPES.has(type) || !Array.isArray(question.entityIds)) return keys
  question.entityIds.forEach((entityId) => {
    if (isPositiveInteger(entityId)) keys.add(`${type}:${entityId}`)
  })
  return keys
}

function sourceIds(values) {
  return new Set((Array.isArray(values) ? values : []).filter(isPositiveInteger))
}

function resourceEntityKey(resource) {
  const type = normalizeEntityType(resource?.entityType)
  if (!SUPPORTED_ENTITY_TYPES.has(type) || !isPositiveInteger(resource?.entityId)) return null
  return `${type}:${resource.entityId}`
}

function validateQuestionResourceCoverage(question, pathName, resources, issues) {
  const questionEntities = questionEntityKeys(question)
  const questionSources = sourceIds(question?.sourceIds)
  if (questionEntities.size === 0 || questionSources.size === 0) return

  const coveredEntities = new Set()
  const coveredSources = new Set()
  ;(Array.isArray(resources) ? resources : []).forEach((resource) => {
    const entityKey = resourceEntityKey(resource)
    if (!entityKey || !questionEntities.has(entityKey)) return

    const matchingSources = sourceIds(resource.sourceIds)
    matchingSources.forEach((sourceId) => {
      if (questionSources.has(sourceId)) {
        coveredEntities.add(entityKey)
        coveredSources.add(sourceId)
      }
    })
  })

  const missingEntities = [...questionEntities].filter((entityKey) => !coveredEntities.has(entityKey))
  if (missingEntities.length > 0) {
    issue(issues, pathName, `题目实体缺少匹配资源：${missingEntities.join('、')}`)
  }

  const missingSources = [...questionSources].filter((sourceId) => !coveredSources.has(sourceId))
  if (missingSources.length > 0) {
    issue(issues, pathName, `题目来源缺少匹配资源：${missingSources.join('、')}`)
  }
}

function validateQuestion(question, pathName, stepType, issues) {
  if (!question || typeof question !== 'object') {
    issue(issues, pathName, '问题必须是对象')
    return
  }
  if (!String(question.prompt ?? '').trim()) issue(issues, `${pathName}.prompt`, '问题必须填写 prompt')

  const entityKeys = new Set()
  if (Array.isArray(question.entityRefs) && question.entityRefs.length > 0) {
    question.entityRefs.forEach((ref, index) => {
      if (validateEntityRef(ref, `${pathName}.entityRefs[${index}]`, issues)) {
        entityKeys.add(`${normalizeEntityType(ref.type)}:${ref.id}`)
      }
    })
  } else {
    const type = normalizeEntityType(question.entityType)
    if (!SUPPORTED_ENTITY_TYPES.has(type)) {
      issue(issues, `${pathName}.entityType`, '必须填写支持的 entityType，或使用 entityRefs')
    }
    if (!Array.isArray(question.entityIds) || question.entityIds.length === 0) {
      issue(issues, `${pathName}.entityIds`, '必须绑定至少一个实体 ID')
    } else {
      question.entityIds.forEach((entityId, index) => {
        if (!isPositiveInteger(entityId)) issue(issues, `${pathName}.entityIds[${index}]`, '实体 ID 必须是正整数')
        else if (SUPPORTED_ENTITY_TYPES.has(type)) entityKeys.add(`${type}:${entityId}`)
      })
    }
  }

  validateSourceIds(question.sourceIds, `${pathName}.sourceIds`, issues)
  if (stepType === 'compare'
    && Array.isArray(question.sourceIds)
    && new Set(question.sourceIds.map((sourceId) => String(sourceId))).size < 2) {
    issue(issues, pathName, 'compare 问题至少需要绑定两个不同来源')
  }
  if (stepType === 'compare' && entityKeys.size < 2) {
    issue(issues, pathName, 'compare 问题至少需要引用两个实体')
  }
}

function validateQuestionId(question, pathName, seenQuestionIds, issues) {
  if (!question || typeof question !== 'object' || Array.isArray(question)) return
  const id = String(question.id ?? '').trim()
  if (!id) {
    issue(issues, `${pathName}.id`, '题目 ID 不能为空')
    return
  }
  if (seenQuestionIds.has(id)) {
    issue(issues, `${pathName}.id`, `题目 ID 必须在任务内唯一：${id}`)
    return
  }
  seenQuestionIds.add(id)
}

function validateResource(resource, pathName, issues) {
  if (!resource || typeof resource !== 'object') {
    issue(issues, pathName, '证据资源必须是对象')
    return
  }
  const type = String(resource.entityType ?? '').trim().toLowerCase()
  if (!SUPPORTED_ENTITY_TYPES.has(type)) issue(issues, `${pathName}.entityType`, '证据资源实体类型不受支持')
  if (!isPositiveInteger(resource.entityId)) issue(issues, `${pathName}.entityId`, '证据资源 entityId 必须是正整数')
  if (!String(resource.title ?? '').trim()) issue(issues, `${pathName}.title`, '证据资源必须有标题')
  if (!String(resource.snippet ?? '').trim()) issue(issues, `${pathName}.snippet`, '证据资源必须有摘要')
  validateSourceIds(resource.sourceIds, `${pathName}.sourceIds`, issues)
}

export function validateLearningTask(task, { rejectPlaceholders = true } = {}) {
  const issues = []
  if (!task || typeof task !== 'object' || Array.isArray(task)) {
    return [{ path: '$', message: '任务内容必须是 JSON 对象' }]
  }
  if (!Array.isArray(task.resources) || task.resources.length === 0) {
    issue(issues, 'resources', '任务至少需要一个证据资源')
  } else {
    task.resources.forEach((resource, index) => validateResource(resource, `resources[${index}]`, issues))
  }

  if (!Array.isArray(task.steps) || task.steps.length !== 3) {
    issue(issues, 'steps', '任务必须包含 evidence、compare、reflection 三个步骤')
  } else {
    const seenTypes = new Set()
    const seenQuestionIds = new Set()
    task.steps.forEach((step, index) => {
      const stepPath = `steps[${index}]`
      const type = String(step?.type ?? '').trim().toLowerCase()
      if (!STEP_TYPES.has(type) || seenTypes.has(type)) {
        issue(issues, 'steps', '步骤类型必须各出现一次：evidence/compare/reflection')
      }
      seenTypes.add(type)
      if (!Array.isArray(step?.questions) || step.questions.length === 0) {
        issue(issues, `${stepPath}.questions`, '每个步骤至少需要一个问题')
      } else {
        step.questions.forEach((question, questionIndex) => {
          const questionPath = `${stepPath}.questions[${questionIndex}]`
          validateQuestionId(question, questionPath, seenQuestionIds, issues)
          validateQuestion(question, questionPath, type, issues)
          validateQuestionResourceCoverage(question, questionPath, task.resources, issues)
        })
      }
    })
  }

  if (rejectPlaceholders) inspectPlaceholders(task, '', issues)
  return issues
}

export function formatIssues(issues) {
  return issues.map(({ path: pathName, message }) => `${pathName || '$'}: ${message}`).join('\n')
}

async function main() {
  const filePath = process.argv[2] || 'docs/learning-task-example.json'
  const allowTemplate = process.argv.includes('--allow-template')
  const raw = await fs.readFile(filePath, 'utf8')
  const task = JSON.parse(raw)
  const issues = validateLearningTask(task, { rejectPlaceholders: !allowTemplate })
  if (issues.length > 0) {
    console.error(`学习任务检查失败：${path.resolve(filePath)}`)
    console.error(formatIssues(issues))
    process.exitCode = 1
    return
  }
  console.log(`学习任务检查通过：${path.resolve(filePath)}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`学习任务检查无法执行：${error.message}`)
    process.exitCode = 1
  })
}
