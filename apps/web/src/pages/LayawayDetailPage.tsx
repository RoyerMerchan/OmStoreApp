import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'

interface LayawayItem {
  productName: string
  size: string
  color: string
  quantity: number
  unitPrice: number
}

interface Payment {
  id: number
  date: string
  method: string
  amount: number
  reference: string
}

interface Layaway {
  id: number
  number: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  customerId: number
  customerName: string
  customerDocument: string
  customerPhone: string
  customerEmail: string
  total: number
  paid: number
  balance: number
  dueDate: string
  notes: string
  createdAt: string
  items: LayawayItem[]
  payments: Payment[]
  relatedSaleId: number | null
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-yellow-100 text-yellow-800',
}

export default function LayawayDetailPage() {
  const { id } = useParams()
  const [layaway, setLayaway] = useState<Layaway | null>(null)
  const [loading, setLoading] = useState(true)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    loadLayaway()
  }, [id])

  async function loadLayaway() {
    setLoading(true)
    try {
      const res = await api.get(`/layaways/${id}`)
      if (res.data.success) setLayaway(res.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar apartado')
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!paymentAmount || paymentAmount <= 0) { toast.error('Ingresa un monto válido'); return }
    setPaymentLoading(true)
    try {
      const res = await api.post(`/layaways/${id}/payments`, { amount: paymentAmount, method: paymentMethod, reference: paymentReference })
      if (res.data.success) {
        toast.success('Abono registrado')
        setShowPaymentModal(false)
        setPaymentAmount(0)
        setPaymentReference('')
        loadLayaway()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar abono')
    } finally {
      setPaymentLoading(false)
    }
  }

  async function handleComplete() {
    try {
      const res = await api.post(`/layaways/${id}/complete`)
      if (res.data.success) {
        toast.success('Apartado completado exitosamente')
        loadLayaway()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al completar apartado')
    }
  }

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault()
    if (!cancelReason) { toast.error('Ingresa el motivo de cancelación'); return }
    setCancelLoading(true)
    try {
      const res = await api.post(`/layaways/${id}/cancel`, { reason: cancelReason })
      if (res.data.success) {
        toast.success('Apartado cancelado')
        setShowCancelModal(false)
        setCancelReason('')
        loadLayaway()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cancelar apartado')
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    )
  }

  if (!layaway) {
    return (
      <div className="text-center py-12 text-gray-500">
        Apartado no encontrado
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Apartado {layaway.number}</h1>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusColors[layaway.status]}`}>
            {layaway.status === 'ACTIVE' ? 'Activo' : layaway.status === 'COMPLETED' ? 'Completado' : layaway.status === 'CANCELLED' ? 'Cancelado' : 'Vencido'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-500">Producto</th>
                    <th className="text-left py-2 font-medium text-gray-500">Talla</th>
                    <th className="text-left py-2 font-medium text-gray-500">Color</th>
                    <th className="text-right py-2 font-medium text-gray-500">Cantidad</th>
                    <th className="text-right py-2 font-medium text-gray-500">Precio</th>
                    <th className="text-right py-2 font-medium text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {layaway.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{item.productName}</td>
                      <td className="py-2 text-gray-600">{item.size}</td>
                      <td className="py-2 text-gray-600">{item.color}</td>
                      <td className="py-2 text-right text-gray-900">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-900">${item.unitPrice?.toLocaleString()}</td>
                      <td className="py-2 text-right text-gray-900 font-medium">${(item.unitPrice * item.quantity)?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Abonos</h2>
            {layaway.payments.length === 0 ? (
              <p className="text-gray-500 text-sm">Sin abonos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-500">Fecha</th>
                      <th className="text-left py-2 font-medium text-gray-500">Método</th>
                      <th className="text-right py-2 font-medium text-gray-500">Monto</th>
                      <th className="text-left py-2 font-medium text-gray-500">Referencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layaway.payments.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100">
                        <td className="py-2 text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="py-2 text-gray-700">{p.method}</td>
                        <td className="py-2 text-right text-gray-900">${p.amount?.toLocaleString()}</td>
                        <td className="py-2 text-gray-500">{p.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{layaway.customerName}</p>
              <p className="text-gray-600">{layaway.customerDocument}</p>
              <p className="text-gray-600">{layaway.customerPhone}</p>
              {layaway.customerEmail && <p className="text-gray-600">{layaway.customerEmail}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">${layaway.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Pagado</span>
                <span className="font-medium text-green-600">${layaway.paid?.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                <span className="font-medium text-gray-700">Saldo Pendiente</span>
                <span className="font-bold text-gray-900">${layaway.balance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vencimiento</span>
                <span className="text-gray-900">{new Date(layaway.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {layaway.status === 'ACTIVE' && (
            <div className="space-y-3">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <CreditCard size={18} />
                Registrar Abono
              </button>
              <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={18} />
                Completar
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle size={18} />
                Cancelar
              </button>
            </div>
          )}

          {layaway.status === 'COMPLETED' && layaway.relatedSaleId && (
            <Link
              to={`/ventas/${layaway.relatedSaleId}`}
              className="block text-center px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              Ver venta relacionada #{layaway.relatedSaleId}
            </Link>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar Abono</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  min={0.01}
                  step={0.01}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="NEQUI">Nequi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Opcional"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {paymentLoading && <Loader2 className="animate-spin" size={16} />}
                  {paymentLoading ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cancelar Apartado</h2>
            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Cancelación</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder="Explica el motivo..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelLoading && <Loader2 className="animate-spin" size={16} />}
                  {cancelLoading ? 'Cancelando...' : 'Cancelar Apartado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
