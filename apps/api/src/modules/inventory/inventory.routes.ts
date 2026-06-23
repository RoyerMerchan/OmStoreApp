import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { UserRole } from '@omstore/shared'
import { inventoryController } from './inventory.controller'
import { adjustmentSchema } from './inventory.validation'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.SELLER),
  inventoryController.list,
)

router.get(
  '/movements',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  inventoryController.getMovements,
)

router.get(
  '/low-stock',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.SELLER),
  inventoryController.getLowStock,
)

router.post(
  '/adjustment',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validate(adjustmentSchema),
  inventoryController.adjustment,
)

export default router
