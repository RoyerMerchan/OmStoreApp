import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, X, Loader2 } from 'lucide-react'
import api from '../lib/axios'

interface SaleItem {
  id: string
  product: { name: string }
  variant: { size: string; color: string }
  quantity: number
  price: number
  discount: number
}

interface SalePayment {
  id: string
  method: string
  amount: number
  reference?: string
}

interface SaleData {
  id: string
  ticketNumber: string
  createdAt: string
  status: string
  total: number
  discount: number
  customer?: { id: string; name: string; email: string; phone: string }
  user?: { id: string; name: string }
  items: SaleItem[]
  payments: SalePayment[]
}

const statusLabels: Record<string, string> = {
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-yellow-100 text-yellow-700',
}

const methodLabels: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  MOBILE_PAYMENT: 'Pago Móvil',
  MIXED: 'Mixto',
}

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [sale, setSale] = useState<SaleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await api.get(`/sales/${id}`)
        setSale(res.data.data)
      } catch {
        toast.error('Error al cargar venta')
        navigate('/ventas')
      } finally {
        setLoading(false)
      }
    }
    fetchSale()
  }, [id, navigate])

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Indica el motivo de cancelación')
      return
    }
    setCancelling(true)
    try {
      await api.post(`/sales/${id}/cancel`, { reason: cancelReason })
      toast.success('Venta cancelada exitosamente')
      setShowCancelModal(false)
      // Refresh
      const res = await api.get(`/sales/${id}`)
      setSale(res.data.data)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al cancelar venta'
      toast.error(msg)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (!sale) return null

  const subtotal = sale.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemDiscountTotal = sale.items.reduce(
    (sum, item) => sum + (item.price * item.quantity * item.discount) / 100,
    0
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/ventas')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Venta {sale.ticketNumber}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date(sale.createdAt).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusStyles[sale.status] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {statusLabels[sale.status] || sale.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left + Center: items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & User info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Cliente</h3>
              {sale.customer ? (
                <>
                  <p className="font-medium">{sale.customer.name}</p>
                  {sale.customer.email && <p className="text-sm text-gray-500">{sale.customer.email}</p>}
                  {sale.customer.phone && <p className="text-sm text-gray-500">{sale.customer.phone}</p>}
                </>
              ) : (
                <p className="text-sm text-gray-400">Consumidor final</p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Vendedor</h3>
              <p className="font-medium">{sale.user?.name || '—'}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Productos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left px-4 py-2">Producto</th>
                    <th className="text-left px-4 py-2">Talla</th>
                    <th className="text-left px-4 py-2">Color</th>
                    <th className="text-right px-4 py-2">Cantidad</th>
                    <th className="text-right px-4 py-2">Precio</th>
                    <th className="text-right px-4 py-2">Desc %</th>
                    <th className="text-right px-4 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sale.items.map((item) => {
                    const lineSubtotal = item.price * item.quantity
                    const lineDiscount = (lineSubtotal * item.discount) / 100
                    const lineTotal = lineSubtotal - lineDiscount
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm font-medium">{item.product.name}</td>
                        <td className="px-4 py-2 text-sm">{item.variant.size}</td>
                        <td className="px-4 py-2 text-sm">{item.variant.color}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          ${Number(item.price).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">{item.discount}%</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          ${Number(lineTotal).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Pagos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left px-4 py-2">Método</th>
                    <th className="text-right px-4 py-2">Monto</th>
                    <th className="text-left px-4 py-2">Referencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sale.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 text-sm">{methodLabels[p.method] || p.method}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium">
                        ${Number(p.amount).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">{p.reference || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Totals & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${Number(subtotal).toLocaleString('es-CO')}</span>
              </div>
              {itemDiscountTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuentos</span>
                  <span>-${Number(itemDiscountTotal).toLocaleString('es-CO')}</span>
                </div>
              )}
              {sale.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desc. global ({sale.discount}%)</span>
                  <span>
                    -$
                    {Number((subtotal - itemDiscountTotal) * (sale.discount / 100)).toLocaleString('es-CO')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${Number(sale.total).toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          {sale.status === 'COMPLETED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-2.5 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancelar Venta
            </button>
          )}
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cancelar Venta</h2>
              <button onClick={() => setShowCancelModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de cancelar la venta {sale.ticketNumber}? Esta acción devolverá el stock.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de cancelación</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              rows={3}
              placeholder="Ej: Cliente insatisfecho..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
