import { Router } from 'express'
import { layawaysController } from './layaways.controller'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { createLayawaySchema, addPaymentSchema, cancelLayawaySchema } from './layaways.validation'

export const layawaysRoutes = Router()

layawaysRoutes.get('/', authenticate, layawaysController.list.bind(layawaysController))
layawaysRoutes.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(createLayawaySchema), layawaysController.create.bind(layawaysController))
layawaysRoutes.get('/expired', authenticate, layawaysController.getExpired.bind(layawaysController))
layawaysRoutes.get('/:id', authenticate, layawaysController.getById.bind(layawaysController))
layawaysRoutes.post('/:id/payment', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(addPaymentSchema), layawaysController.addPayment.bind(layawaysController))
layawaysRoutes.post('/:id/complete', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), layawaysController.complete.bind(layawaysController))
layawaysRoutes.post('/:id/cancel', authenticate, authorize('ADMIN', 'MANAGER'), validate(cancelLayawaySchema), layawaysController.cancel.bind(layawaysController))
