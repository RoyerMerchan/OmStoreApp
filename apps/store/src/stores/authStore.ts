import { create } from 'zustand'
import { storeLogin, storeRegister, storeMe, updateStoreProfile } from '../lib/storeApi'

interface ClientUser {
  id: string
  name: string
  email: string
  role: string
  profile?: {
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }
}

interface AuthState {
  user: ClientUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => void
  updateProfile: (data: any) => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email: string, password: string) => {
    const res = await storeLogin(email, password)
    const { token, user } = res.data
    localStorage.setItem('store-token', token)
    set({ user })
  },

  register: async (data) => {
    const res = await storeRegister(data)
    const { token, user } = res.data
    localStorage.setItem('store-token', token)
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('store-token')
    set({ user: null })
    window.location.href = '/tienda'
  },

  updateProfile: async (data) => {
    const res = await updateStoreProfile(data)
    set({ user: res.data })
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('store-token')
      if (!token) {
        set({ user: null, loading: false })
        return
      }
      const res = await storeMe()
      set({ user: res.data, loading: false })
    } catch {
      localStorage.removeItem('store-token')
      set({ user: null, loading: false })
    }
  },
}))
