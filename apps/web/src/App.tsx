import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import ProtectedLayout from './layouts/ProtectedLayout'
import PublicLayout from './layouts/PublicLayout'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductFormPage = lazy(() => import('./pages/ProductFormPage'))
const ProductVariantsPage = lazy(() => import('./pages/ProductVariantsPage'))
const InventoryPage = lazy(() => import('./pages/InventoryPage'))
const StockMovementsPage = lazy(() => import('./pages/StockMovementsPage'))
const PosPage = lazy(() => import('./pages/PosPage'))
const SalesPage = lazy(() => import('./pages/SalesPage'))
const SaleDetailPage = lazy(() => import('./pages/SaleDetailPage'))
const CashPage = lazy(() => import('./pages/CashPage'))
const OpenCashPage = lazy(() => import('./pages/OpenCashPage'))
const CloseCashPage = lazy(() => import('./pages/CloseCashPage'))
const LayawaysPage = lazy(() => import('./pages/LayawaysPage'))
const LayawayFormPage = lazy(() => import('./pages/LayawayFormPage'))
const LayawayDetailPage = lazy(() => import('./pages/LayawayDetailPage'))
const CustomersPage = lazy(() => import('./pages/CustomersPage'))
const BrandsPage = lazy(() => import('./pages/BrandsPage'))
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'))
const PurchasesPage = lazy(() => import('./pages/PurchasesPage'))
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const TiendaCatalogo = lazy(() => import('./pages/tienda/Catalogo'))
const TiendaProducto = lazy(() => import('./pages/tienda/ProductoDetalle'))
const TiendaCheckout = lazy(() => import('./pages/tienda/Checkout'))
const TiendaConfirmacion = lazy(() => import('./pages/tienda/Confirmacion'))
const TiendaOrdenStatus = lazy(() => import('./pages/tienda/OrdenStatus'))
const AdminPedidos = lazy(() => import('./pages/AdminPedidos'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )
}

export default function App() {
  const { checkAuth, loading, user } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/catalogo" element={<Suspense fallback={<PageLoader />}><CatalogPage /></Suspense>} />
        <Route path="/tienda" element={<Suspense fallback={<PageLoader />}><TiendaCatalogo /></Suspense>} />
        <Route path="/tienda/producto/:id" element={<Suspense fallback={<PageLoader />}><TiendaProducto /></Suspense>} />
        <Route path="/tienda/checkout" element={<Suspense fallback={<PageLoader />}><TiendaCheckout /></Suspense>} />
        <Route path="/tienda/confirmacion/:id" element={<Suspense fallback={<PageLoader />}><TiendaConfirmacion /></Suspense>} />
        <Route path="/tienda/orden" element={<Suspense fallback={<PageLoader />}><TiendaOrdenStatus /></Suspense>} />
        <Route path="/tienda/orden/:id" element={<Suspense fallback={<PageLoader />}><TiendaOrdenStatus /></Suspense>} />
      </Route>

      {/* Login */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
        <Route path="/productos" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
        <Route path="/productos/nuevo" element={<Suspense fallback={<PageLoader />}><ProductFormPage /></Suspense>} />
        <Route path="/productos/:id/editar" element={<Suspense fallback={<PageLoader />}><ProductFormPage /></Suspense>} />
        <Route path="/productos/:id/variantes" element={<Suspense fallback={<PageLoader />}><ProductVariantsPage /></Suspense>} />
        <Route path="/inventario" element={<Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>} />
        <Route path="/inventario/movimientos" element={<Suspense fallback={<PageLoader />}><StockMovementsPage /></Suspense>} />
        <Route path="/pos" element={<Suspense fallback={<PageLoader />}><PosPage /></Suspense>} />
        <Route path="/ventas" element={<Suspense fallback={<PageLoader />}><SalesPage /></Suspense>} />
        <Route path="/ventas/:id" element={<Suspense fallback={<PageLoader />}><SaleDetailPage /></Suspense>} />
        <Route path="/caja" element={<Suspense fallback={<PageLoader />}><CashPage /></Suspense>} />
        <Route path="/caja/abrir" element={<Suspense fallback={<PageLoader />}><OpenCashPage /></Suspense>} />
        <Route path="/caja/cerrar" element={<Suspense fallback={<PageLoader />}><CloseCashPage /></Suspense>} />
        <Route path="/apartados" element={<Suspense fallback={<PageLoader />}><LayawaysPage /></Suspense>} />
        <Route path="/apartados/nuevo" element={<Suspense fallback={<PageLoader />}><LayawayFormPage /></Suspense>} />
        <Route path="/apartados/:id" element={<Suspense fallback={<PageLoader />}><LayawayDetailPage /></Suspense>} />
        <Route path="/clientes" element={<Suspense fallback={<PageLoader />}><CustomersPage /></Suspense>} />
        <Route path="/proveedores" element={<Suspense fallback={<PageLoader />}><SuppliersPage /></Suspense>} />
        <Route path="/marcas" element={<Suspense fallback={<PageLoader />}><BrandsPage /></Suspense>} />
        <Route path="/compras" element={<Suspense fallback={<PageLoader />}><PurchasesPage /></Suspense>} />
        <Route path="/gastos" element={<Suspense fallback={<PageLoader />}><ExpensesPage /></Suspense>} />
        <Route path="/reportes" element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />
        <Route path="/usuarios" element={<Suspense fallback={<PageLoader />}><UsersPage /></Suspense>} />
        <Route path="/pedidos" element={<Suspense fallback={<PageLoader />}><AdminPedidos /></Suspense>} />
      </Route>
    </Routes>
  )
}
