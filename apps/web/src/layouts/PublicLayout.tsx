import { Outlet, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function PublicLayout() {
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/catalogo" className="flex items-center gap-2">
              <img src={dark ? '/om.png' : '/omnegro.png'} alt="OmStore" className="h-10" loading="lazy" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">OmStore</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/catalogo" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium">
                Catálogo
              </Link>
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
