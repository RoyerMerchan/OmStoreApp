import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import { storeAuthController } from './store-auth.controller'
import { registerSchema, loginSchema, updateProfileSchema } from './store-auth.validation'

export const storeAuthRoutes = Router()

storeAuthRoutes.post('/register', validate(registerSchema), storeAuthController.register.bind(storeAuthController))
storeAuthRoutes.post('/login', validate(loginSchema), storeAuthController.login.bind(storeAuthController))
storeAuthRoutes.get('/me', authenticate, storeAuthController.me.bind(storeAuthController))
storeAuthRoutes.patch('/profile', authenticate, validate(updateProfileSchema), storeAuthController.updateProfile.bind(storeAuthController))
