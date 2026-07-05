import { useState, useEffect, useCallback } from 'react'
import { Loader2, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/axios'

interface StoreOrder {
  id: string
  orderNumber: string
  clientId: string
  client: {
    id: string
    name: string
    email: string
    clientProfile?: { phone?: string; address?: string; city?: string; state?: string }
  }
  deliveryLocation: { country: string; city: string; zone: string; address: string }
  deliveryType: string
  paymentMethod: string
  paymentReference?: string
  paymentDate?: string
  status: string
  subtotalUsdCents: number
  shippingUsdCents: number
  totalUsdCents: number
  exchangeRateUsed: number
  notes?: string
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    unitPriceUsdCents: number
    variant: { product: { name: string; imageUrl?: string }; size: string; color: string }
  }>
  paymentProof?: {
    id: string
    method: string
    reference: string
    proofFileUrl?: string
    declaredAmount: number
    currency: string
    verified: boolean
    uploadedAt: string
  } | null
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente pago',
  PAYMENT_DECLARED: 'Pago declarado',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rechazado',
}

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  PAYMENT_DECLARED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PREPARING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  SHIPPED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<StoreOrder | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/admin/store/orders', { params })
      setOrders(res.data.data ?? [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { loadOrders() }, [loadOrders])

  async function updateStatus(orderId: string, status: string) {
    try {
      await api.patch(`/admin/store/orders/${orderId}/status`, { status })
      toast.success(`Pedido ${status === 'CONFIRMED' ? 'confirmado' : status === 'REJECTED' ? 'rechazado' : 'actualizado'}`)
      setSelected(null)
      loadOrders()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
    }
  }

  function formatCurrency(cents: number, currency = 'USD') {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(cents / 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos Online</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING_PAYMENT">Pendiente pago</option>
          <option value="PAYMENT_DECLARED">Pago declarado</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="PREPARING">Preparando</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="REJECTED">Rechazado</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-600" size={24} /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No hay pedidos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">N° Orden</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Contacto</th>
                  <th className="text-left px-4 py-3 font-medium">Método</th>
                  <th className="text-center px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Fecha</th>
                  <th className="text-center px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{o.client?.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <div>{o.client?.clientProfile?.phone || '—'}</div>
                      <div className="text-xs">{o.client?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <div>{o.paymentMethod}</div>
                      {o.paymentReference && <div className="text-xs text-gray-400">{o.paymentReference}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      ${(o.totalUsdCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(o.createdAt).toLocaleDateString('es-VE')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelected(o)}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pedido #{selected.orderNumber}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(selected.createdAt).toLocaleString('es-VE')}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Cliente</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selected.client?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-gray-700 dark:text-gray-300">{selected.client?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Teléfono</p>
                  <p className="text-gray-700 dark:text-gray-300">{selected.client?.clientProfile?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Método de pago</p>
                  <p className="text-gray-700 dark:text-gray-300">{selected.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Dirección de entrega</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selected.deliveryLocation.address}, {selected.deliveryLocation.zone}, {selected.deliveryLocation.city}, {selected.deliveryLocation.country}
                  </p>
                </div>
                {selected.paymentReference && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Referencia de pago</p>
                    <p className="text-gray-700 dark:text-gray-300">{selected.paymentReference}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Productos</h3>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {item.variant.product.imageUrl && (
                        <img src={item.variant.product.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{item.variant.product.name}</p>
                        <p className="text-xs text-gray-500">Talla {item.variant.size} / {item.variant.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">x{item.quantity}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.unitPriceUsdCents)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.paymentProof && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Comprobante de pago</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${selected.paymentProof.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {selected.paymentProof.verified ? 'Verificado' : 'Pendiente verificación'}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Método:</span> {selected.paymentProof.method}</p>
                    <p><span className="text-gray-500">Referencia:</span> {selected.paymentProof.reference}</p>
                    <p><span className="text-gray-500">Monto:</span> {formatCurrency(selected.paymentProof.declaredAmount * 100)} {selected.paymentProof.currency}</p>
                    <p><span className="text-gray-500">Fecha:</span> {new Date(selected.paymentProof.uploadedAt).toLocaleString('es-VE')}</p>
                    {selected.paymentProof.proofFileUrl && (
                      <a
                        href={selected.paymentProof.proofFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-sm text-primary-600 hover:underline"
                      >
                        Ver comprobante →
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span><span>{formatCurrency(selected.subtotalUsdCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Envío</span><span>{formatCurrency(selected.shippingUsdCents)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                    <span>Total</span><span>{formatCurrency(selected.totalUsdCents)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selected.status === 'PAYMENT_DECLARED' && (
                    <>
                      <button
                        onClick={() => updateStatus(selected.id, 'REJECTED')}
                        className="px-4 py-2 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => updateStatus(selected.id, 'CONFIRMED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        Confirmar pago
                      </button>
                    </>
                  )}
                  {selected.status === 'PENDING_PAYMENT' && selected.paymentMethod === 'CASH_ON_DELIVERY' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'CONFIRMED')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                  {selected.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'PREPARING')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm transition-colors"
                    >
                      Marcar preparando
                    </button>
                  )}
                  {selected.status === 'PREPARING' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'SHIPPED')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm transition-colors"
                    >
                      Marcar enviado
                    </button>
                  )}
                  {selected.status === 'SHIPPED' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'DELIVERED')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                    >
                      Marcar entregado
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
