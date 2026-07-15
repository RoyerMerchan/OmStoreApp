import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || ''
    const isLoginCall = url.includes('/auth/login')
    // Solo redirigimos si expira una sesión existente, no en fallos del propio login.
    // Así el error de credenciales llega al catch y se muestra en pantalla.
    if (error.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
