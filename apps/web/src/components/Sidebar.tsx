import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse,
  ShoppingCart,
  DollarSign,
  Wallet,
  Handshake,
  Users,
  Truck,
  Receipt,
  BarChart3,
  Shield,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingBag, label: 'Productos', path: '/productos' },
  { icon: Package, label: 'Inventario', path: '/inventario' },
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
]

export default function Sidebar() {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:flex flex-col
        `}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src="/omnegro.png" alt="OmStore" className="h-10" />
            <span className="font-bold text-xl text-gray-900">OmStore</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            if (item.path === '/usuarios' && !isAdmin) return null
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
