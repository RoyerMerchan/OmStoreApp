import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { suppliersService } from './suppliers.service'
import { sendSuccess, sendError, sendPaginated } from '../../lib/response'

export class SuppliersController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await suppliersService.list(req.query as any)
      sendPaginated(res, result.data, result.total, result.page, result.limit)
    } catch (err) {
      next(err)
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const supplier = await suppliersService.create(req.body)
      sendSuccess(res, supplier, 'Proveedor creado exitosamente', 201)
    } catch (err) {
      next(err)
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const supplier = await suppliersService.update(req.params.id, req.body)
      sendSuccess(res, supplier, 'Proveedor actualizado exitosamente')
    } catch (err: any) {
      if (err.message === 'Proveedor no encontrado') {
        sendError(res, err.message, 404)
        return
      }
      next(err)
    }
  }
}

export const suppliersController = new SuppliersController()
