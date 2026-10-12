import catalog from '../content/culture/enrichment.json' with { type: 'json' }
import { safeSourceUrl } from './source.js'

const normalize = value => String(value || '').trim().replace(/\s+/g, '').replace(/[（]/g, '(').replace(/[）]/g, ')')
const keyOf = item => `${item?.category || ''}:${normalize(item?.title)}`
const profiles = new Map(catalog.entries.map(entry => [keyOf(entry), entry]))

// Bind only to an already loaded item: this never creates public content or hides API failures.
export function getCultureEnrichment(item) {
  if (!item || item.category === 'poem') return null
  return profiles.get(keyOf(item)) || null
}

export function mergeCultureSources(existing, supplement) {
  const seen = new Set()
  return [...(Array.isArray(existing) ? existing : []), ...(supplement?.sources || [])]
    .filter(source => {
      const url = safeSourceUrl(source?.url)
      const key = url || `${source?.sourceId || ''}:${source?.title || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function cultureMedia(profile) {
  return (profile?.media || []).filter(media => safeSourceUrl(media?.url))
}

export function culturePreviewImage(profile) {
  for (const asset of profile?.realAssets || []) {
    if (asset.inlineVerified !== true) continue
    const url = safeSourceUrl(asset.kind === 'image' ? asset.url : asset.poster)
    if (url?.startsWith('https://')) return url
  }
  return null
}

export function cultureExperienceLabel(profile) {
  if (profile?.realAssets?.some(asset => asset.kind === 'video' && asset.inlineVerified)) return '视频实录'
  if (profile?.realAssets?.some(asset => asset.kind === 'image' && asset.inlineVerified)) return '作品与现场'
  if (profile?.media?.some(asset => asset.kind === 'video')) return '视频原页'
  return '文化资料'
}
