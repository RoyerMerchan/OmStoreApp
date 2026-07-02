import { useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Loader2, Download } from 'lucide-react'

const reportTypes = [
  { value: 'sales', label: 'Ventas' },
  { value: 'inventory', label: 'Inventario' },
  { value: 'cash', label: 'Caja' },
  { value: 'layaways', label: 'Apartados' },
  { value: 'profit', label: 'Ganancias' },
]

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate || !endDate) { toast.error('Selecciona el rango de fechas'); return }

    setLoading(true)
    setGenerated(false)
    try {
      const res = await api.get(`/reports/${reportType}`, {
        params: { startDate, endDate },
      })
      if (res.data.success) {
        setResults(res.data.data || [])
        setSummary(res.data.summary || null)
        setGenerated(true)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams({ startDate, endDate })
      const url = `/api/reports/${reportType}/export?${params}`
      const res = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${reportType}_report_${startDate}_${endDate}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success('Reporte exportado')
    } catch {
      toast.error('Error al exportar reporte')
    }
  }

  function renderSummary() {
    if (!summary) return null
    if (reportType === 'sales') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Ingresos Totales</p>
            <p className="text-2xl font-bold text-gray-900">${summary.totalRevenue?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Ventas</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalSales}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Ticket Promedio</p>
            <p className="text-2xl font-bold text-gray-900">${summary.averageTicket?.toLocaleString()}</p>
          </div>
        </div>
      )
    }
    if (reportType === 'profit') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Ingresos</p>
            <p className="text-2xl font-bold text-gray-900">${summary.revenue?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Costos</p>
            <p className="text-2xl font-bold text-red-600">${summary.cost?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Ganancia</p>
            <p className="text-2xl font-bold text-green-600">${summary.profit?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Margen %</p>
            <p className="text-2xl font-bold text-gray-900">{summary.margin?.toFixed(1)}%</p>
          </div>
        </div>
      )
    }
    return null
  }

  function renderTable() {
    if (!results.length) return <p className="text-gray-500 text-sm py-4">Sin resultados</p>
    const keys = Object.keys(results[0])
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {keys.map((k) => (
                <th key={k} className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                {keys.map((k) => (
                  <td key={k} className="py-3 px-4 text-gray-900">
                    {typeof row[k] === 'number' && k !== 'id'
                      ? k.toLowerCase().includes('fecha') || k.toLowerCase().includes('date')
                        ? new Date(row[k]).toLocaleDateString()
                        : `$${row[k]?.toLocaleString()}`
                      : String(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => { setReportType(e.target.value); setGenerated(false) }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {reportTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-start" className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              id="report-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="report-end" className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              id="report-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
        </div>
      )}

      {generated && !loading && (
        <div className="space-y-6">
          {renderSummary()}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Resultados</h2>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={16} />
                Exportar CSV
              </button>
            </div>
            {renderTable()}
          </div>
        </div>
      )}
    </div>
  )
}
