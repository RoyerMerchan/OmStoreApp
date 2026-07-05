import { useState, useEffect } from 'react'
import { User, Loader2, Save } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export default function MiCuenta() {
  const { user, checkAuth, updateProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.profile?.phone || '')
      setAddress(user.profile?.address || '')
      setCity(user.profile?.city || '')
      setState(user.profile?.state || '')
      setZipCode(user.profile?.zipCode || '')
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ name, phone, address, city, state, zipCode })
      toast.success('Perfil actualizado')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
          <User size={20} className="text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Cuenta</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Información personal</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0412-123-4567"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Dirección de entrega</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, edificio, apartamento..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código postal</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {saving ? <><Loader2 className="animate-spin" size={16} /> Guardando...</> : <><Save size={16} /> Guardar cambios</>}
        </button>
      </form>
    </div>
  )
}
