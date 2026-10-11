/** Shared Result boundary. Transport errors remain the caller's responsibility. */
export function unwrapResult(value) {
  if (!value || typeof value !== 'object' || !('code' in value)) return value
  if (value.code === 200) return 'data' in value ? value.data : value
  const error = new Error(value.message || '请求失败')
  error.code = value.code
  throw error
}

export function parseMediaUrls(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
      value = JSON.parse(trimmed)
    } catch {
      value = trimmed
    }
  }
  const values = Array.isArray(value) ? value : [value]
  return values
    .filter((item) => typeof item === 'string' && item.trim() && item.trim() !== '[]')
    .map((item) => item.trim())
}

export function firstMediaUrl(value) {
  return parseMediaUrls(value)[0] || ''
}
