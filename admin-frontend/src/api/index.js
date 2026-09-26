import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const api = axios.create({
  baseURL: '/api',
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
    // 兼容统一 Result 封装：如果包含 code 和 message 且 code == 200，则提取 data
    if (res && typeof res === 'object' && 'code' in res && 'message' in res) {
      if (res.code === 200) {
        return res.data !== undefined ? res.data : res
      } else {
        ElMessage.error(res.message || '操作失败')
        const handledError = new Error(res.message || '操作失败')
        handledError.__sjgHandled = true
        return Promise.reject(handledError)
      }
    }
    return res
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
