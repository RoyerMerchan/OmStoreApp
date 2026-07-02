import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Edit,
  Grid3X3,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Brand {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  brand: { id: number; name: string }
  category: { id: number; name: string }
  gender: string
  basePrice: number
  variantsCount: number
  isActive: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') || ''
  const brandId = searchParams.get('brandId') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const gender = searchParams.get('gender') || ''
  const isActive = searchParams.get('isActive') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    loadFilters()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [searchParams])

  async function loadFilters() {
    try {
      const [brRes, catRes] = await Promise.all([
        api.get('/brands'),
        api.get('/categories'),
      ])
      if (brRes.data.success) setBrands(brRes.data.data)
      if (catRes.data.success) setCategories(catRes.data.data)
    } catch {
      // silent
    }
  }

  async function loadProducts() {
    setLoading(true)
    try {
      const params: any = { page, limit: 20 }
      if (search) params.search = search
      if (brandId) params.brandId = brandId
      if (categoryId) params.categoryId = categoryId
      if (gender) params.gender = gender
      if (isActive) params.isActive = isActive

      const res = await api.get('/products', { params })
      if (res.data.success) {
        setProducts(res.data.data.products || res.data.data)
        if (res.data.data.pagination) {
          setPagination(res.data.data.pagination)
        } else if (res.data.pagination) {
          setPagination(res.data.pagination)
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    setSearchParams(params)
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    setSearchParams(params)
  }

  const genderOptions = [
    { value: '', label: 'Todos' },
    { value: 'MEN', label: 'Hombre' },
    { value: 'WOMEN', label: 'Mujer' },
    { value: 'BOY', label: 'Niño' },
    { value: 'GIRL', label: 'Niña' },
    { value: 'UNISEX', label: 'Unisex' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          to="/productos/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <label htmlFor="product-search" className="sr-only">Buscar producto</label>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="product-search"
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="product-brand-filter" className="sr-only">Filtrar por marca</label>
            <select
              id="product-brand-filter"
              value={brandId}
              onChange={(e) => updateFilter('brandId', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              <option value="">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-category-filter" className="sr-only">Filtrar por categoría</label>
            <select
              id="product-category-filter"
              value={categoryId}
              onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-gender-filter" className="sr-only">Filtrar por género</label>
            <select
              id="product-gender-filter"
              value={gender}
              onChange={(e) => updateFilter('gender', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            >
              {genderOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No hay productos</p>
            <p className="text-sm mt-1">Crea tu primer producto para empezar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Marca</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Categoría</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Género</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Precio base</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Variantes</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.brand?.name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.category?.name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.gender}</td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      ${p.basePrice?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                        {p.variantsCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          p.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/productos/${p.id}/editar`}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Link>
                        <Link
                          to={`/productos/${p.id}/variantes`}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Variantes"
                        >
                          <Grid3X3 size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => goToPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Package(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  )
}
