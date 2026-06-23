import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Plus, X, Search, Loader2 } from 'lucide-react'

interface Customer {
  id: number
  name: string
  document: string
  phone: string
}

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  size: string
  color: string
}

interface LineItem {
  productId: number
  variantId: number
  productName: string
  size: string
  color: string
  quantity: number
  unitPrice: number
}

export default function LayawayFormPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [items, setItems] = useState<LineItem[]>([])

  const [initialPayment, setInitialPayment] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // new customer fields
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', document: '', phone: '' })

  useEffect(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    setDueDate(d.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (!customerSearch) { setCustomers([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/customers', { params: { search: customerSearch } })
        if (res.data.success) setCustomers(res.data.data)
      } catch { /* ignore */ }
    }, 300)
    return () => clearTimeout(timer)
  }, [customerSearch])

  useEffect(() => {
    if (!productSearch) { setProducts([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/products', { params: { search: productSearch, active: true } })
        if (res.data.success) setProducts(res.data.data)
      } catch { /* ignore */ }
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearch])

  function addItem(product: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.variantId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: product.id,
          productName: product.name,
          size: product.size,
          color: product.color,
          quantity: 1,
          unitPrice: product.price,
        },
      ]
    })
    setProductSearch('')
    setShowProductDropdown(false)
  }

  function removeItem(variantId: number) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId))
  }

  function updateQuantity(variantId: number, qty: number) {
    if (qty < 1) return
    setItems((prev) => prev.map((i) => (i.variantId === variantId ? { ...i, quantity: qty } : i)))
  }

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomer) { toast.error('Selecciona un cliente'); return }
    if (items.length === 0) { toast.error('Agrega al menos un producto'); return }
    if (initialPayment > subtotal) { toast.error('El pago inicial no puede exceder el total'); return }

    setSubmitting(true)
    try {
      let customerId = selectedCustomer.id

      if (showNewCustomer && newCustomer.name) {
        const res = await api.post('/customers', newCustomer)
        if (res.data.success) customerId = res.data.data.id
      }

      const payload = {
        customerId,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, unitPrice: i.unitPrice })),
        initialPayment,
        dueDate,
        notes,
      }

      const res = await api.post('/layaways', payload)
      if (res.data.success) {
        toast.success('Apartado creado exitosamente')
        navigate('/apartados')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear apartado')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Apartado</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>

          {!selectedCustomer ? (
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true) }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Buscar cliente por nombre o documento..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(!showNewCustomer)}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus size={16} />
                  Nuevo
                </button>
              </div>

              {showCustomerDropdown && customers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(c.name) }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-gray-500 ml-2">{c.document}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-500">{selectedCustomer.document} · {selectedCustomer.phone}</p>
              </div>
              <button type="button" onClick={() => { setSelectedCustomer(null); setCustomerSearch('') }} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          )}

          {showNewCustomer && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nombre"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <input
                type="text"
                placeholder="Documento"
                value={newCustomer.document}
                onChange={(e) => setNewCustomer({ ...newCustomer, document: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true) }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Buscar producto por nombre o SKU..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            {showProductDropdown && products.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addItem(p)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex justify-between"
                  >
                    <span>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-gray-400 ml-2">{p.size} / {p.color}</span>
                    </span>
                    <span className="text-gray-600">${p.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-500">Producto</th>
                    <th className="text-left py-2 font-medium text-gray-500">Talla</th>
                    <th className="text-left py-2 font-medium text-gray-500">Color</th>
                    <th className="text-center py-2 font-medium text-gray-500">Cantidad</th>
                    <th className="text-right py-2 font-medium text-gray-500">Precio</th>
                    <th className="text-right py-2 font-medium text-gray-500">Subtotal</th>
                    <th className="text-center py-2 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.variantId} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{item.productName}</td>
                      <td className="py-2 text-gray-600">{item.size}</td>
                      <td className="py-2 text-gray-600">{item.color}</td>
                      <td className="py-2 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value) || 1)}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                          min={1}
                        />
                      </td>
                      <td className="py-2 text-right text-gray-900">${item.unitPrice?.toLocaleString()}</td>
                      <td className="py-2 text-right text-gray-900 font-medium">${(item.unitPrice * item.quantity)?.toLocaleString()}</td>
                      <td className="py-2 text-center">
                        <button type="button" onClick={() => removeItem(item.variantId)} className="text-red-400 hover:text-red-600">
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan={5} className="py-2 text-right font-semibold text-gray-900">Subtotal</td>
                    <td className="py-2 text-right font-bold text-gray-900">${subtotal?.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Apartado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial</label>
              <input
                type="number"
                value={initialPayment}
                onChange={(e) => setInitialPayment(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                min={0}
                step={0.01}
                required
              />
              {initialPayment > subtotal && (
                <p className="text-xs text-red-500 mt-1">El monto inicial no puede exceder el total (${subtotal?.toLocaleString()})</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="Notas opcionales..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/apartados')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            {submitting ? 'Creando...' : 'Crear Apartado'}
          </button>
        </div>
      </form>
    </div>
  )
}
