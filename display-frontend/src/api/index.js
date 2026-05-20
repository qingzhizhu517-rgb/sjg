import axios from 'axios'

const api = axios.create({
  baseURL: '/api/public',
  timeout: 10000
})

export default api
