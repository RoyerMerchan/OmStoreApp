import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import ProtectedLayout from './layouts/ProtectedLayout'
import PublicLayout from './layouts/PublicLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import ProductFormPage from './pages/ProductFormPage'
import ProductVariantsPage from './pages/ProductVariantsPage'
import InventoryPage from './pages/InventoryPage'
import StockMovementsPage from './pages/StockMovementsPage'
import PosPage from './pages/PosPage'
import SalesPage from './pages/SalesPage'
import SaleDetailPage from './pages/SaleDetailPage'
import CashPage from './pages/CashPage'
import OpenCashPage from './pages/OpenCashPage'
import CloseCashPage from './pages/CloseCashPage'
import LayawaysPage from './pages/LayawaysPage'
import LayawayFormPage from './pages/LayawayFormPage'
import LayawayDetailPage from './pages/LayawayDetailPage'
import CustomersPage from './pages/CustomersPage'
import SuppliersPage from './pages/SuppliersPage'
import PurchasesPage from './pages/PurchasesPage'
import ExpensesPage from './pages/ExpensesPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import CatalogPage from './pages/CatalogPage'

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
        <Route path="/catalogo" element={<CatalogPage />} />
      </Route>

      {/* Login */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/nuevo" element={<ProductFormPage />} />
        <Route path="/productos/:id/editar" element={<ProductFormPage />} />
        <Route path="/productos/:id/variantes" element={<ProductVariantsPage />} />
        <Route path="/inventario" element={<InventoryPage />} />
        <Route path="/inventario/movimientos" element={<StockMovementsPage />} />
        <Route path="/pos" element={<PosPage />} />
        <Route path="/ventas" element={<SalesPage />} />
        <Route path="/ventas/:id" element={<SaleDetailPage />} />
        <Route path="/caja" element={<CashPage />} />
        <Route path="/caja/abrir" element={<OpenCashPage />} />
        <Route path="/caja/cerrar" element={<CloseCashPage />} />
        <Route path="/apartados" element={<LayawaysPage />} />
        <Route path="/apartados/nuevo" element={<LayawayFormPage />} />
        <Route path="/apartados/:id" element={<LayawayDetailPage />} />
        <Route path="/clientes" element={<CustomersPage />} />
        <Route path="/proveedores" element={<SuppliersPage />} />
        <Route path="/compras" element={<PurchasesPage />} />
        <Route path="/gastos" element={<ExpensesPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
      </Route>
    </Routes>
  )
}
