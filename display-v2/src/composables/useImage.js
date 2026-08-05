import { useTheme } from './useTheme'

// 构建期注册 public/images 下本地图（替代硬编码白名单）。
// import.meta.glob 键形如 '/public/images/poets/du_fu.jpg'，归一化为服务路径 '/images/...'。
const _localKeys = Object.keys(import.meta.glob('/public/images/**/*.{jpg,jpeg,png,svg,webp}'))
const localImages = new Set(_localKeys.map(k => k.replace('/public', '')))

// 从 JSON 数组字符串或单值中提取第一个 URL
const parseFirstUrl = (val) => {
  if (!val) return null
  if (typeof val === 'string') {
    // JSON 数组：'["https://oss.../a.jpg", "https://oss.../b.jpg"]'
    if (val.startsWith('[')) {
      try {
        const arr = JSON.parse(val)
        if (Array.isArray(arr)) {
          // 取首个字符串元素，避免非字符串（数字/布尔/对象）导致后续 startsWith 崩溃
          const first = arr.find(x => typeof x === 'string')
          if (first) return first
        }
      } catch { /* fall through */ }
    }
    if (val.startsWith('https://') || val.startsWith('http://')) return val
    if (val.startsWith('/')) return val
  }
  return null
}

// 主题化 SVG 印章占位（首字"文"诗人/城市 · "景"景点），禁用李白图兜底
const getPlaceholder = (isAnime = false, kind = '文') => {
  const bg = isAnime ? '#F4EFE4' : '#FDFAF5'
  const fg = isAnime ? '#A93226' : '#B8860B'
  const seal = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="${bg}"/><rect x="10" y="10" width="220" height="220" fill="none" stroke="${fg}" stroke-width="3"/><text x="120" y="142" text-anchor="middle" font-size="116" font-family="serif" font-weight="700" fill="${fg}">${kind}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(seal)}`
}

// 从路径推断占位首字：景点用"景"，其余（诗人/城市）用"文"
const inferKind = (path) => (path && typeof path === 'string' && path.includes('/spots/')) ? '景' : '文'

export function useImage() {
  const { theme } = useTheme()

  // 校验本地路径存在性 -> 返回服务路径或 null
  const resolveLocal = (rawPath) => {
    if (!rawPath || !rawPath.startsWith('/')) return null
    // 兼容 .png/.jpg 后缀差异
    const candidates = [rawPath, rawPath.replace('.png', '.jpg')]
    for (const c of candidates) if (localImages.has(c)) return c
    return null
  }

  // 新：直读后端双字段，按当前主题挑选（real 默认 / inkwash 取 animeUrl，缺省回退 realUrl）。
  // kind: '文' 诗人·城市 / '景' 景点 -- 占位印章首字。集中调用方重复的双字段选择逻辑，供 P1-3 themeAdapter 调用。
  const resolveImage = (realUrl, animeUrl, kind = '文') => {
    const isAnime = theme.value === 'inkwash'
    const picked = isAnime ? (animeUrl || realUrl) : realUrl
    const parsed = parseFirstUrl(picked)
    if (!parsed) return getPlaceholder(isAnime, kind)
    if (parsed.startsWith('http://') || parsed.startsWith('https://')) return parsed
    return resolveLocal(parsed) || getPlaceholder(isAnime, kind)
  }

  // 旧契约：单 url + isAnime 布尔。保留供未迁移调用方（P1-3 themeAdapter 统一迁移到 resolveImage）。
  // isAnime 用途：① 当传入 real 路径时派生 _anime 本地图（DB 未填 imageAnimeUrl 时的兜底）
  //              ② 决定占位印章风格（real 金色 / inkwash 朱砂）
  const getImageUrl = (url, isAnime = false) => {
    const parsed = parseFirstUrl(url)
    if (!parsed) return getPlaceholder(isAnime, inferKind(url))
    if (parsed.startsWith('http://') || parsed.startsWith('https://')) return parsed
    let localPath = parsed.replace('.png', '.jpg')
    if (isAnime && !localPath.includes('_anime')) {
      localPath = localPath.replace('.jpg', '_anime.jpg')
    }
    if (localImages.has(localPath)) return localPath
    return getPlaceholder(isAnime, inferKind(parsed))
  }

  return { getImageUrl, resolveImage, getPlaceholder }
}
