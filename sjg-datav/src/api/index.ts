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

// API 接口
export const api = {
  // 获取诗人列表
  getPoets: () => fetcher(`${BASE_URL}/poets`),

  // 获取诗词列表
  getPoems: () => fetcher(`${BASE_URL}/poems`),

  // 获取景点列表
  getSpots: () => fetcher(`${BASE_URL}/spots`),

  // 获取事件列表
  getEvents: () => fetcher(`${BASE_URL}/events`),

  // 获取朝代列表
  getDynasties: () => fetcher(`${BASE_URL}/dynasties`)
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
