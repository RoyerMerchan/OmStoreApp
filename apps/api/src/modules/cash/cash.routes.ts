import { Router } from 'express'
import { cashController } from './cash.controller'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { openCashSchema, closeCashSchema, cashMovementSchema } from './cash.validation'

export const cashRoutes = Router()

cashRoutes.get('/current', authenticate, cashController.getCurrent.bind(cashController))
cashRoutes.post('/open', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(openCashSchema), cashController.open.bind(cashController))
cashRoutes.post('/close', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(closeCashSchema), cashController.close.bind(cashController))
cashRoutes.post('/movement', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(cashMovementSchema), cashController.addMovement.bind(cashController))
cashRoutes.get('/history', authenticate, cashController.history.bind(cashController))
