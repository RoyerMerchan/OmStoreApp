import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { layawaysService } from './layaways.service'
import { sendSuccess, sendError, sendPaginated } from '../../lib/response'

export class LayawaysController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await layawaysService.list(req.query as any)
      sendPaginated(res, result.data, result.total, result.page, result.limit)
    } catch (err) {
      next(err)
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const layaway = await layawaysService.getById(req.params.id)
      sendSuccess(res, layaway)
    } catch (err: any) {
      if (err.message === 'Apartado no encontrado') {
        sendError(res, err.message, 404)
        return
      }
      next(err)
    }
  }

  async getExpired(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expired = await layawaysService.getExpired()
      sendSuccess(res, expired)
    } catch (err) {
      next(err)
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const layaway = await layawaysService.create(req.body, req.user!.userId)
      sendSuccess(res, layaway, 'Apartado creado exitosamente', 201)
    } catch (err: any) {
      if (err.message?.includes('Stock insuficiente')) {
        sendError(res, err.message, 400)
        return
      }
      next(err)
    }
  }

  async addPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await layawaysService.addPayment(req.params.id, req.user!.userId, req.body)
      sendSuccess(res, payment, 'Pago registrado exitosamente')
    } catch (err: any) {
      if (err.message === 'Apartado no encontrado') {
        sendError(res, err.message, 404)
        return
      }
      if (err.message?.includes('no está activo')) {
        sendError(res, err.message, 400)
        return
      }
      next(err)
    }
  }

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sale = await layawaysService.complete(req.params.id, req.user!.userId)
      sendSuccess(res, sale, 'Apartado completado exitosamente')
    } catch (err: any) {
      if (err.message === 'Apartado no encontrado') {
        sendError(res, err.message, 404)
        return
      }
      if (err.message?.includes('no está activo') || err.message?.includes('saldo pendiente') || err.message?.includes('No hay caja abierta')) {
        sendError(res, err.message, 400)
        return
      }
      next(err)
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const layaway = await layawaysService.cancel(req.params.id, req.user!.userId, req.body.reason)
      sendSuccess(res, layaway, 'Apartado cancelado exitosamente')
    } catch (err: any) {
      if (err.message === 'Apartado no encontrado') {
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
}

export const layawaysController = new LayawaysController()
