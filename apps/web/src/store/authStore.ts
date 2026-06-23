import { create } from 'zustand'
import api from '../lib/axios'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data.data
    localStorage.setItem('token', token)
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null })
    window.location.href = '/login'
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        set({ user: null, loading: false })
        return
      }
      const res = await api.get('/auth/me')
      set({ user: res.data.data, loading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, loading: false })
    }
  },
}))
