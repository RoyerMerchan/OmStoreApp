import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Movement {
  id: number
  type: string
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  createdAt: string
  productName: string
  size: string
  color: string
  userName: string
}

const MOVEMENT_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'SALE', label: 'Venta' },
  { value: 'SALE_CANCELLATION', label: 'Cancelación venta' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
  { value: 'RETURN', label: 'Devolución' },
  { value: 'TRANSFER_IN', label: 'Transferencia entrada' },
  { value: 'TRANSFER_OUT', label: 'Transferencia salida' },
  { value: 'MANUAL_IN', label: 'Entrada manual' },
  { value: 'MANUAL_OUT', label: 'Salida manual' },
  { value: 'INITIAL', label: 'Stock inicial' },
]

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const params: any = {}
      if (type) params.type = type
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      if (search) params.search = search

      const res = await api.get('/inventory/movements', { params })
      if (res.data.success) {
        setMovements(res.data.data)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar movimientos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 400)
    return () => clearTimeout(timer)
  }, [type, dateFrom, dateTo, search])

  function getTypeBadge(type: string) {
    const entry = MOVEMENT_TYPES.find((m) => m.value === type)
    const label = entry?.label || type
    const isIn = ['PURCHASE', 'SALE_CANCELLATION', 'RETURN', 'TRANSFER_IN', 'MANUAL_IN', 'INITIAL'].includes(type)
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          isIn
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/inventario"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Movimientos de stock</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Producto, SKU..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo movimiento</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              {MOVEMENT_TYPES.map((mt) => (
                <option key={mt.value} value={mt.value}>
                  {mt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Sin movimientos</p>
            <p className="text-sm mt-1">No se encontraron movimientos con los filtros actuales</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha/Hora</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Producto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Talla/Color</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tipo</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Cantidad</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Stock anterior</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Stock nuevo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Razón</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{m.productName}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {m.size} / {m.color}
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(m.type)}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      <span
                        className={
                          m.quantity > 0
                            ? 'text-green-600'
                            : m.quantity < 0
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }
                      >
                        {m.quantity > 0 ? '+' : ''}
                        {m.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{m.previousStock}</td>
                    <td className="py-3 px-4 text-right text-gray-900">{m.newStock}</td>
                    <td className="py-3 px-4 text-gray-600">{m.userName}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate" title={m.reason}>
                      {m.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
