import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Search, Plus, Pencil, Loader2 } from 'lucide-react'

interface Supplier {
  id: number
  name: string
  document: string
  phone: string
  email: string
  address: string
}

interface SupplierForm {
  name: string
  document: string
  phone: string
  email: string
  address: string
}

const emptyForm: SupplierForm = { name: '', document: '', phone: '', email: '', address: '' }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SupplierForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSuppliers()
  }, [search])

  async function loadSuppliers() {
    setLoading(true)
    try {
      const params = search ? { search } : {}
      const res = await api.get('/suppliers', { params })
      if (res.data.success) setSuppliers(res.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(s: Supplier) {
    setEditingId(s.id)
    setForm({ name: s.name, document: s.document, phone: s.phone, email: s.email, address: s.address })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.patch(`/suppliers/${editingId}`, form)
        toast.success('Proveedor actualizado')
      } else {
        await api.post('/suppliers', form)
        toast.success('Proveedor creado')
      }
      setShowModal(false)
      loadSuppliers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar proveedor')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este proveedor?')) return
    try {
      await api.delete(`/suppliers/${id}`)
      toast.success('Proveedor eliminado')
      loadSuppliers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar proveedor')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Documento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Teléfono</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Dirección</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No hay proveedores registrados</td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{s.name}</td>
                      <td className="py-3 px-4 text-gray-600">{s.document}</td>
                      <td className="py-3 px-4 text-gray-600">{s.phone}</td>
                      <td className="py-3 px-4 text-gray-600">{s.email}</td>
                      <td className="py-3 px-4 text-gray-600">{s.address}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="supplier-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    id="supplier-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="supplier-doc" className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input
                    id="supplier-doc"
                    type="text"
                    value={form.document}
                    onChange={(e) => setForm({ ...form, document: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="supplier-phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    id="supplier-phone"
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="supplier-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="supplier-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="supplier-address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  id="supplier-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
