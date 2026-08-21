import useSWR from 'swr'

const BASE_URL = '/api/public'

// 通用 fetcher - 处理分页数据
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败')
  }
  // 处理分页数据：如果是分页格式，返回 records 数组
  if (data.data && data.data.records) {
    return data.data.records
  }
  return data.data
}

/**
 * 通用分页全量拉取函数
 * 自动循环拉取所有分页数据，合并返回完整数组
 */
const fetchAllPaginated = async (baseUrl: string, pageSize: number = 200) => {
  const allRecords: any[] = []
  let page = 1
  const maxPages = 50 // 安全限制，防止无限循环

  while (page <= maxPages) {
    const url = `${baseUrl}?page=${page}&size=${pageSize}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.code !== 200) {
      throw new Error(data.message || '请求失败')
    }

    const records = data.data?.records || []
    const total = data.data?.total || 0

    allRecords.push(...records)

    // 如果已经获取了所有数据，或者本页数据为空，停止拉取
    if (records.length === 0 || allRecords.length >= total) {
      break
    }
    page++
  }

  return allRecords
}

// API 接口 - 使用全量分页拉取
export const api = {
  // 获取全部诗人（自动分页拉取）
  getPoets: () => fetchAllPaginated(`${BASE_URL}/poets`, 200),

  // 获取全部诗词（自动分页拉取）
  getPoems: () => fetchAllPaginated(`${BASE_URL}/poems`, 200),

  // 获取全部景点（自动分页拉取）
  getSpots: () => fetchAllPaginated(`${BASE_URL}/spots`, 100),

  // 获取事件列表（新增的公开接口）
  getEvents: () => fetcher(`${BASE_URL}/events`),

  // 获取朝代列表（新增的公开接口）
  getDynasties: () => fetcher(`${BASE_URL}/dynasties`),

  // 获取历史时间线(按朝代分组的诗人/诗词/事件)
  getTimeline: () => fetcher(`${BASE_URL}/timeline`),

  // 文化五类统计(民俗节庆/古诗词/非遗工艺/民间文学/饮食戏曲)
  getCulturalCategories: () => fetcher(`${BASE_URL}/cultural/categories`),
}

// SWR Hooks
export function usePoets() {
  const { data, error, isLoading } = useSWR('poets', api.getPoets)
  return {
    poets: data || [],
    isLoading,
    error
  }
}

export function usePoems() {
  const { data, error, isLoading } = useSWR('poems', api.getPoems)
  return {
    poems: data || [],
    isLoading,
    error
  }
}

export function useSpots() {
  const { data, error, isLoading } = useSWR('spots', api.getSpots)
  return {
    spots: data || [],
    isLoading,
    error
  }
}

export function useDynasties() {
  const { data, error, isLoading } = useSWR('dynasties', api.getDynasties)
  return {
    dynasties: data || [],
    isLoading,
    error
  }
}

export function useTimeline() {
  const { data, error, isLoading } = useSWR('timeline', api.getTimeline)
  return {
    timeline: data || [],
    isLoading,
    error
  }
}

export function useCulturalCategories() {
  const { data, error, isLoading } = useSWR('cultural-categories', api.getCulturalCategories)
  return {
    categories: (data || []) as Array<{ category: string; count: number }>,
    isLoading,
    error
  }
}
