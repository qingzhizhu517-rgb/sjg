import axios from 'axios'
import { getFallbackData } from '../config/mockFallbackDb'

const api = axios.create({
  baseURL: '/api/public',
  timeout: 10000
})

// Automatically extract response.data and fall back to local mock data if the backend is down
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const config = error.config
    // Fallback if network error, server offline, or server returns 5xx error
    if (!error.response || error.response.status >= 500 || error.code === 'ERR_NETWORK') {
      const url = config.url
      const params = config.params || {}
      
      console.warn(`[API Fallback] Network error or server offline on ${url}. Falling back to client-side mock database.`);
      
      const fallbackData = getFallbackData(url, params)
      if (fallbackData !== null) {
        return Promise.resolve(fallbackData)
      }
    }
    return Promise.reject(error)
  }
)

export default api
