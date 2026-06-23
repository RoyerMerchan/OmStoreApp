import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, Filter, X, Loader2 } from 'lucide-react'
import api from '../lib/axios'

interface Sale {
  id: string
  ticketNumber: string
  createdAt: string
  total: number
  status: string
  customer?: { id: string; name: string }
  user?: { id: string; name: string }
}

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-yellow-100 text-yellow-700',
}

const statusLabels: Record<string, string> = {
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

export default function SalesPage() {
  const navigate = useNavigate()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchSales = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo

      const res = await api.get('/sales', { params })
      const data = res.data
      setSales(data.data ?? [])
      setTotalPages(data.totalPages ?? 1)
      setTotal(data.total ?? 0)
    } catch {
      toast.error('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchSales()
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ticket o cliente..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Todos</option>
                <option value="COMPLETED">Completada</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="REFUNDED">Reembolsada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              <X size={14} />
              Limpiar
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-3">Ticket</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Vendedor</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-center px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="animate-spin text-primary-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => navigate(`/ventas/${sale.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">
                      {sale.ticketNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(sale.createdAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {sale.customer?.name || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">{sale.user?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ${Number(sale.total).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          statusStyles[sale.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusLabels[sale.status] || sale.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages} ({total} registros)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
