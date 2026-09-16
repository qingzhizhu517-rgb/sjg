import useSWR from 'swr'

const BASE_URL = '/api/public'

/** 后端公开接口的实体形态（只声明大屏用到的字段） */
export interface Spot {
  id: number
  name: string
  region?: string | null
  longitude?: number | null
  latitude?: number | null
}

export interface Poet {
  id: number
  name: string
  dynastyId?: number | null
  birthplace?: string | null
  style?: string | null
}

export interface Poem {
  id: number
  title: string
  poetId?: number | null
  dynastyId?: number | null
  spotId?: number | null
  sentimentTags?: string | string[] | null
}

export interface EventItem {
  id: number
  title: string
  dynastyId?: number | null
  year?: number | null
}

export interface Dynasty {
  id: number
  name: string
  startYear?: number | null
  endYear?: number | null
}

export interface CultureCategory {
  category: string
  count: number
}

/** 沿黄九市（上游→下游）及其景观数——顺序的权威来源是后端，前端不再硬编码 */
export interface RegionStat {
  name: string
  spotCount: number
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const data = await response.json()
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败')
  }
  if (data.data && data.data.records) {
    return data.data.records
  }
  return data.data
}

/** 分页全量拉取：循环取到 total 为止（maxPages 兜底防死循环） */
const fetchAllPaginated = async (baseUrl: string, pageSize = 200) => {
  const all: unknown[] = []
  const maxPages = 50
  for (let page = 1; page <= maxPages; page++) {
    const response = await fetch(`${baseUrl}?page=${page}&size=${pageSize}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (data.code !== 200) throw new Error(data.message || '请求失败')
    const records = data.data?.records || []
    const total = data.data?.total || 0
    all.push(...records)
    if (records.length === 0 || all.length >= total) break
  }
  return all
}

export const api = {
  getPoets: () => fetchAllPaginated(`${BASE_URL}/poets`, 200),
  getPoems: () => fetchAllPaginated(`${BASE_URL}/poems`, 200),
  getSpots: () => fetchAllPaginated(`${BASE_URL}/spots`, 100),
  getEvents: () => fetcher(`${BASE_URL}/events`),
  getDynasties: () => fetcher(`${BASE_URL}/dynasties`),
  getRegions: () => fetcher(`${BASE_URL}/spots/regions`),
  /** 五脉文华计数；传 region 时只统计属于该区域的条目 */
  getCulturalCategories: (region?: string) =>
    fetcher(`${BASE_URL}/cultural/categories${region ? `?region=${encodeURIComponent(region)}` : ''}`),
}

/**
 * 所有 hook 统一返回 { data, isLoading, error, mutate }。
 * mutate 用于错误态下的「重新加载」——原先没有暴露，出错后只能整页刷新。
 */
function useResource<T>(key: string, loader: () => Promise<unknown>) {
  const { data, error, isLoading, mutate } = useSWR(key, loader)
  return {
    data: (data ?? []) as T[],
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}

export function usePoets() {
  const { data, ...rest } = useResource<Poet>('poets', api.getPoets)
  return { poets: data, ...rest }
}

export function usePoems() {
  const { data, ...rest } = useResource<Poem>('poems', api.getPoems)
  return { poems: data, ...rest }
}

export function useSpots() {
  const { data, ...rest } = useResource<Spot>('spots', api.getSpots)
  return { spots: data, ...rest }
}

export function useEvents() {
  const { data, ...rest } = useResource<EventItem>('events', api.getEvents)
  return { events: data, ...rest }
}

export function useDynasties() {
  const { data, ...rest } = useResource<Dynasty>('dynasties', api.getDynasties)
  return { dynasties: data, ...rest }
}

export function useRegions() {
  const { data, ...rest } = useResource<RegionStat>('regions', api.getRegions)
  return { regions: data, ...rest }
}

/**
 * 五脉文华计数。SWR key 带区域后缀，切换城市会各自缓存、来回点不再重复请求。
 */
export function useCulturalCategories(region: string | null = null) {
  const { data, ...rest } = useResource<CultureCategory>(
    `cultural-categories:${region ?? 'all'}`,
    () => api.getCulturalCategories(region ?? undefined),
  )
  return { categories: data, ...rest }
}
