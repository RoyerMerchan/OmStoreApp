import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import StoreLayout from './layouts/StoreLayout'
import { useAuthStore } from './stores/authStore'

const Catalogo = lazy(() => import('./pages/Catalogo'))
const ProductoDetalle = lazy(() => import('./pages/ProductoDetalle'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Confirmacion = lazy(() => import('./pages/Confirmacion'))
const OrdenStatus = lazy(() => import('./pages/OrdenStatus'))
const Login = lazy(() => import('./pages/Login'))
const Registro = lazy(() => import('./pages/Registro'))
const MiCuenta = lazy(() => import('./pages/MiCuenta'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/tienda/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/tienda" element={<Suspense fallback={<PageLoader />}><Catalogo /></Suspense>} />
        <Route path="/tienda/producto/:id" element={<Suspense fallback={<PageLoader />}><ProductoDetalle /></Suspense>} />
        <Route path="/tienda/checkout" element={<RequireAuth><Suspense fallback={<PageLoader />}><Checkout /></Suspense></RequireAuth>} />
        <Route path="/tienda/confirmacion/:id" element={<Suspense fallback={<PageLoader />}><Confirmacion /></Suspense>} />
        <Route path="/tienda/orden" element={<RequireAuth><Suspense fallback={<PageLoader />}><OrdenStatus /></Suspense></RequireAuth>} />
        <Route path="/tienda/orden/:id" element={<RequireAuth><Suspense fallback={<PageLoader />}><OrdenStatus /></Suspense></RequireAuth>} />
        <Route path="/tienda/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
        <Route path="/tienda/registro" element={<Suspense fallback={<PageLoader />}><Registro /></Suspense>} />
        <Route path="/tienda/mi-cuenta" element={<RequireAuth><Suspense fallback={<PageLoader />}><MiCuenta /></Suspense></RequireAuth>} />
        <Route path="/tienda/*" element={<Navigate to="/tienda" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/tienda" replace />} />
    </Routes>
  )
}
