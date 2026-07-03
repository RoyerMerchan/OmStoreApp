import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ShoppingCart,
  DollarSign,
  Wallet,
  Handshake,
  Users,
  Truck,
  Receipt,
  Tag,
  BarChart3,
  Shield,
  FileText,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingBag, label: 'Productos', path: '/productos' },
  { icon: Package, label: 'Inventario', path: '/inventario' },
  { icon: Tag, label: 'Marcas', path: '/marcas' },
  { icon: ShoppingCart, label: 'POS / Vender', path: '/pos' },
  { icon: Receipt, label: 'Ventas', path: '/ventas' },
  { icon: Wallet, label: 'Caja', path: '/caja' },
  { icon: Handshake, label: 'Apartados', path: '/apartados' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Truck, label: 'Proveedores', path: '/proveedores' },
  { icon: DollarSign, label: 'Compras', path: '/compras' },
  { icon: FileText, label: 'Gastos', path: '/gastos' },
  { icon: BarChart3, label: 'Reportes', path: '/reportes' },
  { icon: Shield, label: 'Usuarios', path: '/usuarios' },
  { icon: Globe, label: 'Pedidos Online', path: '/pedidos' },
]

export default function Sidebar() {
  const { user } = useAuthStore()
  const { dark, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md dark:bg-gray-800"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="sidebar"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
          dark:bg-gray-900 dark:border-gray-800
          transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:flex flex-col
        `}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <img src={dark ? '/om.png' : '/omnegro.png'} alt="OmStore" className="h-10" loading="lazy" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">OmStore</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            if (item.path === '/usuarios' && !isAdmin) return null
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }`
                }
              >
                <item.icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
            aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
      </aside>
    </>
  )
}
