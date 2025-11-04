import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: any | null
  token: string | null
  role: string | null
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(username, password)
          set({
            user: response.user,
            token: response.access_token,
            role: response.user.role,
            isLoading: false,
          })
          localStorage.setItem('token', response.access_token)
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token)
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Login failed', 
            isLoading: false 
          })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({ user: null, token: null, role: null })
      },

      loadUser: async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        set({ isLoading: true })
        try {
          const user = await authService.getCurrentUser()
          set({ user, role: user.role, token, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          localStorage.removeItem('token')
        }
      },
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore
