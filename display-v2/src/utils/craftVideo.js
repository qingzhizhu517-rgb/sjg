// Only source-owned, reviewed HTTPS media endpoints are used for inline playback.
const MEDIA_HOSTS = new Set(['flv4mp4.people.com.cn'])
function safeUrl(value, media = false) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    if (media && !MEDIA_HOSTS.has(url.hostname)) return null
    return url.href
  } catch { return null }
}
export function resolveVideoPreview(video) {
  const url = safeUrl(video?.url)
  if (!url) return null
  return { ...video, url, mediaUrl: safeUrl(video.mediaUrl, true) }
}
