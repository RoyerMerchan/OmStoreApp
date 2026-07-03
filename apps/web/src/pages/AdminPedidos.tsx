import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/axios'

interface StoreOrder {
  id: string
  orderNumber: string
  guestName: string
  guestEmail: string
  guestPhone: string
  paymentMethod: string
  status: string
  totalUsdCents: number
  createdAt: string
  deliveryLocation: { country: string; city: string; zone: string; address: string }
  items: Array<{
    quantity: number
    unitPriceUsdCents: number
    variant: { product: { name: string }; size: string; color: string }
  }>
  paymentProofs: Array<{
    id: string
    method: string
    reference: string
    proofFileUrl: string | null
    declaredAmount: number
    currency: string
    verified: boolean
  }>
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
  PENDING_PAYMENT: 'bg-gray-100 text-gray-600',
  PAYMENT_DECLARED: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<StoreOrder | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filter) params.status = filter
      const res = await api.get('/admin/store/orders', { params })
      setOrders(res.data.data ?? [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { loadOrders() }, [loadOrders])

  async function updateStatus(orderId: string, status: string) {
    try {
      await api.patch(`/admin/store/orders/${orderId}/status`, { status })
      setSelected(null)
      loadOrders()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos Online</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Todos</option>
          <option value="PAYMENT_DECLARED">Pago declarado</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="PREPARING">Preparando</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="PENDING_PAYMENT">Pendiente pago</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-600" size={24} /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No hay pedidos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <tr>
                  <th className="text-left px-4 py-3">N°</th>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Contacto</th>
                  <th className="text-left px-4 py-3">Pago</th>
                  <th className="text-center px-4 py-3">Estado</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-center px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.guestName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {o.guestPhone}<br/><span className="text-xs">{o.guestEmail}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.paymentMethod}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      ${(o.totalUsdCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelected(o)}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg"
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

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl p-6 mt-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pedido #{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" aria-label="Cerrar"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Cliente</p>
                <p className="font-medium text-gray-900 dark:text-white">{selected.guestName}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Contacto</p>
                <p className="font-medium text-gray-900 dark:text-white">{selected.guestPhone} · {selected.guestEmail}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 dark:text-gray-400">Entrega</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selected.deliveryLocation.address}, {selected.deliveryLocation.zone}, {selected.deliveryLocation.city}, {selected.deliveryLocation.country}
                </p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Productos</h3>
            <table className="w-full text-sm mb-4">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-left px-3 py-2">Talla/Color</th>
                  <th className="text-center px-3 py-2">Cant</th>
                  <th className="text-right px-3 py-2">Precio</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{item.variant.product.name}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{item.variant.size} / {item.variant.color}</td>
                    <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">${(item.unitPriceUsdCents / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selected.paymentProofs.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Comprobante(s)</h3>
                {selected.paymentProofs.map((p, i) => (
                  <div key={i} className="text-sm text-gray-600 dark:text-gray-400 mb-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p><span className="font-medium">{p.method}</span> — {p.reference}</p>
                    <p>Monto: {p.declaredAmount} {p.currency} {p.verified ? '✅ Verificado' : '⏳ Pendiente'}</p>
                    {p.proofFileUrl && <a href={p.proofFileUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-xs">Ver captura</a>}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-900 dark:text-white">${(selected.totalUsdCents / 100).toFixed(2)} USD</span>
              <div className="flex gap-2">
                {selected.status === 'PAYMENT_DECLARED' && (
                  <>
                    <button onClick={() => updateStatus(selected.id, 'REJECTED')} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">Rechazar</button>
                    <button onClick={() => updateStatus(selected.id, 'CONFIRMED')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Confirmar</button>
                  </>
                )}
                {selected.status === 'CONFIRMED' && (
                  <button onClick={() => updateStatus(selected.id, 'PREPARING')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Preparando</button>
                )}
                {selected.status === 'PREPARING' && (
                  <button onClick={() => updateStatus(selected.id, 'SHIPPED')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Enviar</button>
                )}
                {selected.status === 'SHIPPED' && (
                  <button onClick={() => updateStatus(selected.id, 'DELIVERED')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Entregar</button>
                )}
                {selected.status === 'PENDING_PAYMENT' && selected.paymentMethod === 'CASH_ON_DELIVERY' && (
                  <button onClick={() => updateStatus(selected.id, 'CONFIRMED')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Confirmar</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
