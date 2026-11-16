export const cleanParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => (
    value !== '' &&
    value !== null &&
    value !== undefined
  ))
)

export const parseQualityFromRoute = (route = {}) => {
  const quality = route.query?.quality
  if (Array.isArray(quality)) return quality[0] || ''
  return typeof quality === 'string' ? quality : ''
}
