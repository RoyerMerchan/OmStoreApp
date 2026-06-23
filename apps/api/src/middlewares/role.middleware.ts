import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.middleware'
import { sendError } from '../lib/response'

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'No autenticado', 401)
      return
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'No tienes permisos para esta acción', 403)
      return
    }
    next()
  }
}
