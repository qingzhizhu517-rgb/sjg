// A display convention, not a trained model or an objective sentiment measurement.
const EMOTION_SCORES = Object.freeze({
  豪放: 92, 壮阔: 88, 激昂: 86, 边塞: 84, 豁达: 80, 悠远: 72, 悠逸: 72,
  清新: 66, 闲适: 56, 怀古: 58, 写景: 55, 哲理: 50, 淡泊: 48,
  婉约: 40, 惜别: 32, 幽思: 26, 思乡: 24, 悲凉: 16, 孤寂: 14,
})

export function parseEmotionTags(value) {
  let tags = value
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags) } catch { tags = tags.split(/[,，、]/) }
  }
  return Array.isArray(tags)
    ? [...new Set(tags.filter((tag) => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean))]
    : []
}

export function poemEmotionScore(poem) {
  const values = parseEmotionTags(poem?.sentimentTags)
    .map((tag) => EMOTION_SCORES[tag])
    .filter((value) => Number.isFinite(value))
  // Missing or unrecognised tags must remain a gap rather than inventing a score.
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

export function summarizePoemEmotions(poems = []) {
  const counts = new Map()
  let taggedCount = 0
  let scoredCount = 0
  let scoreSum = 0
  for (const poem of poems) {
    const tags = parseEmotionTags(poem?.sentimentTags)
    if (tags.length) taggedCount += 1
    tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1))
    const score = poemEmotionScore(poem)
    if (score !== null) {
      scoredCount += 1
      scoreSum += score
    }
  }
  const tagCount = [...counts.values()].reduce((sum, count) => sum + count, 0)
  return {
    sampleCount: poems.length,
    taggedCount,
    scoredCount,
    meanScore: scoredCount ? scoreSum / scoredCount : null,
    tagCount,
    tags: [...counts].map(([name, count]) => ({ name, count, percent: Math.round(count / tagCount * 100) }))
      .sort((a, b) => b.count - a.count),
  }
}
