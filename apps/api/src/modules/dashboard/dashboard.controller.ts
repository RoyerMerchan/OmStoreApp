import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { dashboardService } from './dashboard.service'
import { sendSuccess } from '../../lib/response'

export class DashboardController {
  async summary(req: AuthRequest, res: Response, next: NextFunction) {
    try { const data = await dashboardService.getSummary(); sendSuccess(res, data) }
    catch (err) { next(err) }
  }

  async topProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try { const data = await dashboardService.getTopProducts(Number(req.query.limit) || 10); sendSuccess(res, data) }
    catch (err) { next(err) }
  }

  async lowStock(req: AuthRequest, res: Response, next: NextFunction) {
    try { const data = await dashboardService.getLowStock(); sendSuccess(res, data) }
    catch (err) { next(err) }
  }

  async recentActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try { const data = await dashboardService.getRecentActivity(Number(req.query.limit) || 10); sendSuccess(res, data) }
    catch (err) { next(err) }
  }

  async topSizes(req: AuthRequest, res: Response, next: NextFunction) {
    try { const data = await dashboardService.getTopSizes(); sendSuccess(res, data) }
    catch (err) { next(err) }
  }

  async paymentMethods(req: AuthRequest, res: Response, next: NextFunction) {
    try { const data = await dashboardService.getPaymentMethodStats(); sendSuccess(res, data) }
    catch (err) { next(err) }
  }
}

export const dashboardController = new DashboardController()
