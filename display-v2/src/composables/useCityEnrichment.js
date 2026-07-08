import { ref } from 'vue'
import api from '../api'
import { matchCityByBirthplace } from '../config/cityAliases'

// 模块级单例缓存：整站只拉一次 /poets，跨城市卡复用。
// 仿 usePoetEnrichment 的纪律：失败置 null（非 []），下次自动重试。
let _poets = null
let _poetsLoading = null
let _poetsByCity = null // Map<city, {id,name,style}[]> | null

async function loadAllPoets() {
  if (_poets) return _poets
  if (_poetsLoading) return _poetsLoading
  _poetsLoading = (async () => {
    try {
      const all = []
      let page = 1
      const size = 2000
      for (let guard = 0; guard < 100; guard++) {
        const res = await api.get('/poets', { params: { page, size } })
        const records = (res && (res.records || res)) || []
        const total = (res && res.total) != null ? res.total : records.length
        all.push(...records)
        if (records.length === 0 || all.length >= total) break
        page++
      }
      _poets = all
    } catch (e) {
      console.warn('[useCityEnrichment] 加载诗人失败', e)
      _poets = null
    }
    _poetsLoading = null
    return _poets
  })()
  return _poetsLoading
}

// per-city 景点详情缓存（spotCount/poemCount/代表图/景点名/首个 spotId）
const _spotCache = new Map()

async function loadCitySpots(name) {
  if (_spotCache.has(name)) return _spotCache.get(name)
  const res = await api.get('/spots', { params: { region: name, size: 100, page: 1 } })
  const records = (res && (res.records || res)) || []
  const poemCount = records.reduce((s, sp) => s + (sp.poemCount || 0), 0)
  const first = records[0] || null
  const detail = {
    spotCount: records.length,
    poemCount,
    firstSpotId: first ? first.id : null,
    imageUrl: first ? first.imageUrl || first.imageAnimeUrl || null : null,
    spotNames: records.slice(0, 4).map((s) => s.name).filter(Boolean)
  }
  _spotCache.set(name, detail)
  return detail
}

/**
 * 城市卡数据补全：拉该市景点详情 + 全量诗人（按出生地别名归城）。
 * 所有请求失败不阻塞：景点失败 -> 计数 0 + ok:false；诗人失败 -> 名士为空。
 *
 * @returns {{ poetsLoaded: import('vue').Ref<boolean>, ensurePoets: () => Promise, enrichCity: (name: string) => Promise<object> }}
 */
export function useCityEnrichment() {
  const poetsLoaded = ref(false)

  const ensurePoets = async () => {
    const poets = await loadAllPoets()
    if (poets && !_poetsByCity) {
      const m = new Map()
      poets.forEach((p) => {
        const city = matchCityByBirthplace(p.birthplace)
        if (!city) return
        if (!m.has(city)) m.set(city, [])
        m.get(city).push({ id: p.id, name: p.name, style: p.style || '' })
      })
      _poetsByCity = m
    }
    poetsLoaded.value = !!poets
    return poets
  }

  const enrichCity = async (name) => {
    const [spotsRes] = await Promise.allSettled([loadCitySpots(name), ensurePoets()])
    const spot = spotsRes.status === 'fulfilled'
      ? spotsRes.value
      : { spotCount: 0, poemCount: 0, firstSpotId: null, imageUrl: null, spotNames: [] }
    const poets = (_poetsByCity && _poetsByCity.get(name)) || []
    return {
      spotCount: spot.spotCount,
      poemCount: spot.poemCount,
      firstSpotId: spot.firstSpotId,
      imageUrl: spot.imageUrl,
      spotNames: spot.spotNames,
      poets: poets.slice(0, 4),
      firstPoetId: poets.length ? poets[0].id : null,
      ok: spotsRes.status === 'fulfilled'
    }
  }

  return { poetsLoaded, ensurePoets, enrichCity }
}
