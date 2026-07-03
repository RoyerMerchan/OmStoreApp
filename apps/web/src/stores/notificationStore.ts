import { create } from 'zustand'
import api from '../lib/axios'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetch: () => Promise<void>
  markRead: (id: string) => Promise<void>
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    try {
      const res = await api.get('/admin/store/notifications')
      const data = res.data.data ?? []
      set({
        notifications: data,
        unreadCount: data.filter((n: Notification) => !n.read).length,
      })
    } catch { /* ignore */ }
  },

  markRead: async (id: string) => {
    try {
      await api.patch(`/admin/store/notifications/${id}/read`)
      get().fetch()
    } catch { /* ignore */ }
  },
}))
