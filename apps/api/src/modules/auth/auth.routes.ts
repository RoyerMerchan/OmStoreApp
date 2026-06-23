import { Router } from 'express'
import { authController } from './auth.controller'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import { loginSchema } from './auth.validation'

export const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), authController.login.bind(authController))
authRoutes.get('/me', authenticate, authController.me.bind(authController))
