import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { salesService } from './sales.service'
import { sendSuccess, sendError, sendPaginated } from '../../lib/response'

export class SalesController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await salesService.list(req.query as any)
      sendPaginated(res, result.data, result.total, result.page, result.limit)
    } catch (err) {
      next(err)
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sale = await salesService.getById(req.params.id)
      sendSuccess(res, sale)
    } catch (err: any) {
      if (err.message === 'Venta no encontrada') {
        sendError(res, err.message, 404)
        return
      }
      next(err)
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sale = await salesService.create(req.body, req.user!.userId)
      sendSuccess(res, sale, 'Venta creada exitosamente', 201)
    } catch (err: any) {
      if (err.message?.includes('Stock insuficiente') || err.message?.includes('No hay caja abierta')) {
        sendError(res, err.message, 400)
        return
      }
      next(err)
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sale = await salesService.cancel(req.params.id, req.user!.userId, req.body.reason)
      sendSuccess(res, sale, 'Venta cancelada exitosamente')
    } catch (err: any) {
      if (err.message?.includes('no encontrada')) {
        sendError(res, err.message, 404)
        return
      }
      if (err.message?.includes('Solo se pueden cancelar')) {
        sendError(res, err.message, 400)
        return
      }
      next(err)
    }
  }

  async refund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sale = await salesService.refund(req.params.id, req.user!.userId, req.body)
      sendSuccess(res, sale, 'Reembolso procesado exitosamente')
    } catch (err: any) {
      if (err.message?.includes('no encontrada')) {
        sendError(res, err.message, 404)
        return
      }
      next(err)
    }
  }
}

export const salesController = new SalesController()
