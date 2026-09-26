const textOf = (value) => (typeof value === 'string' ? value.trim() : '')

export function safeSourceUrl(value) {
  const candidate = textOf(value)
  if (!/^https?:\/\/[^/?#\\\s]/i.test(candidate) || /[\\\s]/.test(candidate)) return ''

  try {
    const parsed = new URL(candidate)
    if (!['http:', 'https:'].includes(parsed.protocol)) return ''
    if (!parsed.hostname || parsed.username || parsed.password) return ''
    return parsed.href
  } catch {
    return ''
  }
}

export function normalizeSourceEntries(sources) {
  if (!Array.isArray(sources)) return []

  return sources
    .filter((source) => source && typeof source === 'object' && !Array.isArray(source))
    .map((source) => {
      const publicationYear = Number.isInteger(source.publicationYear)
        ? source.publicationYear
        : textOf(source.publicationYear)

      return {
        sourceId: source.sourceId ?? null,
        title: textOf(source.title),
        authorOrg: textOf(source.authorOrg),
        publicationYear,
        url: safeSourceUrl(source.url),
        citation: textOf(source.citation),
        locator: textOf(source.locator),
        quote: textOf(source.quote),
        note: textOf(source.note),
        reviewStatus: textOf(source.reviewStatus),
      }
    })
    .filter((source) =>
      Boolean(
        source.title ||
        source.authorOrg ||
        source.publicationYear !== '' ||
        source.url ||
        source.citation ||
        source.locator ||
        source.quote ||
        source.note,
      ),
    )
}
