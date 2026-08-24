import { useTheme } from './useTheme'
import { buildLocalImageCandidates, firstMediaValue } from '../utils/imageCandidates'

// 构建期注册 public/images 下本地图（替代硬编码白名单）。
// import.meta.glob 键形如 '/public/images/poets/du_fu.jpg'，归一化为服务路径 '/images/...'。
const _localKeys = Object.keys(import.meta.glob('/public/images/**/*.{jpg,jpeg,png,svg,webp}'))
const localImages = new Set(_localKeys.map(k => k.replace('/public', '')))

// 从 JSON 数组字符串或单值中提取第一个 URL
export const parseFirstUrl = (val) => {
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
  const resolveLocal = (rawPath, options = {}) =>
    buildLocalImageCandidates(rawPath, options)
      .find((candidate) => localImages.has(candidate)) || null

  const resolveFirstImage = (values, kind = '文', options = {}) => {
    const isAnime = theme.value === 'inkwash'
    const { placeholder = true, ...candidateOptions } = options
    const imageOptions = { inkwash: isAnime, ...candidateOptions }
    for (const value of values || []) {
      const parsed = parseFirstUrl(value)
      if (!parsed) continue
      if (parsed.startsWith('http://') || parsed.startsWith('https://')) return parsed
      const local = resolveLocal(parsed, imageOptions)
      if (local) return local
    }
    return placeholder ? getPlaceholder(isAnime, kind) : null
  }

  // 简化版：直接读取单字段，按当前主题选择占位风格
  const resolveImage = (url, kind = '文') => resolveFirstImage([url], kind)

  // 旧契约：单 url + isAnime 布尔。保留供未迁移调用方。
  const getImageUrl = (url, isAnime = false) =>
    resolveFirstImage([url], inferKind(url), { inkwash: isAnime })

  return { getImageUrl, resolveImage, resolveFirstImage, getPlaceholder, firstMediaValue }
}
