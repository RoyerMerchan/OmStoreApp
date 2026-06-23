import { Router } from 'express'
import { salesController } from './sales.controller'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { createSaleSchema, cancelSaleSchema, refundSaleSchema } from './sales.validation'

export const salesRoutes = Router()

salesRoutes.get('/', authenticate, salesController.list.bind(salesController))
salesRoutes.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(createSaleSchema), salesController.create.bind(salesController))
salesRoutes.get('/:id', authenticate, salesController.getById.bind(salesController))
salesRoutes.post('/:id/cancel', authenticate, authorize('ADMIN', 'MANAGER'), validate(cancelSaleSchema), salesController.cancel.bind(salesController))
salesRoutes.post('/:id/refund', authenticate, authorize('ADMIN', 'MANAGER'), validate(refundSaleSchema), salesController.refund.bind(salesController))
