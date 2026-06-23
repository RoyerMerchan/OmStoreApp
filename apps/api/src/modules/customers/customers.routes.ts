import { Router } from 'express'
import { customersController } from './customers.controller'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { createCustomerSchema, updateCustomerSchema } from './customers.validation'

export const customersRoutes = Router()

customersRoutes.get('/', authenticate, customersController.list.bind(customersController))
customersRoutes.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), validate(createCustomerSchema), customersController.create.bind(customersController))
customersRoutes.get('/:id', authenticate, customersController.getById.bind(customersController))
customersRoutes.patch('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateCustomerSchema), customersController.update.bind(customersController))
