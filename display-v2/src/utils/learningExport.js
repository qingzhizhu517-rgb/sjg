import { resourcesForQuestion } from './learningEvidence.js'

const normalizeType = (type) => {
  const value = String(type || '').trim().toLowerCase()
  return value === 'spot' ? 'scenic_spot' : value
}

const positiveIds = (values) => [...new Set(
  (Array.isArray(values) ? values : [])
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0),
)]

const text = (value, fallback = '') => {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

const singleLine = (value, fallback = '') => text(value, fallback).replace(/[\r\n]+/g, ' ')

function entityRefsForQuestion(question = {}) {
  if (Array.isArray(question.entityRefs) && question.entityRefs.length) {
    return question.entityRefs
      .map((ref) => ({ type: normalizeType(ref?.type), id: Number(ref?.id) }))
      .filter((ref) => ref.type && Number.isInteger(ref.id) && ref.id > 0)
  }
  const type = normalizeType(question.entityType)
  return type && Array.isArray(question.entityIds)
    ? question.entityIds
      .map((id) => ({ type, id: Number(id) }))
      .filter((ref) => Number.isInteger(ref.id) && ref.id > 0)
    : []
}

function matchedSourceIds(question, resource) {
  const questionSources = new Set(positiveIds(question?.sourceIds))
  return positiveIds(resource?.sourceIds).filter((id) => questionSources.has(id))
}

/**
 * Build a portable Markdown record with question-level provenance.
 * Resource source IDs are intersected with the question source IDs so a
 * shared resource cannot leak unrelated provenance into an answer export.
 */
export function buildLearningExportMarkdown({
  task = {},
  steps = [],
  resources = [],
  answers = {},
  feedbacks = {},
} = {}) {
  const safeSteps = Array.isArray(steps) ? steps : []
  const safeResources = Array.isArray(resources) ? resources : []
  const answerMap = answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {}
  const feedbackMap = feedbacks && typeof feedbacks === 'object' && !Array.isArray(feedbacks) ? feedbacks : {}
  const lines = [
    `# ${singleLine(task.title, '诗词探究任务')}`,
    '',
    text(task.goal),
    task.taskCode ? `任务代码：${singleLine(task.taskCode)}` : '',
    '',
    '## 逐题成果与追溯',
    '',
  ]

  safeSteps.forEach((step, stepIndex) => {
    lines.push(`## ${stepIndex + 1}. ${singleLine(step?.title || step?.type, '学习步骤')}`, '')
    ;(Array.isArray(step?.questions) ? step.questions : []).forEach((question) => {
      const refs = entityRefsForQuestion(question)
      const sourceIds = positiveIds(question?.sourceIds)
      const matched = resourcesForQuestion(question, safeResources)
      lines.push(
        `### ${singleLine(question?.prompt, '未命名问题')}`,
        '',
        `- 题目 ID：${singleLine(question?.id, '未声明')}`,
        `- 绑定实体：${refs.length ? refs.map((ref) => `${ref.type}#${ref.id}`).join('、') : '未声明'}`,
        `- 绑定来源：${sourceIds.length ? sourceIds.join('、') : '未声明'}`,
        '- 题目材料：',
      )
      if (matched.length) {
        matched.forEach((resource) => {
          const resourceSources = matchedSourceIds(question, resource)
          const sourceLabel = resourceSources.length ? `（来源：${resourceSources.join('、')}）` : ''
          lines.push(`  - ${singleLine(resource?.title, '未命名材料')}：${singleLine(resource?.snippet, '暂无摘要')}${sourceLabel}`)
        })
      } else {
        lines[lines.length - 1] = '- 题目材料：未匹配到专属材料；请回到已发布来源核对。'
      }
      lines.push(
        '',
        '**我的回答**',
        '',
        text(answerMap[question?.id], '（未填写）'),
      )
      if (text(feedbackMap[question?.id])) {
        lines.push('', '**AI 反馈**', '', String(feedbackMap[question.id]))
      }
      lines.push('')
    })
  })

  return lines.join('\n')
}
