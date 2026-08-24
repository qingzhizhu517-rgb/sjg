const EXT_RE = /\.(?:jpe?g|png|webp)$/i

const unique = (values) => [...new Set(values.filter(Boolean))]

const replaceExtension = (path, extension) =>
  EXT_RE.test(path) ? path.replace(EXT_RE, extension) : path

const appendAnime = (path, extension) => {
  if (!EXT_RE.test(path)) return null
  const base = path.replace(EXT_RE, '')
  return `${base}_anime${extension}`
}

export function buildLocalImageCandidates(rawPath, { inkwash = false } = {}) {
  if (!rawPath || typeof rawPath !== 'string' || !rawPath.startsWith('/')) return []

  const candidates = [replaceExtension(rawPath, '.webp'), rawPath]
  if (inkwash && !/_anime\.(?:jpe?g|png|webp)$/i.test(rawPath)) {
    candidates.push(
      appendAnime(rawPath, '.webp'),
      appendAnime(rawPath, '.png'),
      appendAnime(rawPath, '.jpg'),
    )
  }
  return unique(candidates)
}

export function pickExistingImage(rawPath, existingPaths, options) {
  return buildLocalImageCandidates(rawPath, options)
    .find((candidate) => existingPaths.has(candidate)) || null
}

export function firstMediaValue(values) {
  for (const value of values || []) {
    if (typeof value !== 'string' || !value.trim()) continue
    const trimmed = value.trim()
    if (!trimmed.startsWith('[')) return trimmed

    try {
      const parsed = JSON.parse(trimmed)
      if (!Array.isArray(parsed)) continue
      const first = parsed.find((entry) => typeof entry === 'string' && entry.trim())
      if (first) return first.trim()
    } catch {
      continue
    }
  }
  return null
}
