import { prisma } from '../../lib/prisma'
import type { CreateExpenseInput, CreateCategoryInput } from './expenses.validation'

export class ExpensesService {
  async list() {
    return prisma.expense.findMany({
      include: { category: true, cashSession: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: CreateExpenseInput, userId?: string) {
    const openCash = await prisma.cashSession.findFirst({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    })
    return prisma.expense.create({
      data: {
        concept: data.concept,
        amount: data.amount,
        categoryId: data.categoryId || null,
        notes: data.notes || null,
        userId: userId || null,
        cashSessionId: openCash?.id ?? null,
      },
      include: { category: true },
    })
  }

  async getCategories() {
    return prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } })
  }

  async createCategory(data: CreateCategoryInput) {
    return prisma.expenseCategory.create({ data: { name: data.name } })
  }
}

export const expensesService = new ExpensesService()
