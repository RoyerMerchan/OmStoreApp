import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Plus, Pencil, Loader2 } from 'lucide-react'

interface Brand {
  id: number
  name: string
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadBrands() }, [])

  async function loadBrands() {
    setLoading(true)
    try {
      const res = await api.get('/brands')
      if (res.data.success) setBrands(res.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar marcas')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setName('')
    setShowModal(true)
  }

  function openEdit(b: Brand) {
    setEditingId(b.id)
    setName(b.name)
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nombre requerido'); return }
    setSubmitting(true)
    try {
      if (editingId) {
        await api.patch(`/brands/${editingId}`, { name })
        toast.success('Marca actualizada')
      } else {
        await api.post('/brands', { name })
        toast.success('Marca creada')
      }
      setShowModal(false)
      loadBrands()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marcas</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Nueva Marca
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-500">No hay marcas registradas</td>
                  </tr>
                ) : (
                  brands.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{b.name}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openEdit(b)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Pencil size={16} />
                        </button>
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Editar Marca' : 'Nueva Marca'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="brand-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                  id="brand-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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