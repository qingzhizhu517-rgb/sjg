/**
 * SWR (Stale-While-Revalidate) 缓存层
 *
 * 特性：
 * - 按 key 缓存 API 响应（key 可含 theme 维度）
 * - 返回缓存数据的同时在后台重新验证
 * - requestIdleCallback 预取另一风格首屏资源
 * - TTL 过期自动清理
 */

const cache = new Map()
const DEFAULT_TTL = 60_000 // 60 秒

/**
 * 生成缓存 key
 * @param {string} url - API 路径
 * @param {object} params - 请求参数
 * @param {string} theme - 主题（可选）
 * @returns {string}
 */
export function cacheKey(url, params = {}, theme = null) {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&')
  const themeSuffix = theme ? `@${theme}` : ''
  return `${url}${sorted ? '?' + sorted : ''}${themeSuffix}`
}

/**
 * SWR 读取：有缓存立即返回，同时后台刷新
 * @param {string} key - 缓存 key
 * @param {function} fetcher - 返回 Promise 的取数函数
 * @param {object} opts - { ttl, force }
 * @returns {Promise<{data: any, isStale: boolean}>}
 */
export async function swrGet(key, fetcher, opts = {}) {
  const { ttl = DEFAULT_TTL, force = false } = opts
  const now = Date.now()
  const cached = cache.get(key)

  // 有缓存且未过期：直接返回
  if (!force && cached && now - cached.ts < ttl) {
    return { data: cached.data, isStale: false }
  }

  // 有缓存但已过期：返回旧数据 + 后台刷新
  if (cached) {
    // 后台刷新（不 await）
    fetcher().then(data => {
      cache.set(key, { data, ts: Date.now() })
    }).catch(() => {
      // 刷新失败保留旧缓存
    })
    return { data: cached.data, isStale: true }
  }

  // 无缓存：等待取数
  const data = await fetcher()
  cache.set(key, { data, ts: now })
  return { data, isStale: false }
}

/**
 * 直接写入缓存
 */
export function cacheSet(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

/**
 * 读取缓存（不过期检查）
 */
export function cacheGet(key) {
  return cache.get(key)?.data ?? null
}

/**
 * 失效缓存
 */
export function cacheInvalidate(key) {
  cache.delete(key)
}

/**
 * 按前缀失效
 */
export function cacheInvalidatePrefix(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

/**
 * 清空全部缓存
 */
export function cacheClear() {
  cache.clear()
}

/**
 * requestIdleCallback 预取（浏览器空闲时执行）
 * @param {string} key - 缓存 key
 * @param {function} fetcher - 取数函数
 */
export function prefetchWhenIdle(key, fetcher) {
  // 已有缓存则跳过
  if (cache.has(key)) return

  const run = () => {
    fetcher().then(data => {
      cache.set(key, { data, ts: Date.now() })
    }).catch(() => {
      // 静默失败
    })
  }

  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(run, { timeout: 5000 })
  } else {
    // 降级：延迟 2 秒执行
    setTimeout(run, 2000)
  }
}
