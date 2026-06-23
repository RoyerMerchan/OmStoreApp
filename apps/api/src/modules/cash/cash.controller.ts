import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { cashService } from './cash.service'
import { sendSuccess, sendError } from '../../lib/response'

export class CashController {
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await cashService.getCurrent(req.user!.userId)
      if (!session) {
        sendSuccess(res, null, 'No hay caja abierta')
        return
      }
      sendSuccess(res, session)
    } catch (err) {
      next(err)
    }
  }

  async open(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await cashService.open(req.user!.userId, req.body)
      sendSuccess(res, session, 'Caja abierta exitosamente', 201)
    } catch (err: any) {
      if (err.message === 'Ya tienes una caja abierta') {
        sendError(res, err.message, 400)
        return
      }
      next(err)
    }
  }

  async close(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await cashService.close(req.user!.userId, req.body)
      sendSuccess(res, session, 'Caja cerrada exitosamente')
    } catch (err: any) {
      if (err.message === 'No hay caja abierta') {
        sendError(res, err.message, 400)
        return
      }
      next(err)
    }
  }

  async addMovement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const movement = await cashService.addMovement(req.user!.userId, req.body)
      sendSuccess(res, movement, 'Movimiento registrado exitosamente', 201)
    } catch (err: any) {
      if (err.message === 'No hay caja abierta') {
        sendError(res, err.message, 400)
        return
      }
      next(err)
    }
  }

  async history(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await cashService.history(req.user!.userId)
      sendSuccess(res, history)
    } catch (err) {
      next(err)
    }
  }
}

export const cashController = new CashController()
