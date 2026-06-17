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
        return Promise.reject(new Error(res.message || '操作失败'))
      }
    }
    return res
  },
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    // 兼容统一 Result 封装的报错提取
    const errData = error.response?.data
    const errMsg = errData && typeof errData === 'object' && errData.message ? errData.message : '请求失败'
    ElMessage.error(errMsg)
    return Promise.reject(error)
  }
)

export default api
