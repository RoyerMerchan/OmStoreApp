import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { fetchMyOrders, fetchOrder } from '../lib/storeApi'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalUsdCents: number
  paymentMethod: string
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    unitPriceUsdCents: number
    variant: { product: { name: string; imageUrl?: string }; size: string; color: string }
  }>
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  PENDING_PAYMENT: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', label: 'Pendiente' },
  PAYMENT_DECLARED: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Verificando' },
  CONFIRMED: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', label: 'Confirmado' },
  PREPARING: { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', label: 'Preparando' },
  SHIPPED: { icon: Package, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', label: 'Enviado' },
  DELIVERED: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', label: 'Entregado' },
  CANCELLED: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', label: 'Cancelado' },
  REJECTED: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', label: 'Rechazado' },
}

export default function OrdenStatus() {
  const { id } = useParams<{ id: string }>()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyOrders()
      .then((res: any) => setOrders(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (id) {
      fetchOrder(id)
        .then((res: any) => setSelectedOrder(res.data))
        .catch(() => {})
    }
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>

  if (id && selectedOrder) {
    const cfg = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING_PAYMENT
    const StatusIcon = cfg.icon
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          ← Volver a mis pedidos
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className={`flex items-center gap-3 p-4 ${cfg.bgColor}`}>
            <StatusIcon size={20} className={cfg.color} />
            <div>
              <p className={`font-semibold ${cfg.color}`}>{cfg.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pedido #{selectedOrder.orderNumber}</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.variant.product.imageUrl && (
                    <img src={item.variant.product.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.variant.product.name}</p>
                    <p className="text-xs text-gray-500">{item.variant.size} / {item.variant.color} x{item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    ${(item.unitPriceUsdCents * item.quantity / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>${(selectedOrder.totalUsdCents / 100).toFixed(2)} USD</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(selectedOrder.createdAt).toLocaleString('es-VE')}
              </p>
            </div>

            <Link
              to={`/tienda/confirmacion/${selectedOrder.id}`}
              className="block w-full text-center py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Ver detalle completo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-lg font-medium text-gray-900 dark:text-white">No tienes pedidos aún</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">¡Explora nuestro catálogo y haz tu primera compra!</p>
        <Link to="/tienda" className="inline-block mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Pedidos</h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_PAYMENT
          const StatusIcon = cfg.icon
          return (
            <Link
              key={order.id}
              to={`/tienda/orden/${order.id}`}
              className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${cfg.bgColor} rounded-full flex items-center justify-center`}>
                    <StatusIcon size={18} className={cfg.color} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('es-VE')} · {order.items.length} producto(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${(order.totalUsdCents / 100).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color} font-medium`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
