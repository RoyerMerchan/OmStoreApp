import { useAuthStore } from '../store/authStore'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {user?.name || 'Usuario'}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} />
          <span className="hidden sm:inline">{user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
