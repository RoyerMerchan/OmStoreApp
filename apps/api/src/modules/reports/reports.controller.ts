import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { reportsService } from './reports.service'
import { sendSuccess } from '../../lib/response'

export class ReportsController {
  async salesReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string }
      const data = await reportsService.salesReport(startDate, endDate)
      sendSuccess(res, data)
    } catch (err) { next(err) }
  }

  async inventoryReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await reportsService.inventoryReport()
      sendSuccess(res, data)
    } catch (err) { next(err) }
  }

  async cashReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string }
      const data = await reportsService.cashReport(startDate, endDate)
      sendSuccess(res, data)
    } catch (err) { next(err) }
  }

  async layawayReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string }
      const data = await reportsService.layawayReport(startDate, endDate)
      sendSuccess(res, data)
    } catch (err) { next(err) }
  }

  async profitReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string }
      const data = await reportsService.profitReport(startDate, endDate)
      sendSuccess(res, data)
    } catch (err) { next(err) }
  }

  async exportSales(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string }
      const data = await reportsService.salesReport(startDate, endDate)
      const { csv, filename } = reportsService.exportToCsv(data, 'ventas')
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(csv)
    } catch (err) { next(err) }
  }

  async exportInventory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await reportsService.inventoryReport()
      const { csv, filename } = reportsService.exportToCsv(data, 'inventario')
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(csv)
    } catch (err) { next(err) }
  }
}

export const reportsController = new ReportsController()
