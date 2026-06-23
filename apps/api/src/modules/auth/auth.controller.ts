import type { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { sendSuccess, sendError } from '../../lib/response'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import type { LoginInput } from './auth.validation'

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as LoginInput
      const result = await authService.login(input)
      sendSuccess(res, result, 'Inicio de sesión exitoso')
    } catch (err: any) {
      if (err.message === 'Credenciales inválidas') {
        sendError(res, err.message, 401)
        return
      }
      next(err)
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.userId)
      sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  }
}

export const authController = new AuthController()
