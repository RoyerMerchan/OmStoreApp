import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Search, Download, Loader2 } from 'lucide-react'

interface SizeSummary {
  size: string
  count: number
}

interface Product {
  id: number
  name: string
  brand: string
  color: string
  size: string
  gender: string
  price: number
  stock: number
  image?: string
}

export default function CatalogPage() {
  const [sizeSummary, setSizeSummary] = useState<SizeSummary[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [gender, setGender] = useState('')
  const [brands, setBrands] = useState<string[]>([])

  useEffect(() => {
    loadCatalog()
  }, [])

  useEffect(() => {
    if (selectedSize) loadProducts()
  }, [selectedSize, search, brand, gender])

  async function loadCatalog() {
    setLoading(true)
    try {
      const res = await api.get('/catalog')
      if (res.data.success) {
        setSizeSummary(res.data.sizeSummary || [])
        setBrands(res.data.brands || [])
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar catálogo')
    } finally {
      setLoading(false)
    }
  }

  async function loadProducts() {
    try {
      const params: any = { size: selectedSize }
      if (search) params.search = search
      if (brand) params.brand = brand
      if (gender) params.gender = gender
      const res = await api.get('/catalog', { params })
      if (res.data.success) setProducts(res.data.data)
    } catch { /* ignore */ }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams()
      if (selectedSize) params.set('size', selectedSize)
      if (brand) params.set('brand', brand)
      if (gender) params.set('gender', gender)
      const url = `/api/catalog/export?${params}`
      const res = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'catalogo.csv'
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success('Catálogo exportado')
    } catch {
      toast.error('Error al exportar catálogo')
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Catálogo OmStore</h1>
        <p className="text-gray-500">Explora nuestros productos por talla</p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tallas</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {sizeSummary.map((s, i) => (
              <button
                key={s.size}
                onClick={() => setSelectedSize(selectedSize === s.size ? '' : s.size)}
                className={`
                  inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium border-2 transition-all
                  ${selectedSize === s.size
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600 shadow-sm'
                  }
                `}
              >
                {s.size}
                <span className={`
                  inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold
                  ${selectedSize === s.size ? 'bg-white text-primary-600' : 'bg-primary-100 text-primary-600'}
                `}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSize && (
        <>
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              <option value="">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              <option value="">Todos los géneros</option>
              <option value="MALE">Hombre</option>
              <option value="FEMALE">Mujer</option>
              <option value="UNISEX">Unisex</option>
              <option value="KIDS">Niños</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Exportar Catálogo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className={`h-40 ${colors[i % colors.length]} flex items-center justify-center`}>
                  <span className="text-3xl font-bold text-white opacity-50">
                    {getInitials(product.name)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{product.color} · {product.size}</span>
                    <span className="font-bold text-primary-600">${product.price?.toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      product.stock > 5
                        ? 'bg-green-100 text-green-700'
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No se encontraron productos para esta talla
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
