import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { fetchOrder } from '../../lib/storeApi'

interface OrderData {
  id: string
  orderNumber: string
  guestName: string
  guestEmail: string
  guestPhone: string
  paymentMethod: string
  status: string
  subtotalUsdCents: number
  totalUsdCents: number
  exchangeRateUsed: number
  deliveryLocation: { country: string; city: string; zone: string; address: string }
  items: Array<{
    id: string
    quantity: number
    unitPriceUsdCents: number
    variant: { product: { name: string }; size: string; color: string }
  }>
}

export default function Confirmacion() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
  if (!order) return <div className="text-center py-20 text-gray-500">Pedido no encontrado</div>

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedido creado</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">N° {order.orderNumber}</p>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mt-6 text-left">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Detalles</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Cliente</p>
            <p className="font-medium text-gray-900 dark:text-white">{order.guestName}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Contacto</p>
            <p className="font-medium text-gray-900 dark:text-white">{order.guestPhone} · {order.guestEmail}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Entrega</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {order.deliveryLocation.address}, {order.deliveryLocation.zone}, {order.deliveryLocation.city}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Método de pago</p>
            <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</p>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ${(order.totalUsdCents / 100).toFixed(2)} USD
            </p>
            <p className="text-sm text-gray-500">
              Bs {(order.totalUsdCents / 100 * Number(order.exchangeRateUsed)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-6 text-left">
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">Próximos pasos</p>
        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
          {order.paymentMethod === 'CASH_ON_DELIVERY'
            ? 'Recibirás una confirmación del asesor. El pago se realiza al recibir el pedido.'
            : 'Tu comprobante será verificado por un asesor. Te contactaremos pronto para coordinar la entrega.'}
        </p>
      </div>

      <div className="mt-6 space-x-3">
        <Link to="/tienda" className="inline-block px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
