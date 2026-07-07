import { ref } from 'vue'
import api from '../api'

// 模块级单例缓存：整站只拉一次 /poems，跨页面复用
let _poems = null
let _loading = null

async function loadAllPoems() {
  if (_poems) return _poems
  if (_loading) return _loading
  _loading = (async () => {
    try {
      const res = await api.get('/poems', { params: { page: 1, size: 500 } })
      _poems = (res && (res.records || res)) || []
    } catch (e) {
      console.warn('[usePoetEnrichment] 加载诗词失败', e)
      _poems = []
    }
    _loading = null
    return _poems
  })()
  return _loading
}

// 取首句：去空白，按句末标点断句取第一句，限长 16 字
function firstLine(content) {
  if (!content) return ''
  const clean = String(content).replace(/\s+/g, '')
  const first = clean.split(/[。！？；]/)[0] || clean.slice(0, 16)
  return first.length > 16 ? first.slice(0, 16) + '…' : first
}

// 后端 sentimentTags 是 json 字符串（DB json 列经序列化），统一解析为数组
function parseTags(v) {
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

/**
 * 拉全量诗词，构建 poetId -> { poemCount, signaturePoem } 映射。
 * 用于给诗人卡补「代表句」，弥补 biography / style 普遍为空的数据缺口
 * （130 位诗人仅 7 位有 bio、0 位有 style，否则卡片空洞）。
 *
 * @returns {{ loaded: import('vue').Ref<boolean>, map: import('vue').Ref<object>, build: () => Promise<object>, enrich: (poet: object) => object }}
 */
export function usePoetEnrichment() {
  const loaded = ref(false)
  const map = ref({})

  const build = async () => {
    const poems = await loadAllPoems()
    const m = {}
    poems.forEach((pm) => {
      const pid = pm.poetId
      if (!pid) return
      if (!m[pid]) m[pid] = { poemCount: 0, poems: [] }
      m[pid].poemCount++
      m[pid].poems.push(pm)
    })
    Object.values(m).forEach((e) => {
      const sig = e.poems.find((p) => p && p.content) || e.poems[0]
      e.signaturePoem = sig
        ? {
            id: sig.id,
            title: sig.title,
            firstLine: firstLine(sig.content),
            sentimentTags: parseTags(sig.sentimentTags),
          }
        : null
      delete e.poems // 不留全量，省内存
    })
    map.value = m
    loaded.value = true
    return m
  }

  // 给一位诗人附加补全字段（不污染原对象）
  const enrich = (poet) => {
    if (!poet) return poet
    const e = map.value[poet.id] || {}
    return {
      ...poet,
      poemCount: e.poemCount || 0,
      signaturePoem: e.signaturePoem || null,
    }
  }

  return { loaded, map, build, enrich }
}
