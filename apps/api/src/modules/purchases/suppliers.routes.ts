import { Router } from 'express'
import { suppliersController } from './suppliers.controller'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { createSupplierSchema, updateSupplierSchema } from './suppliers.validation'

export const suppliersRoutes = Router()

suppliersRoutes.get('/', authenticate, authorize('ADMIN', 'MANAGER'), suppliersController.list.bind(suppliersController))
suppliersRoutes.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(createSupplierSchema), suppliersController.create.bind(suppliersController))
suppliersRoutes.patch('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateSupplierSchema), suppliersController.update.bind(suppliersController))
