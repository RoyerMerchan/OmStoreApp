import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Calculator } from 'lucide-react'
import api from '../lib/axios'

interface CashMovement {
  id: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  createdAt: string
}

interface CashSession {
  id: string
  status: string
  openingAmount: number
  openedAt: string
  user?: { id: string; name: string }
  movements: CashMovement[]
  sales: { id: string; total: number }[]
}

export default function CloseCashPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<CashSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [closingAmount, setClosingAmount] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get('/cash/current')
        if (res.data.data?.status !== 'OPEN') {
          toast.error('No hay caja abierta')
          navigate('/caja')
          return
        }
        setSession(res.data.data)
        setClosingAmount(res.data.data.openingAmount)
      } catch {
        toast.error('Error al cargar sesión de caja')
        navigate('/caja')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (closingAmount <= 0) {
      toast.error('El monto contado debe ser mayor a 0')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/cash/close', {
        closingAmount,
        notes: notes.trim() || undefined,
      })
      toast.success('Caja cerrada exitosamente')
      navigate('/caja')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al cerrar caja'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (!session) return null

  const totalSalesCash = session.sales?.reduce((sum, s) => sum + s.total, 0) ?? 0
  const totalIncomes =
    session.movements?.filter((m) => m.type === 'INCOME').reduce((sum, m) => sum + m.amount, 0) ?? 0
  const totalExpenses =
    session.movements?.filter((m) => m.type === 'EXPENSE').reduce((sum, m) => sum + m.amount, 0) ?? 0
  const expectedTotal = session.openingAmount + totalSalesCash + totalIncomes - totalExpenses
  const difference = closingAmount - expectedTotal

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/caja')}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Cerrar Caja</h1>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calculator size={16} />
          Resumen de la sesión
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Monto apertura</span>
            <span className="font-medium">
              ${Number(session.openingAmount).toLocaleString('es-CO')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ventas en sesión</span>
            <span className="font-medium text-blue-600">
              +${Number(totalSalesCash).toLocaleString('es-CO')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ingresos manuales</span>
            <span className="font-medium text-green-600">
              +${Number(totalIncomes).toLocaleString('es-CO')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Egresos manuales</span>
            <span className="font-medium text-red-600">
              -${Number(totalExpenses).toLocaleString('es-CO')}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold">
            <span>Total esperado</span>
            <span>${Number(expectedTotal).toLocaleString('es-CO')}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto Contado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                type="number"
                min={1}
                step={100}
                value={closingAmount}
                onChange={(e) => setClosingAmount(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="0"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Difference indicator */}
          {closingAmount > 0 && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                difference === 0
                  ? 'bg-green-50 text-green-700'
                  : difference > 0
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <div className="flex justify-between">
                <span>Diferencia</span>
                <span>
                  {difference >= 0 ? '+' : ''}${Number(difference).toLocaleString('es-CO')}
                </span>
              </div>
              <p className="text-xs mt-1 opacity-75">
                {difference === 0
                  ? 'Coincide con el total esperado'
                  : difference > 0
                  ? 'Sobra dinero en caja'
                  : 'Falta dinero en caja'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              rows={4}
              placeholder="Notas sobre el cierre..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Cerrando caja...
              </>
            ) : (
              'Cerrar Caja'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
