const normalizeType = (type) => {
  const value = String(type || '').trim().toLowerCase()
  return value === 'spot' ? 'scenic_spot' : value
}

const questionEntityKeys = (question = {}) => {
  const refs = Array.isArray(question.entityRefs) && question.entityRefs.length
    ? question.entityRefs
    : (Array.isArray(question.entityIds)
        ? question.entityIds.map((id) => ({ type: question.entityType, id }))
        : [])
  return new Set(
    refs
      .map((ref) => {
        const id = Number(ref?.id)
        const type = normalizeType(ref?.type)
        return Number.isInteger(id) && id > 0 && type ? `${type}:${id}` : null
      })
      .filter(Boolean),
  )
}

const resourceEntityKey = (resource) => {
  const id = Number(resource?.entityId)
  const type = normalizeType(resource?.entityType)
  return Number.isInteger(id) && id > 0 && type ? `${type}:${id}` : ''
}

const sourceSet = (values) => new Set(
  (Array.isArray(values) ? values : [])
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0),
)

/**
 * Return only materials explicitly bound to a question.
 * Both the entity binding and source binding are required when present;
 * this prevents unrelated task materials from being sent to the feedback model.
 */
export function resourcesForQuestion(question = {}, resources = []) {
  const entities = questionEntityKeys(question)
  const sources = sourceSet(question.sourceIds)
  if (!entities.size || !sources.size) return []

  return (Array.isArray(resources) ? resources : []).filter((resource) => {
    const entityMatches = entities.has(resourceEntityKey(resource))
    const resourceSources = sourceSet(resource?.sourceIds)
    const sourceMatches = [...sources].some((id) => resourceSources.has(id))
    return entityMatches && sourceMatches
  })
}

export function formatEvidenceForQuestion(question = {}, resources = []) {
  const matched = resourcesForQuestion(question, resources)
  if (!matched.length) return '未匹配到专属材料；请不要补写未在任务材料中出现的事实。'
  return matched
    .map((resource) => {
      const sourceIds = Array.isArray(resource.sourceIds) && resource.sourceIds.length
        ? `（来源：${resource.sourceIds.join('、')}）`
        : ''
      return `${resource.title || '未命名材料'}：${resource.snippet || '暂无摘要'}${sourceIds}`
    })
    .join('\n')
}

