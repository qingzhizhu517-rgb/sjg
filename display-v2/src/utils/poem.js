// 诗词相关纯函数，跨页面复用。
// 之前 parseTags / firstLine / signature 选取逻辑在 usePoetEnrichment、ShowcasePoetCard、
// PoetDetail、PoemDetail 各有一份副本，算法漂移导致「同一诗人在不同页面显示不同代表句」。
// 统一收敛到此模块。

// 后端 sentimentTags 是 json 字符串（DB json 列经序列化），统一解析为数组
export function parseTags(v) {
  if (!v) return []
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

// 取首句：去空白，按句末标点断句取第一句，限长 16 字
export function firstLine(content) {
  if (!content) return ''
  const clean = String(content).replace(/\s+/g, '')
  const first = clean.split(/[。！？；]/)[0] || clean.slice(0, 16)
  return first.length > 16 ? first.slice(0, 16) + '…' : first
}

// 选代表作：在有正文的诗中取 sentimentTags 最丰富的一首；都没有正文则退回首篇。
// 返回 { id, firstLine, title, sentimentTags }，全站代表句统一用此函数选取。
export function pickSignaturePoem(poems = []) {
  const withContent = poems.filter((p) => p && p.content)
  const sorted = [...withContent].sort(
    (a, b) => parseTags(b?.sentimentTags).length - parseTags(a?.sentimentTags).length,
  )
  const p = sorted[0] || poems[0]
  if (!p) return null
  return {
    id: p.id,
    firstLine: firstLine(p.content),
    title: p.title,
    sentimentTags: parseTags(p.sentimentTags),
  }
}
