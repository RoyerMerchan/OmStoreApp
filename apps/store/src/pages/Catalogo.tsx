import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, Loader2 } from 'lucide-react'
import { fetchProducts } from '../lib/storeApi'

interface ProductVariant {
  id: string
  size: string
  color: string
  stock: number
  priceUsdCents: number
  priceBs: number
  exchangeRate: number
  product: {
    id: string
    name: string
    description: string | null
    gender: string
    imageUrl: string | null
    brand: string | null
    category: string | null
  }
}

export default function Catalogo() {
  const [products, setProducts] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('')

  useEffect(() => {
    loadProducts()
  }, [search, gender])

  async function loadProducts() {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (gender) params.gender = gender
      const res = await fetchProducts(params)
      setProducts(res.data ?? [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const grouped = products.reduce<Record<string, ProductVariant[]>>((acc, p) => {
    const pid = p.product.id
    if (!acc[pid]) acc[pid] = []
    acc[pid].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tienda</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Catálogo de productos — precios en USD y Bs
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full sm:w-56 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none"
          >
            <option value="">Todos</option>
            <option value="MEN">Hombre</option>
            <option value="WOMEN">Mujer</option>
            <option value="BOY">Niño</option>
            <option value="GIRL">Niña</option>
            <option value="UNISEX">Unisex</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No hay productos disponibles</p>
          <p className="text-sm mt-1">Intenta con otro filtro de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(grouped).map(([productId, variants]) => {
            const p = variants[0].product
            const minPrice = Math.min(...variants.map((v) => v.priceUsdCents))
            const allOutOfStock = variants.every((v) => v.stock <= 0)
            return (
              <Link
                key={productId}
                to={`/tienda/producto/${productId}`}
                className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow ${allOutOfStock ? 'opacity-60' : ''}`}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <ShoppingBag size={48} className="text-gray-300" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{p.brand}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">{p.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {allOutOfStock ? 'Agotado' : `${variants.length} variante(s)`}
                  </p>
                  <div className="mt-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${(minPrice / 100).toFixed(2)} USD
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Bs {(minPrice / 100 * variants[0].exchangeRate).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
