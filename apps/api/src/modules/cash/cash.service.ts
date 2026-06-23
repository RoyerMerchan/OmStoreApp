import { prisma } from '../../lib/prisma'

export class CashService {
  async getCurrent(userId: string) {
    const session = await prisma.cashSession.findFirst({
      where: { userId, status: 'OPEN' },
      include: {
        sales: { include: { payments: true } },
        cashMovements: true,
        expenses: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return session
  }

  async open(userId: string, input: { openingAmount: number; notes?: string }) {
    const existing = await prisma.cashSession.findFirst({ where: { userId, status: 'OPEN' } })
    if (existing) throw new Error('Ya tienes una caja abierta')

    return prisma.cashSession.create({
      data: {
        userId,
        openingAmount: input.openingAmount,
        notes: input.notes,
        openedAt: new Date(),
      },
    })
  }

  async close(userId: string, input: { closingAmount: number; notes?: string }) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.cashSession.findFirst({ where: { userId, status: 'OPEN' } })
      if (!session) throw new Error('No hay caja abierta')

      const sales = await tx.sale.findMany({ where: { cashSessionId: session.id, status: 'COMPLETED' }, include: { payments: true } })
      const cashMovements = await tx.cashMovement.findMany({ where: { cashSessionId: session.id } })
      const expenses = await tx.expense.findMany({ where: { cashSessionId: session.id } })

      let cashFromSales = 0
      let cardFromSales = 0
      let transferFromSales = 0
      let mobileFromSales = 0

      for (const sale of sales) {
        for (const payment of sale.payments) {
          if (payment.method === 'CASH') cashFromSales += Number(payment.amount)
          else if (payment.method === 'CARD') cardFromSales += Number(payment.amount)
          else if (payment.method === 'TRANSFER') transferFromSales += Number(payment.amount)
          else if (payment.method === 'MOBILE_PAYMENT') mobileFromSales += Number(payment.amount)
        }
      }

      const manualIncome = cashMovements.filter(m => m.type === 'INCOME').reduce((s, m) => s + Number(m.amount), 0)
      const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0) + cashMovements.filter(m => m.type === 'EXPENSE').reduce((s, m) => s + Number(m.amount), 0)

      const expectedAmount = Number(session.openingAmount) + cashFromSales + manualIncome - totalExpenses
      const difference = input.closingAmount - expectedAmount

      return tx.cashSession.update({
        where: { id: session.id },
        data: {
          status: 'CLOSED',
          closingAmount: input.closingAmount,
          expectedAmount,
          difference,
          closedAt: new Date(),
          notes: input.notes,
        },
      })
    })
  }

  async addMovement(userId: string, input: { type: string; concept: string; amount: number; notes?: string }) {
    const session = await prisma.cashSession.findFirst({ where: { userId, status: 'OPEN' } })
    if (!session) throw new Error('No hay caja abierta')

    return prisma.cashMovement.create({
      data: {
        cashSessionId: session.id,
        type: input.type as any,
        concept: input.concept,
        amount: input.amount,
        notes: input.notes,
      },
    })
  }

  async history(userId: string) {
    return prisma.cashSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sales: { include: { payments: true } },
        cashMovements: true,
        expenses: true,
      },
    })
  }
}

export const cashService = new CashService()
