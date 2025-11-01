import { create } from 'zustand'
import api from '@/services/api'
import qs from 'qs'

type User = {
  id?: string
  name: string
  role: string
  email?: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials, role: Role) => Promise<void>
  logout: () => void
}

type Role = 'admin' | 'operator' | 'farmer'

type LoginCredentials =
  | { email: string; password: string } // admin/operator
  | { nrc: string; dob: string }        // farmer

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (credentials, role) => {
    set({ loading: true, error: null })
    try {
      // Choose endpoint per role
      const endpoint =
        role === 'admin'
          ? '/api/auth/login'
          : role === 'operator'
          ? '/api/auth/operator-login'
          : '/api/auth/farmer-login'

      // Build payload depending on role
      const payload =
        role === 'farmer'
          ? qs.stringify({
              nrc: (credentials as any).nrc,
              dob: (credentials as any).dob,
            })
          : qs.stringify({
              username: (credentials as any).email,
              password: (credentials as any).password,
            })

      const res = await api.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      const { access_token, user } = res.data
      localStorage.setItem('token', access_token)
      set({ user, token: access_token, loading: false })
    } catch (err: any) {
      set({
        loading: false,
        error:
          err.response?.data?.detail ||
          'Login failed. Please check your credentials.',
      })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))
