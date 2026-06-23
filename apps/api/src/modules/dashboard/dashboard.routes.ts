import { Router } from 'express'
import { dashboardController } from './dashboard.controller'
import { authenticate } from '../../middlewares/auth.middleware'

export const dashboardRoutes = Router()
dashboardRoutes.use(authenticate)

dashboardRoutes.get('/summary', dashboardController.summary.bind(dashboardController))
dashboardRoutes.get('/top-products', dashboardController.topProducts.bind(dashboardController))
dashboardRoutes.get('/low-stock', dashboardController.lowStock.bind(dashboardController))
dashboardRoutes.get('/recent-activity', dashboardController.recentActivity.bind(dashboardController))
dashboardRoutes.get('/top-sizes', dashboardController.topSizes.bind(dashboardController))
dashboardRoutes.get('/payment-methods', dashboardController.paymentMethods.bind(dashboardController))
