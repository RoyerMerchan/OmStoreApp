import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, User, Bell } from 'lucide-react'
import { useNotificationStore } from '../stores/notificationStore'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { unreadCount, fetch: fetchNotifs } = useNotificationStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  return (
    <header className="h-16 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {user?.name || 'Usuario'}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pedidos')}
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <User size={16} />
          <span className="hidden sm:inline">{user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
