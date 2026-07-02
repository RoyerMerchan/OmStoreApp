import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'sonner'
import {
  TrendingUp,
  DollarSign,
  Package,
  Warehouse,
  Handshake,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react'

interface Summary {
  salesToday: number
  salesTodayCount: number
  salesMonth: number
  salesMonthCount: number
  totalProducts: number
  totalStock: number
  activeLayaways: number
  lowStockCount: number
}

interface TopProduct {
  id: number
  name: string
  brand: string
  totalSold: number
  revenue: number
}

interface LowStockItem {
  id: number
  productName: string
  size: string
  color: string
  stock: number
  minStock: number
}

interface RecentSale {
  id: number
  total: number
  itemsCount: number
  paymentMethod: string
  createdAt: string
  customerName: string | null
}

interface PaymentMethod {
  method: string
  total: number
  count: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [lowStock, setLowStock] = useState<LowStockItem[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentSale[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [sumRes, topRes, lowRes, actRes, payRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/top-products'),
        api.get('/dashboard/low-stock'),
        api.get('/dashboard/recent-activity'),
        api.get('/dashboard/payment-methods'),
      ])

      if (sumRes.data.success) setSummary(sumRes.data.data)
      if (topRes.data.success) setTopProducts(topRes.data.data)
      if (lowRes.data.success) setLowStock(lowRes.data.data)
      if (actRes.data.success) setRecentActivity(actRes.data.data.recentSales || [])
      if (payRes.data.success) setPaymentMethods(payRes.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Ventas Hoy',
      value: `$${summary?.salesToday?.toLocaleString() || '0'}`,
      sub: `${summary?.salesTodayCount || 0} transacciones`,
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      label: 'Ventas Mes',
      value: `$${summary?.salesMonth?.toLocaleString() || '0'}`,
      sub: `${summary?.salesMonthCount || 0} transacciones`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Productos',
      value: summary?.totalProducts?.toLocaleString() || '0',
      sub: 'totales',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      label: 'Stock Total',
      value: summary?.totalStock?.toLocaleString() || '0',
      sub: 'unidades',
      icon: Warehouse,
      color: 'bg-indigo-500',
    },
    {
      label: 'Apartados',
      value: summary?.activeLayaways?.toLocaleString() || '0',
      sub: 'activos',
      icon: Handshake,
      color: 'bg-amber-500',
    },
    {
      label: 'Bajo Stock',
      value: summary?.lowStockCount?.toLocaleString() || '0',
      sub: 'productos',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ]

  const totalPayments = paymentMethods.reduce((acc, p) => acc + p.total, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productos más vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin datos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Producto</th>
                    <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Marca</th>
                    <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Vendidos</th>
                    <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 text-gray-900 dark:text-white">{p.name}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{p.brand}</td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">{p.totalSold}</td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">${p.revenue?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bajo stock</h2>
          {lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin productos con bajo stock</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.size} / {item.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">{item.stock}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">mín: {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Últimas ventas</h2>
            <Link to="/ventas" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todas
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin ventas recientes</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((sale) => (
                <Link
                  key={sale.id}
                  to={`/ventas/${sale.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700/50"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      Venta #{sale.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sale.customerName || 'Sin cliente'} · {sale.itemsCount} artículos ·{' '}
                      {new Date(sale.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">${sale.total?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sale.paymentMethod}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Métodos de pago</h2>
          {paymentMethods.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin datos</p>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((pm) => {
                const pct = totalPayments > 0 ? (pm.total / totalPayments) * 100 : 0
                return (
                  <div key={pm.method}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{pm.method}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ${pm.total?.toLocaleString()} ({pm.count} ventas)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full transition-all dark:bg-primary-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
