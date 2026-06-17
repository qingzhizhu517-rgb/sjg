import axios from 'axios'

const api = axios.create({
  baseURL: '/api/public',
  timeout: 10000
})

api.interceptors.response.use(
  (response) => {
    const res = response.data
    // 兼容统一 Result 封装：如果包含 code 和 message 且 code == 200，则提取 data
    if (res && typeof res === 'object' && 'code' in res && 'message' in res) {
      if (res.code === 200) {
        return res.data !== undefined ? res.data : res
      }
    }
    return res
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
