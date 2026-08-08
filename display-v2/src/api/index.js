import axios from 'axios'
import { cacheKey, swrGet, prefetchWhenIdle } from './cache'

const api = axios.create({
  baseURL: '/api/public',
  timeout: 10000,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})

// Unified error messages for common status codes
const ERROR_MESSAGES = {
  400: '请求参数错误',
  401: '未登录或登录已过期',
  403: '没有访问权限',
  404: '请求的资源不存在',
  500: '服务器内部错误，请稍后重试',
  502: '服务器暂时不可用',
  NETWORK: '网络连接失败，请检查网络',
  TIMEOUT: '请求超时，请稍后重试',
  DEFAULT: '未知错误，请稍后重试'
}

// Extract user-facing message from any error shape
const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status
    // Prefer backend message, fall back to status-based message
    const data = error.response.data
    if (data && typeof data === 'object' && data.message) {
      return data.message
    }
    return ERROR_MESSAGES[status] || ERROR_MESSAGES.DEFAULT
  }
  if (error.code === 'ECONNABORTED') return ERROR_MESSAGES.TIMEOUT
  if (!error.response) return ERROR_MESSAGES.NETWORK
  return ERROR_MESSAGES.DEFAULT
}

// Response interceptor: unwrap unified result wrapper
api.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 200) {
        return res.data !== undefined ? res.data : res
      }
      // Backend returned business error — throw with message so callers can catch
      const err = new Error(res.message || '服务器返回错误')
      err.code = res.code
      return Promise.reject(err)
    }
    return res
  },
  (error) => {
    const message = getErrorMessage(error)
    // Store last error for components to display if needed
    api.lastError = { message, timestamp: Date.now() }
    console.error('[API]', message, error.config?.url)
    return Promise.reject(new Error(message))
  }
)

/**
 * SWR 缓存 GET：有缓存立即返回，后台刷新
 * @param {string} url - API 路径
 * @param {object} params - 请求参数
 * @param {object} opts - { theme, ttl, force }
 * @returns {Promise<{data, isStale}>}
 */
api.swrGet = (url, params = {}, opts = {}) => {
  const { theme, ttl, force } = opts
  const key = cacheKey(url, params, theme)
  const fetcher = () => api.get(url, { params })
  return swrGet(key, fetcher, { ttl, force })
}

/**
 * 预取：浏览器空闲时缓存
 * @param {string} url - API 路径
 * @param {object} params - 请求参数
 * @param {object} opts - { theme }
 */
api.prefetch = (url, params = {}, opts = {}) => {
  const { theme } = opts
  const key = cacheKey(url, params, theme)
  const fetcher = () => api.get(url, { params })
  prefetchWhenIdle(key, fetcher)
}

export default api
