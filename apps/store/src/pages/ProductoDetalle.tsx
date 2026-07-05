import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Check, Loader2, ArrowLeft } from 'lucide-react'
import { fetchProduct } from '../lib/storeApi'
import { useCartStore } from '../stores/cartStore'

interface VariantInfo {
  id: string
  size: string
  color: string
  stock: number
  sku: string
  priceUsdCents: number
  priceBs: number
}

interface ProductDetail {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  brand: string | null
  category: string | null
  priceUsdCents: number
  priceBs: number
  exchangeRate: number
  variants: VariantInfo[]
}

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const openDrawer = useCartStore((s) => s.openDrawer)

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchProduct(id)
      .then((res: any) => {
        const data = res.data as ProductDetail
        setProduct(data)
        const sizes = [...new Set(data.variants.map((v: VariantInfo) => v.size))]
        const firstSize = sizes[0] ?? ''
        const colors = [...new Set(data.variants.filter((v: VariantInfo) => v.size === firstSize).map((v: VariantInfo) => v.color))]
        setSelectedSize(firstSize)
        setSelectedColor(colors[0] ?? '')
      })
      .catch(() => navigate('/tienda'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
  if (!product) return null

  const colors = [...new Set(product.variants.filter((v) => v.size === selectedSize).map((v) => v.color))]
  const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor)

  function handleAdd() {
    if (!product || !selectedVariant || selectedVariant.stock < 1) return
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      imageUrl: product.imageUrl,
      priceUsdCents: selectedVariant.priceUsdCents,
      quantity,
      stock: selectedVariant.stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/tienda')}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a tienda
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <ShoppingCart size={64} className="text-gray-300" />
          )}
        </div>

        <div>
          {product.brand && (
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{product.brand}</p>
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{product.name}</h1>
          {product.category && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.category}</p>
          )}

          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">${(product.priceUsdCents / 100).toFixed(2)} USD</p>
            <p className="text-lg text-gray-500 dark:text-gray-400">Bs {product.priceBs.toFixed(2)}</p>
            <p className="text-xs text-gray-400">Tasa de cambio: {product.exchangeRate} Bs/USD</p>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Talla</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set(product.variants.map((v) => v.size))].map((size) => {
                  const hasStock = product.variants.some((v) => v.size === size && v.stock > 0)
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size)
                        const cols = product.variants.filter((v) => v.size === size && v.stock > 0).map((v) => v.color)
                        setSelectedColor(cols[0] ?? '')
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedSize === size
                          ? 'bg-primary-600 text-white border-primary-600'
                          : !hasStock
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      disabled={!hasStock}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const hasStock = product.variants.some((v) => v.size === selectedSize && v.color === color && v.stock > 0)
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedColor === color
                          ? 'bg-primary-600 text-white border-primary-600'
                          : !hasStock
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      disabled={!hasStock}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedVariant && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cantidad</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium text-gray-900 dark:text-white w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant?.stock ?? 1, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {selectedVariant && (
              <p className={`text-sm ${selectedVariant.stock > 5 ? 'text-green-600' : selectedVariant.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                {selectedVariant.stock > 5 ? 'En stock' : selectedVariant.stock > 0 ? `Solo quedan ${selectedVariant.stock} unidades` : 'Agotado'}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAdd}
              disabled={!selectedVariant || selectedVariant.stock < 1}
              className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {added ? <><Check size={18} /> Agregado</> : <><ShoppingCart size={18} /> Agregar al carrito</>}
            </button>
            <button
              onClick={openDrawer}
              className="py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Ver carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
