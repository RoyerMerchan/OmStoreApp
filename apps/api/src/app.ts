import express from 'express'
import cors from 'cors'
import { authRoutes } from './modules/auth/auth.routes'
import { userRoutes } from './modules/users/users.routes'
import productRoutes from './modules/products/products.routes'
import brandRoutes from './modules/products/brands.routes'
import categoryRoutes from './modules/products/categories.routes'
import inventoryRoutes from './modules/inventory/inventory.routes'
import { purchaseRoutes } from './modules/purchases/purchases.routes'
import { suppliersRoutes } from './modules/purchases/suppliers.routes'
import { customersRoutes } from './modules/customers/customers.routes'
import { salesRoutes } from './modules/sales/sales.routes'
import { cashRoutes } from './modules/cash/cash.routes'
import { layawaysRoutes } from './modules/layaways/layaways.routes'
import { expenseRoutes } from './modules/expenses/expenses.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { reportRoutes } from './modules/reports/reports.routes'
import { catalogRoutes } from './modules/catalog/catalog.routes'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'

const app = express()

app.use(cors({ origin: process.env.WEB_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Public routes
app.use('/api/auth', authRoutes)
app.use('/api/catalog', catalogRoutes)

// Protected routes
app.use('/api/users', userRoutes)
app.use('/api/brands', brandRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/purchases', purchaseRoutes)
app.use('/api/suppliers', suppliersRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/cash', cashRoutes)
app.use('/api/layaways', layawaysRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
