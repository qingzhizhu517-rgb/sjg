// 资源 manifest：构建期扫描 public/media/{real,inkwash}/** 自动生成两风格资源清单。
// 新增素材只需放入目录，不改代码（OSS 同构：bucket 内保持相同相对路径）。
//
// 命名约定：{场景}.{slug}.{real|ink}.{ext}，poster 同名加 -poster 后缀
//   例：hero.map.real.mp4 + hero.map.real-poster.jpg
// 兼容现有命名：hero-map.mp4 / hero-open.mp4 / hero-scroll.png / spots/three_confucius.png
// resolveAsset 的 key 即资源 base 名（去扩展名、去 -poster），如 'hero-map' / 'hero-scroll'。

const OssBase = import.meta.env.VITE_OSS_BUCKET_URL || ''

const realKeys = Object.keys(import.meta.glob('/public/media/real/**/*.{mp4,jpg,jpeg,png,webp}'))
const inkwashKeys = Object.keys(import.meta.glob('/public/media/inkwash/**/*.{mp4,jpg,jpeg,png,webp}'))

const parseEntry = (globKey) => {
  const path = globKey.replace('/public', '') // /media/real/hero-map.mp4
  const file = path.split('/').pop() // hero-map.mp4
  const ext = file.slice(file.lastIndexOf('.') + 1).toLowerCase()
  const fileName = file.slice(0, -ext.length - 1) // hero-map ｜ hero-map-poster
  return {
    fileName,
    ext,
    path,
    url: OssBase + path,
    isVideo: ext === 'mp4',
    isPoster: /-poster$/.test(fileName),
  }
}

// 按 base 名分组：同一资源可能有 视频/图/poster 多 entry
const buildManifest = (keys) => {
  const byBase = {}
  for (const k of keys) {
    const e = parseEntry(k)
    const base = e.fileName.replace(/-poster$/, '')
    if (!byBase[base]) byBase[base] = []
    byBase[base].push(e)
  }
  return byBase
}

export const assetManifest = {
  real: buildManifest(realKeys),
  inkwash: buildManifest(inkwashKeys),
}

// 媒体偏好：real 视频优先（poster 兜底）；inkwash 图优先
const MEDIA_PREF = { real: 'video-first', inkwash: 'image-first' }

/**
 * 按风格解析资源。
 * @param {string} key 资源 base 名，如 'hero-map' / 'hero-scroll'
 * @param {'real'|'inkwash'} theme
 * @returns {{url:string, type:'video'|'image', poster:string|null}|null}
 */
export const resolveAsset = (key, theme) => {
  if (!key) return null
  const manifest = assetManifest[theme] || assetManifest.real
  const entries = manifest[key]
  if (!entries || !entries.length) return null
  const videos = entries.filter((e) => e.isVideo)
  const images = entries.filter((e) => !e.isVideo && !e.isPoster)
  const posters = entries.filter((e) => e.isPoster)
  const poster = posters[0] ? posters[0].url : null
  const pref = MEDIA_PREF[theme] || 'video-first'
  if (pref === 'video-first' && videos.length) {
    return { url: videos[0].url, type: 'video', poster }
  }
  if (images.length) {
    return { url: images[0].url, type: 'image', poster: null }
  }
  if (videos.length) {
    return { url: videos[0].url, type: 'video', poster }
  }
  return null
}
