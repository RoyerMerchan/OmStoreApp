import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, Package, Loader2 } from 'lucide-react'
import { fetchOrder } from '../lib/storeApi'

interface OrderData {
  id: string
  orderNumber: string
  client: { name: string; email: string; clientProfile?: { phone?: string } }
  paymentMethod: string
  paymentReference?: string
  status: string
  subtotalUsdCents: number
  shippingUsdCents: number
  totalUsdCents: number
  exchangeRateUsed: number
  deliveryLocation: { country: string; city: string; zone: string; address: string }
  deliveryType: string
  items: Array<{
    id: string
    quantity: number
    unitPriceUsdCents: number
    variant: { product: { name: string }; size: string; color: string }
  }>
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bgColor: string; message: string }> = {
  PENDING_PAYMENT: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    message: 'Tu pedido está pendiente de confirmación de pago.',
  },
  PAYMENT_DECLARED: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    message: 'Tu comprobante está siendo verificado. Te contactaremos pronto.',
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    message: '¡Tu pedido ha sido confirmado! Lo estamos preparando.',
  },
  PREPARING: {
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    message: 'Tu pedido está siendo preparado para envío.',
  },
  SHIPPED: {
    icon: Package,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    message: 'Tu pedido ha sido enviado. ¡En camino!',
  },
  DELIVERED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    message: '¡Tu pedido ha sido entregado! Gracias por tu compra.',
  },
}

export default function Confirmacion() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchOrder(id)
      .then((res: any) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
  if (!order) return <div className="text-center py-20 text-gray-500">Pedido no encontrado</div>

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_PAYMENT
  const StatusIcon = statusCfg.icon

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 ${statusCfg.bgColor} border-2 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <StatusIcon size={32} className={statusCfg.color} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedido #{order.orderNumber}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_DECLARED'
            ? '¡Pedido recibido!'
            : '¡Pedido confirmado!'}
        </p>
      </div>

      <div className={`p-4 rounded-xl border ${statusCfg.bgColor}`}>
        <p className={`text-sm font-medium ${statusCfg.color}`}>{statusCfg.message}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Detalles del pedido</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Cliente</p>
            <p className="font-medium text-gray-900 dark:text-white">{order.client?.name}</p>
          </div>
          {order.client?.clientProfile?.phone && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Teléfono</p>
              <p className="font-medium text-gray-900 dark:text-white">{order.client.clientProfile.phone}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500 dark:text-gray-400">Entrega</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {order.deliveryLocation.address}, {order.deliveryLocation.zone}, {order.deliveryLocation.city} ({order.deliveryType})
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Método de pago</p>
            <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</p>
          </div>
          {order.paymentReference && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Referencia</p>
              <p className="font-medium text-gray-900 dark:text-white font-mono text-xs">{order.paymentReference}</p>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${(order.subtotalUsdCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span>Envío</span>
              <span>${(order.shippingUsdCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white mt-2">
              <span>Total</span>
              <span>${(order.totalUsdCents / 100).toFixed(2)} USD</span>
            </div>
            {order.exchangeRateUsed > 0 && (
              <p className="text-xs text-gray-400 mt-1 text-right">
                Bs {((order.totalUsdCents / 100) * Number(order.exchangeRateUsed)).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Productos</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {item.variant.product.name} ({item.variant.size}/{item.variant.color}) x{item.quantity}
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                ${(item.unitPriceUsdCents * item.quantity / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          to="/tienda"
          className="flex-1 text-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
        >
          Seguir comprando
        </Link>
        <Link
          to="/tienda/orden"
          className="flex-1 text-center px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
        >
          Ver mis pedidos
        </Link>
      </div>
    </div>
  )
}
