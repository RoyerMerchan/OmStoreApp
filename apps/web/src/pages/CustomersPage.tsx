import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Search, Plus, Pencil, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface Customer {
  id: number
  name: string
  document: string
  phone: string
  email: string
  address: string
  totalPurchases: number
  activeLayaways: number
  recentPurchases?: any[]
  recentLayaways?: any[]
}

interface CustomerForm {
  name: string
  document: string
  phone: string
  email: string
  address: string
}

const emptyForm: CustomerForm = { name: '', document: '', phone: '', email: '', address: '' }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [search, page])

  async function loadCustomers() {
    setLoading(true)
    try {
      const res = await api.get('/customers', { params: { search, page, limit: 20 } })
      if (res.data.success) {
        setCustomers(res.data.data)
        setTotalPages(res.data.totalPages || 1)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  async function loadDetails(customerId: number) {
    if (expandedId === customerId) { setExpandedId(null); return }
    try {
      const res = await api.get(`/customers/${customerId}`)
      if (res.data.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId
              ? { ...c, recentPurchases: res.data.data.recentPurchases, recentLayaways: res.data.data.recentLayaways }
              : c
          )
        )
        setExpandedId(customerId)
      }
    } catch { toast.error('Error al cargar detalles del cliente') }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(c: Customer) {
    setEditingId(c.id)
    setForm({ name: c.name, document: c.document, phone: c.phone, email: c.email, address: c.address })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.patch(`/customers/${editingId}`, form)
        toast.success('Cliente actualizado')
      } else {
        await api.post('/customers', form)
        toast.success('Cliente creado')
      }
      setShowModal(false)
      loadCustomers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar cliente')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre, documento o teléfono..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Compras</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Apartados</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">No hay clientes registrados</td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <>
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => loadDetails(c.id)}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">{c.name}</td>
                        <td className="py-3 px-4 text-gray-600">{c.document}</td>
                        <td className="py-3 px-4 text-gray-600">{c.phone}</td>
                        <td className="py-3 px-4 text-gray-600">{c.email}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{c.totalPurchases || 0}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{c.activeLayaways || 0}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(c) }}
                            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>
                        </td>
                      </tr>
                      {expandedId === c.id && (
                        <tr key={`detail-${c.id}`}>
                          <td colSpan={7} className="px-4 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Compras Recientes</h4>
                                {c.recentPurchases?.length ? (
                                  <div className="space-y-1">
                                    {c.recentPurchases.map((p: any) => (
                                      <p key={p.id} className="text-xs text-gray-600">
                                        ${p.total?.toLocaleString()} · {new Date(p.createdAt).toLocaleDateString()}
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400">Sin compras recientes</p>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Apartados Activos</h4>
                                {c.recentLayaways?.length ? (
                                  <div className="space-y-1">
                                    {c.recentLayaways.map((l: any) => (
                                      <p key={l.id} className="text-xs text-gray-600">
                                        {l.number} · ${l.balance?.toLocaleString()} saldo
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400">Sin apartados activos</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    id="customer-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="customer-doc" className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input
                    id="customer-doc"
                    type="text"
                    value={form.document}
                    onChange={(e) => setForm({ ...form, document: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    id="customer-phone"
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="customer-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="customer-address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  id="customer-address"
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
