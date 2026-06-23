import { Router } from 'express'
import { expensesController } from './expenses.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { createExpenseSchema, createCategorySchema } from './expenses.validation'

export const expenseRoutes = Router()

expenseRoutes.use(authenticate)

expenseRoutes.get('/', expensesController.list.bind(expensesController))
expenseRoutes.post('/', validate(createExpenseSchema), expensesController.create.bind(expensesController))
expenseRoutes.get('/categories', expensesController.getCategories.bind(expensesController))
expenseRoutes.post('/categories', validate(createCategorySchema), expensesController.createCategory.bind(expensesController))
