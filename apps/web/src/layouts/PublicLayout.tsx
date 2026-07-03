import { Outlet, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Store, ShoppingCart } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'

export default function PublicLayout() {
  const { dark, toggle } = useTheme()
  const itemCount = useCartStore((s) => s.itemCount())

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/tienda" className="flex items-center gap-2">
              <img src={dark ? '/om.png' : '/omnegro.png'} alt="OmStore" className="h-10" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">OmStore</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/tienda" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium flex items-center gap-1">
                <Store size={16} />
                Tienda
              </Link>
              <Link to="/tienda/checkout" className="relative text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
              <Link to="/catalogo" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xs font-medium">
                Admin
              </Link>
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Cambiar modo oscuro"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
          &copy; 2026 OmStore. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
