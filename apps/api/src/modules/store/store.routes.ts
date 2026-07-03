import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import {
  createOrderSchema,
  checkShippingSchema,
  updateOrderStatusSchema,
  exchangeRateSchema,
} from './store.validation'
import * as storeCtrl from './store.controller'

export const storeRoutes = Router()
export const adminStoreRoutes = Router()

// Public routes
storeRoutes.get('/products', storeCtrl.getProducts)
storeRoutes.get('/products/:id', storeCtrl.getProductDetail)
storeRoutes.get('/exchange-rate', storeCtrl.getExchangeRate)
storeRoutes.post('/orders/check-shipping', validate(checkShippingSchema), storeCtrl.checkShipping)
storeRoutes.post('/orders', validate(createOrderSchema), storeCtrl.createOrder)
storeRoutes.get('/orders/:id', storeCtrl.getOrder)
storeRoutes.post('/upload-proof', storeCtrl.upload.single('file'), storeCtrl.uploadProof)

// Admin routes (protected)
adminStoreRoutes.use(authenticate)
adminStoreRoutes.get('/orders', storeCtrl.listOrders)
adminStoreRoutes.get('/orders/:id', storeCtrl.getOrder)
adminStoreRoutes.patch('/orders/:id/status', validate(updateOrderStatusSchema), storeCtrl.updateOrderStatus)
adminStoreRoutes.post('/exchange-rate', validate(exchangeRateSchema), storeCtrl.setExchangeRate)
adminStoreRoutes.get('/exchange-rate', storeCtrl.getExchangeRate)
adminStoreRoutes.get('/notifications', storeCtrl.getNotifications)
adminStoreRoutes.patch('/notifications/:id/read', storeCtrl.markNotificationRead)
