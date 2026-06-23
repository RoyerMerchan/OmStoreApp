import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Plus, Eye, Loader2, AlertTriangle } from 'lucide-react'

interface Layaway {
  id: number
  number: string
  customerName: string
  date: string
  total: number
  paid: number
  balance: number
  dueDate: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-yellow-100 text-yellow-800',
}

export default function LayawaysPage() {
  const [layaways, setLayaways] = useState<Layaway[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadLayaways()
  }, [statusFilter])

  async function loadLayaways() {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const res = await api.get('/layaways', { params })
      if (res.data.success) setLayaways(res.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar apartados')
    } finally {
      setLoading(false)
    }
  }

  const expiredCount = layaways.filter((l) => l.status === 'EXPIRED').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Apartados</h1>
        <Link
          to="/apartados/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Nuevo Apartado
        </Link>
      </div>

      {expiredCount > 0 && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle size={18} className="text-yellow-600" />
          <p className="text-sm text-yellow-800">
            {expiredCount} apartado{expiredCount > 1 ? 's' : ''} vencido{expiredCount > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {['', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'Todos' : s === 'ACTIVE' ? 'Activos' : s === 'COMPLETED' ? 'Completados' : s === 'CANCELLED' ? 'Cancelados' : 'Vencidos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Número</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Pagado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Saldo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Vencimiento</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {layaways.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No hay apartados registrados
                    </td>
                  </tr>
                ) : (
                  layaways.map((l) => (
                    <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{l.number}</td>
                      <td className="py-3 px-4 text-gray-700">{l.customerName}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(l.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right text-gray-900">${l.total?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-gray-900">${l.paid?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-gray-900">${l.balance?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(l.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[l.status]}`}>
                          {l.status === 'ACTIVE' ? 'Activo' : l.status === 'COMPLETED' ? 'Completado' : l.status === 'CANCELLED' ? 'Cancelado' : 'Vencido'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/apartados/${l.id}`}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <Eye size={16} />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
