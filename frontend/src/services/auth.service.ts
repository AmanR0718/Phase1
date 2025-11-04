import axiosClient from '@/utils/axios'

export const authService = {
  async login(username: string, password: string) {
    const { data } = await axiosClient.post('/api/auth/login', { 
      username, 
      password 
    })
    return data
  },

  async getCurrentUser() {
    const { data } = await axiosClient.get('/api/auth/me')
    return data
  },

  async logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
  },
}
