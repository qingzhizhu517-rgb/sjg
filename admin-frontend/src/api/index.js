import { unwrapResult } from '@sjg/shared'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const api = axios.create({
  baseURL: (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '') + '/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => {
    const res = response.data
    try {
      return unwrapResult(res)
    } catch (handledError) {
      ElMessage.error(handledError.message)
      handledError.__sjgHandled = true
      return Promise.reject(handledError)
    }
  },
  error => {
    if (error?.__sjgHandled) return Promise.reject(error)
    const status = error.response?.status
    // 兼容统一 Result 封装的报错提取
    const errData = error.response?.data
    const errMsg = errData && typeof errData === 'object' && errData.message ? errData.message : '请求失败'
    if (status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    } else if (status === 403) {
      // 403 是权限不足，不代表会话失效，不能清除 token。
      ElMessage.error(errMsg === '请求失败' ? '无权访问' : errMsg)
      return Promise.reject(error)
    }
    ElMessage.error(errMsg)
    return Promise.reject(error)
  }
)

export default api
