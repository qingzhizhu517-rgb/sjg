import { useCallback, useMemo } from 'react'
import {
  useCulturalCategories,
  useDynasties,
  useEvents,
  usePoems,
  usePoets,
  useSpots,
} from '../api'
import type { CultureCategory, Dynasty, EventItem, Poem, Poet, Spot } from '../api'

/** 沿黄九市（上游→下游）。顺序与首页 /regions 一致，加城市要同步改这里。 */
export const REGION_ORDER = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '淄博', '滨州', '东营'] as const

export interface DashboardFilter {
  /** 选中城市（region 名），null = 全部 */
  region: string | null
  /** 选中朝代 id，null = 全部 */
  dynastyId: number | null
}

export const EMPTY_FILTER: DashboardFilter = { region: null, dynastyId: null }

export interface CityStat {
  name: string
  count: number
}

export interface DynastyStat {
  id: number
  name: string
  poetCount: number
  poemCount: number
  eventCount: number
}

export interface MapSpot {
  name: string
  lon: number
  lat: number
}

export interface DashboardView {
  /** 九城景观数（朝代筛选会收窄；城市筛选只做高亮，不参与收窄） */
  cities: CityStat[]
  /** 五脉文华计数（接口只给全量，不随筛选变化） */
  culture: Record<string, number>
  poetRank: Array<{ id: number; name: string; value: number }>
  dynastyStats: DynastyStat[]
  sentiment: Array<{ name: string; value: number }>
  totals: { spots: number; poets: number; poems: number; events: number }
  /** 地图散点：全部有坐标的景观 */
  mapSpots: MapSpot[]
  /** 当前筛选命中的景观 id（地图据此调暗未命中项） */
  activeSpotIds: Set<number>
}

interface RawData {
  spots: Spot[]
  poets: Poet[]
  poems: Poem[]
  events: EventItem[]
  dynasties: Dynasty[]
  categories: CultureCategory[]
}

/** 情感标签列可能是 JSON 字符串 */
function parseTags(raw: Poem['sentimentTags']): string[] {
  if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === 'string' && !!t)
  if (typeof raw !== 'string' || !raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string' && !!t) : []
  } catch {
    return []
  }
}

/**
 * 由原始数据 + 筛选条件算出整屏所需的派生视图。
 * 纯函数，便于推理与复用。
 */
