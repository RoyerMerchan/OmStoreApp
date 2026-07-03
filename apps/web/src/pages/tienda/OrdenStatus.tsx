import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, Loader2, Search } from 'lucide-react'
import { fetchOrder } from '../../lib/storeApi'

interface OrderData {
  id: string
  orderNumber: string
  guestName: string
  guestPhone: string
  status: string
  paymentMethod: string
  subtotalUsdCents: number
  totalUsdCents: number
  exchangeRateUsed: number
  createdAt: string
  deliveryLocation: { country: string; city: string; zone: string; address: string }
  items: Array<{
    quantity: number
    unitPriceUsdCents: number
    variant: { product: { name: string }; size: string; color: string }
  }>
  paymentProofs: Array<{ method: string; reference: string; verified: boolean }>
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAYMENT_DECLARED: 'Pago declarado — en verificación',
  CONFIRMED: 'Confirmado — preparando pedido',
  PREPARING: 'En preparación',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rechazado',
}

const STATUS_STEPS = ['PENDING_PAYMENT', 'PAYMENT_DECLARED', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']

export default function OrdenStatus() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [manualId, setManualId] = useState('')

  useEffect(() => {
    if (!id) { setLoading(false); return }
    fetchOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!manualId.trim()) return
    window.location.href = `/tienda/orden/${manualId.trim()}`
  }

  if (!id) {
    return (
      <div className="max-w-md mx-auto text-center">
        <Package size={48} className="mx-auto mb-4 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Buscar pedido</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="ID del pedido..."
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Search size={18} />
          </button>
        </form>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
  if (!order) return <div className="text-center py-20 text-gray-500">Pedido no encontrado</div>

  const currentStepIdx = STATUS_STEPS.indexOf(order.status)
  const totalBs = order.totalUsdCents / 100 * Number(order.exchangeRateUsed)

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedido #{order.orderNumber}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>

      {/* Status badge */}
      <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
        order.status === 'DELIVERED' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
        order.status === 'CANCELLED' || order.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
        'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
      }`}>
        {STATUS_LABELS[order.status] || order.status}
      </div>

      {/* Progress steps */}
      {currentStepIdx >= 0 && order.status !== 'CANCELLED' && order.status !== 'REJECTED' && (
        <div className="mt-6 space-y-2">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i <= currentStepIdx ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i <= currentStepIdx ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                {STATUS_LABELS[step]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mt-6 space-y-3 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Cliente</p>
          <p className="font-medium text-gray-900 dark:text-white">{order.guestName} · {order.guestPhone}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Entrega</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {order.deliveryLocation.address}, {order.deliveryLocation.zone}, {order.deliveryLocation.city}, {order.deliveryLocation.country}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Pago</p>
          <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</p>
          {order.paymentProofs?.map((p, i) => (
            <p key={i} className="text-xs text-gray-500">Ref: {p.reference} {p.verified ? '✅ Verificado' : '⏳ Pendiente'}</p>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">${(order.totalUsdCents / 100).toFixed(2)} USD</p>
          <p className="text-sm text-gray-500">Bs {totalBs.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 space-x-3">
        <Link to="/tienda" className="inline-block px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
