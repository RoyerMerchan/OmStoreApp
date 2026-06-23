import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { expensesService } from './expenses.service'
import { sendSuccess } from '../../lib/response'

export class ExpensesController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expenses = await expensesService.list()
      sendSuccess(res, expenses)
    } catch (err) { next(err) }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expense = await expensesService.create(req.body, req.user?.userId)
      sendSuccess(res, expense, 'Gasto registrado')
    } catch (err) { next(err) }
  }

  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await expensesService.getCategories()
      sendSuccess(res, categories)
    } catch (err) { next(err) }
  }

  async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await expensesService.createCategory(req.body)
      sendSuccess(res, category, 'Categoría creada')
    } catch (err) { next(err) }
  }
}

export const expensesController = new ExpensesController()
