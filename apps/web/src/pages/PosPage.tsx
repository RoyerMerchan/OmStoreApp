import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  ArrowLeft,
  X,
  Percent,
  User,
  Loader2,
  Lock,
} from 'lucide-react'
import api from '../lib/axios'

interface ProductVariant {
  id: string
  productId: string
  size: string
  color: string
  price: number
  stock: number
  product: {
    id: string
    name: string
    sku: string
    barcode: string
  }
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface CartItem {
  variant: ProductVariant
  quantity: number
  discount: number
}

type PaymentMethodType = 'CASH' | 'CARD' | 'TRANSFER' | 'MOBILE_PAYMENT' | 'MIXED'

const paymentMethods: { value: PaymentMethodType; label: string; icon: typeof Banknote }[] = [
  { value: 'CASH', label: 'Efectivo', icon: Banknote },
  { value: 'CARD', label: 'Tarjeta', icon: CreditCard },
  { value: 'TRANSFER', label: 'Transferencia', icon: Building2 },
  { value: 'MOBILE_PAYMENT', label: 'Pago Móvil', icon: Smartphone },
  { value: 'MIXED', label: 'Mixto', icon: CreditCard },
]

export default function PosPage() {
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)

  // Search state
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductVariant[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [globalDiscount, setGlobalDiscount] = useState(0)

  // Customer state
  const [customerQuery, setCustomerQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH')
  const [payments, setPayments] = useState<{ method: PaymentMethodType; amount: number }[]>([
    { method: 'CASH', amount: 0 },
  ])
  const [submitting, setSubmitting] = useState(false)

  // Cash check
  const [cashCheckDone, setCashCheckDone] = useState(false)
  const [cashOpen, setCashOpen] = useState(false)

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProducts([])
      return
    }
    setSearching(true)
    try {
      const res = await api.get('/products', { params: { search: q } })
      const data = res.data.data ?? []
      const variants: ProductVariant[] = []
      for (const p of data) {
        if (p.variants && p.variants.length > 0) {
          for (const v of p.variants) {
            variants.push({ ...v, product: { id: p.id, name: p.name, sku: p.sku, barcode: p.barcode } })
          }
        }
      }
      setProducts(variants)
      setShowResults(true)
    } catch {
      toast.error('Error al buscar productos')
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(query), 300)
    return () => clearTimeout(timer)
  }, [query, searchProducts])

  useEffect(() => {
    const checkCash = async () => {
      try {
        const res = await api.get('/cash/current')
        setCashOpen(res.data.data?.status === 'OPEN')
      } catch {
        setCashOpen(false)
      } finally {
        setCashCheckDone(true)
      }
    }
    checkCash()
  }, [])

  const searchCustomers = useCallback(async (q: string) => {
    if (!q.trim()) {
      setCustomers([])
      return
    }
    try {
      const res = await api.get('/customers', { params: { search: q, limit: 10 } })
      setCustomers(res.data.data ?? [])
      setShowCustomerDropdown(true)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchCustomers(customerQuery), 300)
    return () => clearTimeout(timer)
  }, [customerQuery, searchCustomers])

  const addToCart = (variant: ProductVariant) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id)
      if (existing) {
        if (existing.quantity >= variant.stock) {
          toast.error('Stock insuficiente')
          return prev
        }
        return prev.map((item) =>
          item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { variant, quantity: 1, discount: 0 }]
    })
    setShowResults(false)
    setQuery('')
    searchRef.current?.focus()
  }

  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variant.id !== variantId) return item
          const newQty = item.quantity + delta
          if (newQty <= 0) return null
          if (newQty > item.variant.stock) {
            toast.error('Stock insuficiente')
            return item
          }
          return { ...item, quantity: newQty }
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const updateItemDiscount = (variantId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.variant.id === variantId ? { ...item, discount: Math.max(0, Math.min(discount, 100)) } : item
      )
    )
  }

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variant.id !== variantId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
  const itemDiscountTotal = cart.reduce(
    (sum, item) => sum + (item.variant.price * item.quantity * item.discount) / 100,
    0
  )
  const afterItemDiscount = subtotal - itemDiscountTotal
  const globalDiscountAmount = (afterItemDiscount * globalDiscount) / 100
  const total = afterItemDiscount - globalDiscountAmount

  useEffect(() => {
    if (paymentMethod === 'MIXED') {
      setPayments([
        { method: 'CASH', amount: 0 },
        { method: 'CARD', amount: 0 },
      ])
    } else {
      setPayments([{ method: paymentMethod, amount: total }])
    }
  }, [paymentMethod, total])

  const updatePayment = (index: number, amount: number) => {
    setPayments((prev) => prev.map((p, i) => (i === index ? { ...p, amount } : p)))
  }

  const updatePaymentMethod = (index: number, method: PaymentMethodType) => {
    setPayments((prev) => prev.map((p, i) => (i === index ? { ...p, method } : p)))
  }

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Agrega productos al carrito')
      return
    }
    if (!cashOpen) {
      toast.error('No hay caja abierta')
      return
    }
    const paymentsTotal = payments.reduce((s, p) => s + p.amount, 0)
    if (paymentsTotal < total) {
      toast.error('Los pagos no cubren el total')
      return
    }

    setSubmitting(true)
    try {
      const items = cart.map((item) => ({
        variantId: item.variant.id,
        productId: item.variant.productId,
        quantity: item.quantity,
        price: item.variant.price,
        discount: item.discount,
      }))

      const paymentsData = payments.map((p) => ({
        method: p.method,
        amount: p.amount,
      }))

      const payload: Record<string, unknown> = {
        items,
        payments: paymentsData,
        discount: globalDiscount,
        total,
      }
      if (selectedCustomer) {
        payload.customerId = selectedCustomer.id
      }

      const res = await api.post('/sales', payload)
      toast.success('Venta registrada exitosamente')
      navigate(`/ventas/${res.data.data.id}`)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al registrar venta'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!cashCheckDone) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (!cashOpen) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Lock size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700">No hay caja abierta</h2>
        <p className="text-gray-500">Debes abrir caja antes de vender</p>
        <Link
          to="/caja/abrir"
          className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Abrir Caja
        </Link>
      </div>
    )
  }

  const totalPayments = payments.reduce((s, p) => s + p.amount, 0)
  const change = totalPayments - total

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* Left: Search */}
      <div className="lg:w-96 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU o código de barras..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setProducts([])
                setShowResults(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {searching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary-600" size={24} />
            </div>
          ) : showResults && products.length === 0 && query ? (
            <p className="text-center text-gray-500 py-8">Sin resultados</p>
          ) : (
            products.map((v) => (
              <button
                key={v.id}
                onClick={() => addToCart(v)}
                disabled={v.stock <= 0}
                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-400 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium text-gray-900">{v.product.name}</div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{v.size}</span>
                  <span
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: v.color.toLowerCase() }}
                  />
                  <span>{v.color}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-primary-600">
                    ${Number(v.price).toLocaleString('es-CO')}
                  </span>
                  <span className={`text-xs ${v.stock > 5 ? 'text-green-600' : v.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {v.stock > 0 ? `${v.stock} disp.` : 'Sin stock'}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Center: Cart */}
      <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <ShoppingCart size={18} className="text-primary-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Carrito ({cart.length})</h2>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
              <p>Carrito vacío</p>
              <p className="text-sm">Busca y agrega productos</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th className="text-left px-3 py-2">Producto</th>
                    <th className="text-left px-3 py-2">Talla</th>
                    <th className="text-left px-3 py-2">Color</th>
                    <th className="text-right px-3 py-2">Precio</th>
                    <th className="text-center px-3 py-2">Cant</th>
                    <th className="text-right px-3 py-2">Desc %</th>
                    <th className="text-right px-3 py-2">Subtotal</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {cart.map((item) => {
                    const lineSubtotal = item.variant.price * item.quantity
                    const lineDiscount = (lineSubtotal * item.discount) / 100
                    const lineTotal = lineSubtotal - lineDiscount
                    return (
                      <tr key={item.variant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 text-sm font-medium dark:text-white">{item.variant.product.name}</td>
                        <td className="px-3 py-2 text-sm dark:text-gray-300">{item.variant.size}</td>
                        <td className="px-3 py-2 text-sm dark:text-gray-300">{item.variant.color}</td>
                        <td className="px-3 py-2 text-sm text-right dark:text-gray-300">
                          ${Number(item.variant.price).toLocaleString('es-CO')}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.variant.id, -1)}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-medium dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variant.id, 1)}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={item.discount}
                            onChange={(e) => updateItemDiscount(item.variant.id, Number(e.target.value))}
                            className="w-16 text-right text-sm border border-gray-300 rounded px-1 py-0.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-medium dark:text-white">
                          ${Number(lineTotal).toLocaleString('es-CO')}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => removeFromCart(item.variant.id)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-red-100 text-red-500 dark:hover:bg-red-900/30"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 p-4 space-y-2 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent size={16} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Descuento global</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                    className="w-16 text-right text-sm border border-gray-300 rounded px-1 py-0.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="dark:text-gray-200">${Number(subtotal).toLocaleString('es-CO')}</span>
              </div>
              {itemDiscountTotal > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Desc. items</span>
                  <span>-${Number(itemDiscountTotal).toLocaleString('es-CO')}</span>
                </div>
              )}
              {globalDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Desc. global ({globalDiscount}%)</span>
                  <span>-${Number(globalDiscountAmount).toLocaleString('es-CO')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 dark:text-white dark:border-gray-700">
                <span>Total</span>
                <span>${Number(total).toLocaleString('es-CO')}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Payment & Customer */}
      <div className="lg:w-96 flex flex-col gap-4">
        {/* Customer selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 dark:text-gray-300">
            <User size={16} />
            Cliente (opcional)
          </h3>
          <div className="relative">
            <input
              type="text"
              value={customerQuery}
              onChange={(e) => {
                setCustomerQuery(e.target.value)
                if (!e.target.value) setSelectedCustomer(null)
              }}
              placeholder="Buscar cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            {showCustomerDropdown && customers.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c)
                      setCustomerQuery(c.name)
                      setShowCustomerDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    <div className="font-medium">{c.name}</div>
                    {c.email && <div className="text-xs text-gray-500 dark:text-gray-400">{c.email}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedCustomer && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {selectedCustomer.email && <span>{selectedCustomer.email} · </span>}
              {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-gray-300">Método de pago</h3>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((pm) => {
              const Icon = pm.icon
              return (
                <button
                  key={pm.value}
                  onClick={() => setPaymentMethod(pm.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    paymentMethod === pm.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={16} />
                  {pm.label}
                </button>
              )
            })}
          </div>

          <div className="mt-4 space-y-3">
            {payments.map((p, i) => (
              <div key={i}>
                {paymentMethod === 'MIXED' && (
                  <select
                    value={p.method}
                    onChange={(e) => updatePaymentMethod(i, e.target.value as PaymentMethodType)}
                    className="w-full mb-1 px-3 py-1.5 border border-gray-300 rounded text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    {paymentMethods
                      .filter((pm) => pm.value !== 'MIXED')
                      .map((pm) => (
                        <option key={pm.value} value={pm.value}>
                          {pm.label}
                        </option>
                      ))}
                  </select>
                )}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    value={p.amount}
                    onChange={(e) => updatePayment(i, Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Total</span>
              <span className="font-medium dark:text-gray-200">${Number(total).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Recibido</span>
              <span className="font-medium dark:text-gray-200">${Number(totalPayments).toLocaleString('es-CO')}</span>
            </div>
            {change >= 0 && (
              <div className="flex justify-between text-green-600 font-medium dark:text-green-400">
                <span>Cambio</span>
                <span>${Number(change).toLocaleString('es-CO')}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
            className="w-full mt-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Procesando...
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Confirmar Venta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
