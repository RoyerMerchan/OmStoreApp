import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Wallet,
  Plus,
  Minus,
  X,
  Loader2,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
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
  closingAmount?: number
  openedAt: string
  closedAt?: string
  notes?: string
  user?: { id: string; name: string }
  movements: CashMovement[]
  sales: { id: string; total: number }[]
  expenses: CashMovement[]
}

export default function CashPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<CashSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [movementType, setMovementType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [movementDesc, setMovementDesc] = useState('')
  const [movementAmount, setMovementAmount] = useState(0)
  const [addingMovement, setAddingMovement] = useState(false)

  const fetchSession = async () => {
    try {
      const res = await api.get('/cash/current')
      setSession(res.data.data)
    } catch {
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [])

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!movementDesc.trim() || movementAmount <= 0) {
      toast.error('Completa todos los campos')
      return
    }
    setAddingMovement(true)
    try {
      await api.post('/cash/movements', {
        type: movementType,
        description: movementDesc,
        amount: movementAmount,
      })
      toast.success('Movimiento registrado')
      setShowMovementModal(false)
      setMovementDesc('')
      setMovementAmount(0)
      fetchSession()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al registrar movimiento'
      toast.error(msg)
    } finally {
      setAddingMovement(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (!session || session.status !== 'OPEN') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Wallet size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700">No hay caja abierta</h2>
        <p className="text-gray-500">Abre una caja para comenzar a registrar movimientos</p>
        <a
          href="/caja/abrir"
          className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Abrir Caja
        </a>
      </div>
    )
  }

  const totalSalesCash = session.sales?.reduce((sum, s) => sum + s.total, 0) ?? 0
  const totalIncomes =
    session.movements?.filter((m) => m.type === 'INCOME').reduce((sum, m) => sum + m.amount, 0) ?? 0
  const totalExpenses =
    session.movements?.filter((m) => m.type === 'EXPENSE').reduce((sum, m) => sum + m.amount, 0) ?? 0
  const expectedTotal = session.openingAmount + totalSalesCash + totalIncomes - totalExpenses

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMovementType('INCOME')
              setShowMovementModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Ingreso
          </button>
          <button
            onClick={() => {
              setMovementType('EXPENSE')
              setShowMovementModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <Minus size={16} />
            Egreso
          </button>
          <a
            href="/caja/cerrar"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Cerrar Caja
          </a>
        </div>
      </div>

      {/* Status card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-primary-600" />
            <span className="text-xs text-gray-500 uppercase font-semibold">Estado</span>
          </div>
          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Abierta
          </span>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-xs text-gray-500 uppercase font-semibold">Apertura</span>
          </div>
          <p className="text-lg font-bold">
            ${Number(session.openingAmount).toLocaleString('es-CO')}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(session.openedAt).toLocaleString('es-CO')}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={16} className="text-blue-600" />
            <span className="text-xs text-gray-500 uppercase font-semibold">Ventas</span>
          </div>
          <p className="text-lg font-bold">{session.sales?.length ?? 0}</p>
          <p className="text-xs text-gray-500">
            ${Number(totalSalesCash).toLocaleString('es-CO')} en ventas
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-gray-600" />
            <span className="text-xs text-gray-500 uppercase font-semibold">Esperado</span>
          </div>
          <p className="text-lg font-bold">
            ${Number(expectedTotal).toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movements */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Movimientos Manuales</h3>
          </div>
          {session.movements && session.movements.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {session.movements.map((m) => (
                <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {m.type === 'INCOME' ? (
                      <ArrowUpRight size={16} className="text-green-600" />
                    ) : (
                      <ArrowDownRight size={16} className="text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{m.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(m.createdAt).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      m.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {m.type === 'INCOME' ? '+' : '-'}${Number(m.amount).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">Sin movimientos</div>
          )}
        </div>

        {/* Recent sales */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Ventas en esta sesión</h3>
          </div>
          {session.sales && session.sales.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {session.sales.map((s, i) => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">#{(i + 1).toString().padStart(3, '0')}</span>
                  <span className="text-sm font-medium">
                    ${Number(s.total).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">Sin ventas en esta sesión</div>
          )}
        </div>
      </div>

      {/* Add movement modal */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {movementType === 'INCOME' ? 'Agregar Ingreso' : 'Agregar Egreso'}
              </h2>
              <button
                onClick={() => setShowMovementModal(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMovement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={movementDesc}
                  onChange={(e) => setMovementDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ej: Pago de servicios"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min={1}
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingMovement}
                  className={`flex-1 py-2.5 text-white font-medium rounded-lg disabled:opacity-50 ${
                    movementType === 'INCOME'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {addingMovement
                    ? 'Guardando...'
                    : movementType === 'INCOME'
                    ? 'Registrar Ingreso'
                    : 'Registrar Egreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
