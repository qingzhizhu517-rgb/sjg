import { ref } from 'vue'
import api from '../api'
import { pickSignaturePoem } from '../utils/poem'

// 模块级单例缓存：整站只拉一次 /poems，跨页面复用
let _poems = null
let _loading = null

async function loadAllPoems() {
  if (_poems) return _poems
  if (_loading) return _loading
  _loading = (async () => {
    try {
      // 分页拉取全部诗词：以 total 为准循环，避免单页 size 硬上限在数据增长后静默漏算。
      // （后端默认 max-page-size 2000，每页取 2000，绝大多数情况一页即够。）
      const all = []
      let page = 1
      const size = 2000
      for (let guard = 0; guard < 100; guard++) {
        const res = await api.get('/poems', { params: { page, size } })
        const records = (res && (res.records || res)) || []
        const total = (res && res.total) != null ? res.total : records.length
        all.push(...records)
        if (records.length === 0 || all.length >= total) break
        page++
      }
      _poems = all
    } catch (e) {
      // 不缓存失败结果（置 null 而非 []）：[] 为 truthy 会被上方守卫永久返回，
      // 一次瞬时错误就会让整站补全数据永久为空。置 null 后下次调用会自动重试。
      console.warn('[usePoetEnrichment] 加载诗词失败', e)
      _poems = null
    }
    _loading = null
    return _poems
  })()
  return _loading
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
    // loadAllPoems 失败时返回 null，这里兜底为 []，保证 forEach 不抛
    const poems = (await loadAllPoems()) || []
    const m = {}
    poems.forEach((pm) => {
      const pid = pm.poetId
      if (!pid) return
      if (!m[pid]) m[pid] = { poemCount: 0, poems: [] }
      m[pid].poemCount++
      m[pid].poems.push(pm)
    })
    Object.values(m).forEach((e) => {
      // 统一用 pickSignaturePoem 选代表句，与 ShowcasePoetCard / PoetDetail 三处一致，
      // 避免同一诗人在不同页面显示不同代表句
      e.signaturePoem = pickSignaturePoem(e.poems)
      // 保留 poems 全量，供经典案例展示使用
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
      poems: e.poems || [],
    }
  }

  return { loaded, map, build, enrich }
}
