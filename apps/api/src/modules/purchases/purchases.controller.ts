import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { purchasesService } from './purchases.service'
import { sendSuccess, sendError } from '../../lib/response'

export class PurchasesController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const purchases = await purchasesService.list()
      sendSuccess(res, purchases)
    } catch (err) { next(err) }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const purchase = await purchasesService.getById(req.params.id)
      if (!purchase) { sendError(res, 'Compra no encontrada', 404); return }
      sendSuccess(res, purchase)
    } catch (err) { next(err) }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const purchase = await purchasesService.create(req.body, req.user!.userId)
      sendSuccess(res, purchase, 'Compra registrada exitosamente')
    } catch (err: any) {
      if (err.message?.includes('no encontrada')) { sendError(res, err.message, 400); return }
      next(err)
    }
  }
}

export const purchasesController = new PurchasesController()
