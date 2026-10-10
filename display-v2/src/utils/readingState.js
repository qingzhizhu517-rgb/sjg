import { NINE_CITIES } from '../config/nineCities.js'
import { normalizeSourceEntries } from './source.js'

const text = value => typeof value === 'string' ? value.trim() : ''
export const positiveReadingId = value => {
  if ((typeof value !== 'string' && typeof value !== 'number') || !/^[1-9]\d*$/.test(String(value))) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}
export function parseReadingQuery(query = {}) {
  let returnTo = typeof query.returnTo === 'string' ? query.returnTo : '/poems'
  try {
    const decoded = decodeURIComponent(returnTo)
    if (!decoded.startsWith('/') || decoded.startsWith('//') || /[\\\u0000-\u0020]/.test(decoded)) returnTo = '/poems'
  } catch { returnTo = '/poems' }
  return {
    poem: positiveReadingId(query.poem), compare: positiveReadingId(query.compare),
    region: NINE_CITIES.includes(query.region) ? query.region : '',
    spot: positiveReadingId(query.spot), returnTo,
  }
}
export function normalizeReadingLines(content) {
  if (typeof content !== 'string') return []
  return content.replace(/\r\n?/g, '\n').split('\n').map(line => line.trim()).filter(Boolean)
    .map((line, index) => ({ number: index + 1, text: line }))
}
export function normalizeReadingMaterial(detail, label) {
  const poem = detail?.poem
  const id = positiveReadingId(poem?.id)
  const lines = normalizeReadingLines(poem?.content)
  if (!id || !lines.length) return null
  return { id, label, title: text(poem.title) || '未题名作品', author: text(detail.poet?.name) || text(poem.poetName),
    dynasty: text(detail.dynasty?.name) || text(poem.dynastyName), form: text(poem.form),
    lines, sources: normalizeSourceEntries(detail.sources) }
}
export const readingPairKey = materials => materials?.length === 2 && materials.every(material => positiveReadingId(material?.id))
  ? `sjg-reading:v1:${materials[0].id}:${materials[1].id}` : ''
export function findReadingReference(label, number, materials = []) {
  if (!['A', 'B'].includes(label) || !Number.isSafeInteger(Number(number)) || Number(number) < 1) return null
  const line = materials.find(material => material?.label === label)?.lines?.find(line => line.number === Number(number))
  return line ? { label, number: line.number, text: line.text } : null
}
export function readReadingDraft(storage, key, materials) {
  let raw
  try { raw = storage?.getItem(key) } catch { return { status: 'unavailable', draft: null } }
  if (!storage) return { status: 'unavailable', draft: null }
  if (!raw) return { status: 'empty', draft: null }
  try {
    const value = JSON.parse(raw)
    if (value?.version !== 1 || typeof value.answer !== 'string' || value.answer.length > 3000 || !Array.isArray(value.selected)) throw new Error('invalid')
    let changedEvidence = false
    const selected = value.selected.map(item => {
      const reference = findReadingReference(item?.label, item?.number, materials)
      if (!reference || typeof item?.text !== 'string' || item.text !== reference.text) { changedEvidence = true; return null }
      return reference
    }).filter(Boolean)
      .filter((item, index, all) => all.findIndex(other => other.label === item.label && other.number === item.number) === index)
    return { status: 'restored', changedEvidence, draft: { answer: value.answer, selected } }
  } catch { return { status: 'corrupt', draft: null } }
}
export function saveReadingDraft(storage, key, draft) {
  try {
    if (!storage || !key) return false
    storage.setItem(key, JSON.stringify({ version: 1, answer: draft.answer, selected: draft.selected.map(({ label, number, text }) => ({ label, number, text })) }))
    return true
  } catch { return false }
}
export function mergeReadingSources(materials) {
  const merged = new Map()
  for (const material of materials.filter(Boolean)) {
    for (const source of normalizeSourceEntries(material.sources)) {
      const key = JSON.stringify([source.sourceId, source.title, source.url, source.locator, source.citation, source.quote])
      const note = `材料 ${material.label}《${material.title}》${source.note ? `：${source.note}` : ''}`
      if (merged.has(key)) merged.get(key).note += `；${note}`
      else merged.set(key, { ...source, note })
    }
  }
  return [...merged.values()]
}
export function getReadingStorage() {
  try { return globalThis.localStorage || null } catch { return null }
}
