import { Router } from 'express'
import { reportsController } from './reports.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'

export const reportRoutes = Router()
reportRoutes.use(authenticate)
reportRoutes.use(authorize('ADMIN', 'MANAGER'))

reportRoutes.get('/sales', reportsController.salesReport.bind(reportsController))
reportRoutes.get('/inventory', reportsController.inventoryReport.bind(reportsController))
reportRoutes.get('/cash', reportsController.cashReport.bind(reportsController))
reportRoutes.get('/layaways', reportsController.layawayReport.bind(reportsController))
reportRoutes.get('/profit', reportsController.profitReport.bind(reportsController))
reportRoutes.get('/export/sales', reportsController.exportSales.bind(reportsController))
reportRoutes.get('/export/inventory', reportsController.exportInventory.bind(reportsController))
