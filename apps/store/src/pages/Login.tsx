import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      await login(email, password)
      toast.success('¡Bienvenido de vuelta!')
      navigate('/tienda')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/omnegro.png" alt="OmStore" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ¿No tienes cuenta?{' '}
            <Link to="/tienda/registro" className="text-primary-600 hover:underline font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="animate-spin" size={16} /> Iniciando sesión...</> : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/tienda" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