export function buildView(raw: RawData, filter: DashboardFilter): DashboardView {
  const { spots, poets, poems, events, dynasties, categories } = raw

  const spotRegion = new Map<number, string>()
  spots.forEach((s) => {
    spotRegion.set(s.id, s.region ?? '')
  })

  const dynastyPoems = filter.dynastyId == null ? poems : poems.filter((p) => p.dynastyId === filter.dynastyId)
  const dynastyPoets = filter.dynastyId == null ? poets : poets.filter((p) => p.dynastyId === filter.dynastyId)
  const dynastyEvents = filter.dynastyId == null ? events : events.filter((e) => e.dynastyId === filter.dynastyId)

  // 九城榜：按朝代收窄景观范围；城市筛选不参与，否则选中一城后其余城市全归零、失去切换意义
  const dynastySpotIds =
    filter.dynastyId == null
      ? null
      : new Set(dynastyPoems.map((p) => p.spotId).filter((id): id is number => id != null))
  const cityScopedSpots = dynastySpotIds == null ? spots : spots.filter((s) => dynastySpotIds.has(s.id))

  const cities = REGION_ORDER.map((name) => ({
    name,
    count: cityScopedSpots.filter((s) => s.region === name).length,
  }))

  // 当前可见对象
  const visibleSpots = filter.region ? cityScopedSpots.filter((s) => s.region === filter.region) : cityScopedSpots
  const visibleSpotIds = new Set(visibleSpots.map((s) => s.id))

  const visiblePoems = dynastyPoems.filter((p) => {
    if (!filter.region) return true
    return p.spotId != null && spotRegion.get(p.spotId) === filter.region
  })

  const poetIdsWithPoem = new Set(
    visiblePoems.map((p) => p.poetId).filter((id): id is number => id != null),
  )
  const visiblePoets = filter.region
    ? dynastyPoets.filter((p) => poetIdsWithPoem.has(p.id))
    : dynastyPoets

  const poemCountByPoet = new Map<number, number>()
  visiblePoems.forEach((p) => {
    if (p.poetId == null) return
    poemCountByPoet.set(p.poetId, (poemCountByPoet.get(p.poetId) ?? 0) + 1)
  })

  const poetRank = visiblePoets
    .map((p) => ({ id: p.id, name: p.name, value: poemCountByPoet.get(p.id) ?? 0 }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'zh'))
    .slice(0, 8)

  const dynastyStats: DynastyStat[] = dynasties.map((d) => ({
    id: d.id,
    name: d.name,
    poetCount: visiblePoets.filter((p) => p.dynastyId === d.id).length,
    poemCount: visiblePoems.filter((p) => p.dynastyId === d.id).length,
    eventCount: dynastyEvents.filter((e) => e.dynastyId === d.id).length,
  }))

  const sentimentMap = new Map<string, number>()
  visiblePoems.forEach((p) => {
    parseTags(p.sentimentTags).forEach((tag) => sentimentMap.set(tag, (sentimentMap.get(tag) ?? 0) + 1))
  })
  const sentiment = Array.from(sentimentMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20)

  // 五脉文华：接口只提供全量计数，没有按城市/朝代下钻的维度，故不随筛选变化
  const culture: Record<string, number> = {}
  categories.forEach((c) => {
    culture[c.category] = c.count
  })

  const mapSpots: MapSpot[] = cityScopedSpots
    .filter((s) => typeof s.longitude === 'number' && typeof s.latitude === 'number')
    .map((s) => ({ name: s.name, lon: s.longitude as number, lat: s.latitude as number }))

  return {
    cities,
    culture,
    poetRank,
    dynastyStats,
    sentiment,
    totals: {
      spots: visibleSpots.length,
      poets: visiblePoets.length,
      poems: visiblePoems.length,
      events: dynastyEvents.length,
    },
    mapSpots,
    activeSpotIds: filter.region ? visibleSpotIds : new Set(cityScopedSpots.map((s) => s.id)),
  }
}

/**
 * 大屏数据入口：拉取全部公开接口并派生视图。
 * 任一接口失败都算整体失败——大屏宁可显示明确错误，也不要静默的 0/—。
 */
export function useDashboardData(filter: DashboardFilter) {
  const spotsQ = useSpots()
  const poetsQ = usePoets()
  const poemsQ = usePoems()
  const eventsQ = useEvents()
  const dynastiesQ = useDynasties()
  const cultureQ = useCulturalCategories()

  const isLoading =
    spotsQ.isLoading || poetsQ.isLoading || poemsQ.isLoading || eventsQ.isLoading ||
    dynastiesQ.isLoading || cultureQ.isLoading

  const error = spotsQ.error || poetsQ.error || poemsQ.error || eventsQ.error || dynastiesQ.error || cultureQ.error

  const retry = useCallback(() => {
    void spotsQ.mutate()
    void poetsQ.mutate()
    void poemsQ.mutate()
    void eventsQ.mutate()
    void dynastiesQ.mutate()
    void cultureQ.mutate()
  }, [spotsQ.mutate, poetsQ.mutate, poemsQ.mutate, eventsQ.mutate, dynastiesQ.mutate, cultureQ.mutate])

  const view = useMemo(
    () =>
      buildView(
        {
          spots: spotsQ.spots,
          poets: poetsQ.poets,
          poems: poemsQ.poems,
          events: eventsQ.events,
          dynasties: dynastiesQ.dynasties,
          categories: cultureQ.categories,
        },
        filter,
      ),
    [
      spotsQ.spots,
      poetsQ.poets,
      poemsQ.poems,
      eventsQ.events,
      dynastiesQ.dynasties,
      cultureQ.categories,
      filter,
    ],
  )

  return {
    view,
    dynasties: dynastiesQ.dynasties,
    /** 原始景观列表（地图需要未裁切的坐标全集） */
    isLoading,
    error,
    retry,
    /** 是否有任何数据到达（用于区分「加载中」与「真的没数据」） */
    hasData:
      spotsQ.spots.length + poetsQ.poets.length + poemsQ.poems.length + cultureQ.categories.length > 0,
  }
}
