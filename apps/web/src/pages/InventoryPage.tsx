import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Search, Loader2, AlertTriangle, ToggleLeft, ToggleRight, Package } from 'lucide-react'

interface InventoryItem {
  id: number
  productName: string
  size: string
  color: string
  sku: string
  stock: number
  reservedStock: number
  minStock: number
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const params: any = {}
      if (search) params.search = search
      if (lowStockOnly) params.lowStock = true

      const res = await api.get('/inventory', { params })
      if (res.data.success) {
        setItems(res.data.data)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 400)
    return () => clearTimeout(timer)
  }, [search, lowStockOnly])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <Link
          to="/inventario/movimientos"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Ver movimientos
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              lowStockOnly
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {lowStockOnly ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            Bajo stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Sin resultados</p>
            <p className="text-sm mt-1">
              {lowStockOnly
                ? 'No hay productos con bajo stock'
                : 'No se encontraron productos'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Producto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Talla</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Color</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">SKU</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Reservado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Disponible</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const available = item.stock - item.reservedStock
                  const isLow = item.stock <= item.minStock
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isLow ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                        {item.productName}
                        {isLow && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.size}</td>
                      <td className="py-3 px-4 text-gray-600">{item.color}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{item.sku}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{item.stock}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{item.reservedStock}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        <span className={available <= 0 ? 'text-red-600' : 'text-green-600'}>
                          {available}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">{item.minStock}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
