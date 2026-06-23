import { Router } from 'express'
import { usersController } from './users.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { createUserSchema, updateUserSchema } from './users.validation'
import { UserRole } from '@omstore/shared'

export const userRoutes = Router()

userRoutes.use(authenticate)
userRoutes.use(authorize(UserRole.ADMIN, UserRole.MANAGER))

userRoutes.get('/', usersController.list.bind(usersController))
userRoutes.post('/', validate(createUserSchema), usersController.create.bind(usersController))
userRoutes.patch('/:id', validate(updateUserSchema), usersController.update.bind(usersController))
userRoutes.patch('/:id/status', usersController.toggleStatus.bind(usersController))
