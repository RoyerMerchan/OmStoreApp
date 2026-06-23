import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { customersService } from './customers.service'
import { sendSuccess, sendError, sendPaginated } from '../../lib/response'

export class CustomersController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await customersService.list(req.query as any)
      sendPaginated(res, result.data, result.total, result.page, result.limit)
    } catch (err) {
      next(err)
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await customersService.getById(req.params.id)
      sendSuccess(res, customer)
    } catch (err: any) {
      if (err.message === 'Cliente no encontrado') {
        sendError(res, err.message, 404)
        return
      }
      next(err)
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await customersService.create(req.body)
      sendSuccess(res, customer, 'Cliente creado exitosamente', 201)
    } catch (err: any) {
      if (err.message?.includes('ya existe')) {
        sendError(res, err.message, 409)
        return
      }
      next(err)
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await customersService.update(req.params.id, req.body)
      sendSuccess(res, customer, 'Cliente actualizado exitosamente')
    } catch (err: any) {
      if (err.message === 'Cliente no encontrado') {
        sendError(res, err.message, 404)
        return
      }
      if (err.message?.includes('ya existe')) {
        sendError(res, err.message, 409)
        return
      }
      next(err)
    }
  }
}

export const customersController = new CustomersController()
