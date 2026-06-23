import { useEffect, useState } from 'react'
import api from '../lib/axios'
import { toast } from 'sonner'
import { Plus, Pencil, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  active: boolean
  createdAt: string
}

interface UserForm {
  name: string
  email: string
  password: string
  role: string
}

const roles = ['ADMIN', 'MANAGER', 'CASHIER', 'SELLER']
const emptyForm: UserForm = { name: '', email: '', password: '', role: 'CASHIER' }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await api.get('/users')
      if (res.data.success) setUsers(res.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(u: User) {
    setEditingId(u.id)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...form }
      if (editingId && !payload.password) delete (payload as any).password

      if (editingId) {
        await api.patch(`/users/${editingId}`, payload)
        toast.success('Usuario actualizado')
      } else {
        await api.post('/users', payload)
        toast.success('Usuario creado')
      }
      setShowModal(false)
      loadUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar usuario')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleStatus(user: User) {
    try {
      const res = await api.patch(`/users/${user.id}/status`)
      if (res.data.success) {
        toast.success(`Usuario ${user.active ? 'desactivado' : 'activado'}`)
        loadUsers()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Rol</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Creado</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No hay usuarios registrados</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                      <td className="py-3 px-4 text-gray-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            u.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => toggleStatus(u)}
                            className={u.active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}
                            title={u.active ? 'Desactivar' : 'Activar'}
                          >
                            {u.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
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
              {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {editingId && '(dejar vacío para mantener)'}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    {...(!editingId ? { required: true } : {})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
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
