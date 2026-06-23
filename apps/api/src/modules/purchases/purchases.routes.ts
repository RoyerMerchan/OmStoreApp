import { Router } from 'express'
import { purchasesController } from './purchases.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { createPurchaseSchema } from './purchases.validation'
import { UserRole } from '@omstore/shared'

export const purchaseRoutes = Router()

purchaseRoutes.use(authenticate)
purchaseRoutes.use(authorize(UserRole.ADMIN, UserRole.MANAGER))

purchaseRoutes.get('/', purchasesController.list.bind(purchasesController))
purchaseRoutes.get('/:id', purchasesController.getById.bind(purchasesController))
purchaseRoutes.post('/', validate(createPurchaseSchema), purchasesController.create.bind(purchasesController))
