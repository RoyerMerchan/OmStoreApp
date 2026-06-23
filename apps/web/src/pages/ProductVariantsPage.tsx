import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/axios'
import { toast } from 'sonner'
import {
  Loader2,
  ArrowLeft,
  Plus,
  Edit2,
  X,
  Check,
  Package,
} from 'lucide-react'

interface Variant {
  id: number
  size: string
  color: string
  sku: string
  barcode: string
  price: number
  cost: number
  stock: number
  reservedStock: number
  minStock: number
  isActive: boolean
}

const emptyForm = {
  size: '',
  color: '',
  sku: '',
  barcode: '',
  price: '',
  cost: '',
  stock: '',
  minStock: '0',
}

export default function ProductVariantsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [productName, setProductName] = useState('')
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [prodRes, varRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/variants`),
      ])
      if (prodRes.data.success) setProductName(prodRes.data.data.name)
      if (varRes.data.success) setVariants(varRes.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  function openEdit(v: Variant) {
    setForm({
      size: v.size,
      color: v.color,
      sku: v.sku,
      barcode: v.barcode || '',
      price: String(v.price),
      cost: String(v.cost),
      stock: String(v.stock),
      minStock: String(v.minStock),
    })
    setEditingId(v.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      size: form.size,
      color: form.color,
      sku: form.sku,
      barcode: form.barcode || undefined,
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
    }

    try {
      if (editingId) {
        await api.patch(`/products/variants/${editingId}`, payload)
        toast.success('Variante actualizada')
      } else {
        await api.post(`/products/${id}/variants`, payload)
        toast.success('Variante creada')
      }
      resetForm()
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar variante')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/productos')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Variantes</h1>
          <p className="text-sm text-gray-500">{productName}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Nueva Variante
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              {editingId ? 'Editar Variante' : 'Nueva Variante'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Talla *</label>
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                placeholder="Ej: 41"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color *</label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                placeholder="Ej: Negro"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SKU *</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                placeholder="SKU"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Código barras</label>
              <input
                type="text"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Costo *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stock mínimo</label>
              <input
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {variants.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Sin variantes</p>
            <p className="text-sm mt-1">Agrega variantes de talla y color</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Talla</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Color</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Código barras</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Precio</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Costo</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Reservado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Disponible</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{v.size}</td>
                    <td className="py-3 px-4 text-gray-600">{v.color}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{v.sku}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{v.barcode || '-'}</td>
                    <td className="py-3 px-4 text-right text-gray-900">${v.price?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-600">${v.cost?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-900">{v.stock}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{v.reservedStock}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {v.stock - v.reservedStock}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          v.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {v.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEdit(v)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
