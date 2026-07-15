import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

/** Traduce la respuesta del backend a un mensaje claro para el usuario. */
function resolveLoginError(err: any): string {
  // Sin respuesta = no se pudo contactar la API
  if (!err.response) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.'
  }
  const { status, data } = err.response
  // Errores de validación (zod) llegan como arreglo en data.error
  if (Array.isArray(data?.error) && data.error.length > 0) {
    return data.error.join(' · ')
  }
  if (status === 401) return data?.message || 'Usuario o contraseña incorrectos'
  if (status === 400) return data?.message || 'Datos inválidos'
  if (status >= 500) return 'Error del servidor. Intenta de nuevo más tarde.'
  return data?.message || 'Error al iniciar sesión'
}

export default function LoginPage() {
  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      toast.success('Inicio de sesión exitoso')
      navigate('/')
    } catch (err: any) {
      toast.error(resolveLoginError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src="/omnegro.png" alt="OmStore" className="h-32 mx-auto mb-6" loading="lazy" />
            <h1 className="text-2xl font-bold text-gray-900">OmStore</h1>
            <p className="text-gray-600 mt-1">Sistema Administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-gray-900 mb-1">Usuario</label>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-gray-900 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none pr-10"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            © 2026 OmStore. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
