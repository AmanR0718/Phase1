import axios, { AxiosError } from 'axios'

// Empty base URL = use proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })
          const { access_token } = response.data
          localStorage.setItem('token', access_token)
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return axiosClient(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default axiosClient
