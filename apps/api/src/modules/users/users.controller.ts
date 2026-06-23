import type { Response, NextFunction } from 'express'
import { usersService } from './users.service'
import { sendSuccess, sendError } from '../../lib/response'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { UserRole } from '@omstore/shared'

export class UsersController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await usersService.list()
      sendSuccess(res, users)
    } catch (err) { next(err) }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body)
      sendSuccess(res, user, 'Usuario creado exitosamente', 201)
    } catch (err: any) {
      if (err.message?.includes('email')) { sendError(res, err.message, 400); return }
      next(err)
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id, req.body)
      sendSuccess(res, user, 'Usuario actualizado')
    } catch (err: any) {
      if (err.message === 'Usuario no encontrado') { sendError(res, err.message, 404); return }
      next(err)
    }
  }

  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.toggleStatus(req.params.id)
      sendSuccess(res, user, `Usuario ${user.isActive ? 'activado' : 'desactivado'}`)
    } catch (err: any) {
      if (err.message === 'Usuario no encontrado') { sendError(res, err.message, 404); return }
      next(err)
    }
  }
}

export const usersController = new UsersController()
