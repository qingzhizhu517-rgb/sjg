import { atlasLink } from '../config/atlasPreview.js'
import { safeReturnPath } from '../config/siteNavigation.js'

const positiveId = value => (typeof value === 'number' || typeof value === 'string')
  && /^[1-9]\d*$/.test(String(value)) && Number.isSafeInteger(Number(value))

// Keep raw query values here; URLSearchParams and Vue Router each handle their own encoding.
export function buildReadingLink({ poem, compare, spot, region, returnTo } = {}, route) {
  const query = new URLSearchParams()
  for (const [key, id] of Object.entries({ poem, compare, spot })) {
    if (positiveId(id)) query.set(key, String(id))
  }
  const city = typeof region === 'string' ? region.trim() : ''
  if (city && city !== '全部') query.set('region', city)
  const back = safeReturnPath(returnTo, '')
  if (back) query.set('returnTo', back)
  const search = query.toString()
  return atlasLink(`/reading${search ? `?${search}` : ''}`, route)
}
