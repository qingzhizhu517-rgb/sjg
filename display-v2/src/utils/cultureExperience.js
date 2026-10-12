const KINDS = new Set(['festival', 'craft', 'story', 'food', 'opera'])
const cleanText = value => typeof value === 'string' ? value.trim() : ''

export function normalizeCultureExperience(value) {
  const data = value && typeof value === 'object' ? value : {}
  return {
    kind: KINDS.has(data.kind) ? data.kind : 'story',
    steps: (Array.isArray(data.steps) ? data.steps : []).filter(step => step && cleanText(step.title)).slice(0, 8).map(step => ({ title: cleanText(step.title), description: cleanText(step.description) })),
    facts: (Array.isArray(data.facts) ? data.facts : []).filter(fact => fact && cleanText(fact.label) && cleanText(fact.value)).slice(0, 8).map(fact => ({ label: cleanText(fact.label), value: cleanText(fact.value) })),
  }
}
