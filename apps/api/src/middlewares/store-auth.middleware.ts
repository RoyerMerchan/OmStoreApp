import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'
import { sendError } from '../lib/response'
import { UserRole } from '@omstore/shared'

export interface StoreAuthRequest extends Request {
  user?: {
    userId: string
    role: string
    name: string
    email: string
  }
}

export function authenticateStore(req: StoreAuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    sendError(res, 'Token no proporcionado', 401)
    return
  }

  try {
    const token = header.slice(7)
    const decoded = verifyToken(token)

    if (decoded.role !== UserRole.CLIENT) {
      sendError(res, 'Acceso denegado. Solo clientes pueden acceder a esta sección.', 403)
      return
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
    }
    next()
  } catch {
    sendError(res, 'Token inválido o expirado', 401)
  }
}
