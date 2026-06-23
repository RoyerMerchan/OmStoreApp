import type { Response } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { sendSuccess, sendError } from '../../lib/response'
import { inventoryService } from './inventory.service'

export const inventoryController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const { variantId, productId, lowStock } = req.query
      const filters: any = {}
      if (variantId) filters.variantId = variantId as string
      if (productId) filters.productId = productId as string
      if (lowStock !== undefined) filters.lowStock = lowStock === 'true'

      const variants = await inventoryService.list(filters)
      sendSuccess(res, variants)
    } catch (error) {
      sendError(res, 'Error fetching inventory', 500)
    }
  },

  async getMovements(req: AuthRequest, res: Response) {
    try {
      const { variantId, type, dateFrom, dateTo } = req.query
      const filters: any = {}
      if (variantId) filters.variantId = variantId as string
      if (type) filters.type = type as string
      if (dateFrom) filters.dateFrom = dateFrom as string
      if (dateTo) filters.dateTo = dateTo as string

      const movements = await inventoryService.getMovements(filters)
      sendSuccess(res, movements)
    } catch (error) {
      sendError(res, 'Error fetching movements', 500)
    }
  },

  async getLowStock(req: AuthRequest, res: Response) {
    try {
      const variants = await inventoryService.getLowStock()
      sendSuccess(res, variants)
    } catch (error) {
      sendError(res, 'Error fetching low stock items', 500)
    }
  },

  async adjustment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const result = await inventoryService.adjustment(req.body, userId)
      sendSuccess(res, result)
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Error processing adjustment'
      const status = message.startsWith('Insufficient') ? 400 : 500
      sendError(res, message, status)
    }
  },
}
