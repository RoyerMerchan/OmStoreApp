import type { Request, Response, NextFunction } from 'express'
import { storeAuthService } from './store-auth.service'
import { sendSuccess, sendError } from '../../lib/response'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import type { RegisterInput, LoginInput, UpdateProfileInput } from './store-auth.validation'

export class StoreAuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as RegisterInput
      const result = await storeAuthService.register(input)
      sendSuccess(res, result, 'Registro exitoso', 201)
    } catch (err: any) {
      if (err.message === 'El email ya está registrado') {
        sendError(res, err.message, 409)
        return
      }
      next(err)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as LoginInput
      const result = await storeAuthService.login(input)
      sendSuccess(res, result, 'Inicio de sesión exitoso')
    } catch (err: any) {
      if (err.message === 'Credenciales inválidas' || err.message === 'Esta cuenta no es de cliente') {
        sendError(res, err.message, 401)
        return
      }
      next(err)
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await storeAuthService.me(req.user!.userId)
      sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = req.body as UpdateProfileInput
      const user = await storeAuthService.updateProfile(req.user!.userId, input)
      sendSuccess(res, user, 'Perfil actualizado')
    } catch (err) {
      next(err)
    }
  }
}

export const storeAuthController = new StoreAuthController()
