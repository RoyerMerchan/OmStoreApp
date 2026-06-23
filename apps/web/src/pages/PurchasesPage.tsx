import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Plus, Search, X, Loader2 } from 'lucide-react'

interface Purchase {
  id: number
  invoiceNumber: string
  supplierName: string
  date: string
  total: number
  itemsCount: number
}

interface Supplier {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  sku: string
  size: string
  color: string
}

interface PurchaseItem {
  variantId: number
  productName: string
  size: string
  color: string
  quantity: number
  unitCost: number
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>([])

  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPurchases()
  }, [])

  async function loadPurchases() {
    setLoading(true)
    try {
      const res = await api.get('/purchases')
      if (res.data.success) setPurchases(res.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar compras')
    } finally {
      setLoading(false)
    }
  }

  async function openForm() {
    setShowForm(true)
    setSupplierId('')
    setInvoiceNumber('')
    setNotes('')
    setItems([])
    try {
      const res = await api.get('/suppliers')
      if (res.data.success) setSuppliers(res.data.data)
    } catch { /* ignore */ }
  }

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
          variantId: product.id,
          productName: product.name,
          size: product.size,
          color: product.color,
          quantity: 1,
          unitCost: 0,
        },
      ]
    })
    setProductSearch('')
    setShowProductDropdown(false)
  }

  function removeItem(variantId: number) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId))
  }

  function updateField(variantId: number, field: 'quantity' | 'unitCost', value: number) {
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, [field]: value } : i))
    )
  }

  const total = items.reduce((acc, i) => acc + i.quantity * i.unitCost, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supplierId) { toast.error('Selecciona un proveedor'); return }
    if (items.length === 0) { toast.error('Agrega al menos un producto'); return }
    if (!invoiceNumber) { toast.error('Ingresa el número de factura'); return }

    setSubmitting(true)
    try {
      const payload = {
        supplierId: parseInt(supplierId),
        invoiceNumber,
        notes,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, unitCost: i.unitCost })),
      }
      const res = await api.post('/purchases', payload)
      if (res.data.success) {
        toast.success('Compra registrada exitosamente')
        setShowForm(false)
        loadPurchases()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar compra')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Compras</h1>
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Nueva Compra
        </button>
      </div>

      {!showForm && (
        loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Factura #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Proveedor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No hay compras registradas</td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{p.invoiceNumber}</td>
                        <td className="py-3 px-4 text-gray-700">{p.supplierName}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right text-gray-900">${p.total?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{p.itemsCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles de Compra</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factura #</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Opcional"
                />
              </div>
            </div>
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
                      <span className="text-gray-500">{p.sku}</span>
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
                      <th className="text-right py-2 font-medium text-gray-500">Costo Unit.</th>
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
                            onChange={(e) => updateField(item.variantId, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                            min={1}
                          />
                        </td>
                        <td className="py-2 text-right">
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => updateField(item.variantId, 'unitCost', parseFloat(e.target.value) || 0)}
                            className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-sm"
                            min={0}
                            step={0.01}
                          />
                        </td>
                        <td className="py-2 text-right text-gray-900 font-medium">
                          ${(item.quantity * item.unitCost)?.toLocaleString()}
                        </td>
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
                      <td colSpan={5} className="py-2 text-right font-semibold text-gray-900">Total</td>
                      <td className="py-2 text-right font-bold text-gray-900">${total?.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="animate-spin" size={16} />}
              {submitting ? 'Registrando...' : 'Registrar Compra'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
