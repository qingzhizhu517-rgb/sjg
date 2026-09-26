export async function ensureSuccessfulResponse(response, fallbackMessage = '成果同步失败') {
  if (response?.ok) return response
  let message = fallbackMessage
  try {
    const payload = await response?.json?.()
    if (payload && typeof payload.message === 'string' && payload.message.trim()) {
      message = payload.message.trim()
    }
  } catch {
    // 非 JSON 错误响应仍返回统一的用户提示。
  }
  throw new Error(message)
}

export function publicLearningTaskUrl(taskCode) {
  return '/api/public/learning-tasks/' + encodeURIComponent(String(taskCode))
}

export function publicLearningSubmissionUrl(taskCode) {
  return publicLearningTaskUrl(taskCode) + '/submissions'
}

function isRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  try {
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
  } catch {
    return false
  }
}

/**
 * Keep task resource links navigable without allowing script or other custom
 * protocols from editable task content to reach an anchor href.
 */
export function safeLearningResourcePath(value) {
  if (typeof value !== 'string') return ''
  const path = value.trim()
  if (!path || /[\u0000-\u001f\u007f]/.test(path)) return ''
  // Protocol-relative URLs can escape the current origin, so task content
  // must use an explicit HTTP(S) scheme for external references.
  if (/^[\\/]{2}/.test(path)) return ''
  const scheme = path.match(/^[a-z][a-z\d+.-]*:/i)?.[0]
  if (scheme) return /^(?:https?):$/i.test(scheme) && /^https?:\/\//i.test(path) ? path : ''
  return path
}

function safeStorage(storage) {
  if (storage) return storage
  try {
    return globalThis?.localStorage || null
  } catch {
    return null
  }
}

/** Read browser storage without letting privacy-mode/security errors escape. */
export function readLearningStorage(key, storage) {
  try {
    return safeStorage(storage)?.getItem?.(key) ?? null
  } catch {
    return null
  }
}

/** Write browser storage without making task loading or submission fail. */
export function writeLearningStorage(key, value, storage) {
  try {
    const target = safeStorage(storage)
    if (!target?.setItem) return false
    target.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** Keep user-entered answers and AI feedback at the text boundary. */
export function normalizeLearningText(value) {
  return typeof value === 'string' ? value : ''
}

/** Drop malformed map values before they reach a textarea or Markdown parser. */
export function normalizeTextMap(value) {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === 'string'),
  )
}

function finiteNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/** Convert a persisted step value to a safe, zero-based index. */
export function normalizeStepIndex(value, stepCount = Infinity) {
  const parsed = finiteNumber(value)
  let index = parsed === null ? 0 : Math.trunc(parsed)
  index = Math.max(0, index)

  const count = finiteNumber(stepCount)
  if (count !== null) index = Math.min(index, Math.max(0, Math.trunc(count) - 1))
  return index
}

export function buildLearningSubmissionPayload({ sessionKey, answers, currentStep, status } = {}) {
  return {
    sessionKey: normalizeLearningText(sessionKey),
    answersJson: JSON.stringify(normalizeTextMap(answers)),
    currentStep: normalizeStepIndex(currentStep),
    status: normalizeLearningText(status),
  }
}

export function normalizeLearningContent(rawContent) {
  let content = rawContent
  if (typeof rawContent === 'string') {
    try {
      content = JSON.parse(rawContent)
    } catch {
      content = null
    }
  }
  if (!isRecord(content)) return { steps: [], resources: [] }
  return {
    ...content,
    steps: Array.isArray(content.steps)
      ? content.steps.filter(isRecord).map((step) => ({
        ...step,
        type: typeof step.type === 'string' ? step.type.trim().toLowerCase() : '',
        questions: Array.isArray(step.questions) ? step.questions.filter(isRecord) : [],
      }))
      : [],
    resources: Array.isArray(content.resources)
      ? content.resources.filter(isRecord).map((resource) => ({
        ...resource,
        path: safeLearningResourcePath(resource.path),
      }))
      : [],
  }
}

export async function fetchPublicLearningTask(fetcher, taskCode) {
  if (typeof fetcher !== 'function') throw new TypeError('需要提供任务请求函数')
  const response = await fetcher(publicLearningTaskUrl(taskCode))
  await ensureSuccessfulResponse(response, '任务不存在或尚未发布')
  const envelope = await response.json()
  const task = envelope?.data
  if (!isRecord(task)) throw new Error('任务内容为空，暂时无法打开')
  return { task, content: normalizeLearningContent(task.contentJson || '{"steps":[],"resources":[]}') }
}

/**
 * Restore a draft into the shape consumed by LearningTaskView. Unknown fields
 * remain available for forward compatibility, while the three state fields
 * always have safe values.
 */
export function normalizeLearningDraft(draft, stepCount = Infinity) {
  const source = isRecord(draft) ? draft : {}
  return {
    ...source,
    answers: normalizeTextMap(source.answers),
    feedbacks: normalizeTextMap(source.feedbacks),
    currentStep: normalizeStepIndex(source.currentStep, stepCount),
  }
}

/**
 * Parse a locally persisted learning-task draft without allowing corrupt
 * browser storage to interrupt loading the published task.
 */
export function parseLearningDraft(rawDraft) {
  let draft = rawDraft
  if (typeof rawDraft === 'string') {
    try {
      draft = JSON.parse(rawDraft)
    } catch {
      return null
    }
  }
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return null
  const normalized = { ...draft }
  if (Object.prototype.hasOwnProperty.call(normalized, 'answers')) {
    normalized.answers = normalizeTextMap(normalized.answers)
  }
  if (Object.prototype.hasOwnProperty.call(normalized, 'feedbacks')) {
    normalized.feedbacks = normalizeTextMap(normalized.feedbacks)
  }
  if (Object.prototype.hasOwnProperty.call(normalized, 'currentStep')) {
    normalized.currentStep = normalizeStepIndex(normalized.currentStep)
  }
  return normalized
}
