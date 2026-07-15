import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Sun, Moon, ShoppingCart, User, LogOut, Package } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useEffect, useState } from 'react'

export default function StoreLayout() {
  const { dark, toggle } = useTheme()
  const itemCount = useCartStore((s) => s.itemCount)
  const openDrawer = useCartStore((s) => s.openDrawer)
  const { user, checkAuth, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/tienda" className="flex items-center gap-2">
              <img src="/om.png" alt="OmStore" className="h-12" />
              <span className="font-bold text-xl text-white">OmStore</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/tienda" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Tienda
              </Link>
              <button
                onClick={openDrawer}
                className="relative p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <ShoppingCart size={20} />
                {itemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount() > 99 ? '99+' : itemCount()}
                  </span>
                )}
              </button>
              <button
                onClick={toggle}
                className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Cambiar tema"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                      <Link
                        to="/tienda/mi-cuenta"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <User size={14} /> Mi cuenta
                      </Link>
                      <Link
                        to="/tienda/orden"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Package size={14} /> Mis pedidos
                      </Link>
                      <button
                        onClick={() => { setMenuOpen(false); logout() }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut size={14} /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/tienda/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/tienda/registro"
                    className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>

            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={openDrawer}
                className="relative p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <ShoppingCart size={20} />
                {itemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount()}
                  </span>
                )}
              </button>
              <Link
                to="/tienda/login"
                className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">&copy; 2026 OmStore. Todos los derechos reservados.</p>
        </div>
      </footer>

      <CartDrawer />
    </div>
  )
}

function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items, updateQuantity, removeItem, totalUsdCents, clearCart } = useCartStore()
  const navigate = useNavigate()

  if (!isDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={closeDrawer}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Carrito</h2>
          <button
            onClick={closeDrawer}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.size} / {item.color}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      ${(item.priceUsdCents / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 text-xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex justify-between font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>${(totalUsdCents() / 100).toFixed(2)} USD</span>
            </div>
            <button
              onClick={() => { closeDrawer(); navigate('/tienda/checkout') }}
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ir al checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
