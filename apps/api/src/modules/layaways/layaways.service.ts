import { prisma } from '../../lib/prisma'

export class LayawaysService {
  private async generateLayawayNumber(): Promise<string> {
    const date = new Date()
    const prefix = `LAWAY-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const count = await prisma.layaway.count({ where: { createdAt: { gte: startOfDay } } })
    return `${prefix}-${String(count + 1).padStart(5, '0')}`
  }

  async list(filters: { page?: number; limit?: number; status?: string; customerId?: string }) {
    const page = filters.page || 1
    const limit = filters.limit || 20
    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.customerId) where.customerId = filters.customerId

    const [data, total] = await Promise.all([
      prisma.layaway.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          items: { include: { variant: { include: { product: { select: { name: true } } } } } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.layaway.count({ where }),
    ])
    return { data, total, page, limit }
  }

  async getById(id: string) {
    const layaway = await prisma.layaway.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: { include: { variant: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } } },
        payments: true,
        sale: true,
      },
    })
    if (!layaway) throw new Error('Apartado no encontrado')
    return layaway
  }

  async getExpired() {
    return prisma.layaway.findMany({
      where: { status: 'ACTIVE', dueDate: { lt: new Date() } },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: { include: { variant: { include: { product: { select: { name: true } } } } } },
      },
      orderBy: { dueDate: 'asc' },
    })
  }

  async create(input: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      let subtotal = 0
      const layawayItems: any[] = []

      for (const item of input.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        if (!variant || !variant.isActive) throw new Error(`Variante ${item.variantId} no encontrada`)
        const availableStock = variant.stock - variant.reservedStock
        if (availableStock < item.quantity) throw new Error(`Stock insuficiente para ${variant.sku}. Disponible: ${availableStock}`)

        const lineSubtotal = item.unitPrice * item.quantity
        subtotal += lineSubtotal

        layawayItems.push({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: lineSubtotal,
        })
      }

      const balance = subtotal - input.initialPayment
      const layawayNumber = await this.generateLayawayNumber()

      const layaway = await tx.layaway.create({
        data: {
          layawayNumber,
          customerId: input.customerId,
          userId,
          subtotal,
          initialPayment: input.initialPayment,
          totalPaid: input.initialPayment,
          balance,
          dueDate: new Date(input.dueDate),
          notes: input.notes,
          items: { create: layawayItems },
          payments: input.initialPayment > 0 ? {
            create: {
              method: 'CASH',
              amount: input.initialPayment,
              notes: 'Pago inicial',
            },
          } : undefined,
        },
      })

      for (const item of input.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { increment: item.quantity } },
        })
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId,
            type: 'LAYAWAY_RESERVE',
            quantity: item.quantity,
            previousStock: variant!.stock,
            newStock: variant!.stock - item.quantity,
            reason: `Apartado ${layawayNumber}`,
            reference: layaway.id,
          },
        })
      }

      return layaway
    })
  }

  async addPayment(layawayId: string, userId: string, input: { method: string; amount: number; reference?: string; notes?: string }) {
    return prisma.$transaction(async (tx) => {
      const layaway = await tx.layaway.findUnique({ where: { id: layawayId } })
      if (!layaway) throw new Error('Apartado no encontrado')
      if (layaway.status !== 'ACTIVE') throw new Error('El apartado no está activo')

      const payment = await tx.layawayPayment.create({
        data: {
          layawayId,
          method: input.method as any,
          amount: input.amount,
          reference: input.reference,
          notes: input.notes,
        },
      })

      const newTotalPaid = Number(layaway.totalPaid) + input.amount
      const newBalance = Number(layaway.balance) - input.amount

      const updateData: any = {
        totalPaid: newTotalPaid,
        balance: Math.max(0, newBalance),
      }

      if (newBalance <= 0) {
        updateData.status = 'COMPLETED'
        updateData.completedAt = new Date()
      }

      await tx.layaway.update({ where: { id: layawayId }, data: updateData })

      return payment
    })
  }

  async complete(layawayId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const layaway = await tx.layaway.findUnique({
        where: { id: layawayId },
        include: { items: true },
      })
      if (!layaway) throw new Error('Apartado no encontrado')
      if (layaway.status !== 'ACTIVE') throw new Error('El apartado no está activo')
      if (Number(layaway.balance) > 0) throw new Error('El apartado tiene saldo pendiente. Registre pagos primero.')

      const saleNumber = await this.generateSaleNumber()
      const cashSession = await tx.cashSession.findFirst({ where: { userId, status: 'OPEN' } })
      if (!cashSession) throw new Error('No hay caja abierta')

      const sale = await tx.sale.create({
        data: {
          saleNumber,
          userId,
          customerId: layaway.customerId,
          cashSessionId: cashSession.id,
          subtotal: layaway.subtotal,
          discount: 0,
          total: layaway.subtotal,
          items: {
            create: layaway.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unitCost: 0,
              discount: 0,
              subtotal: item.subtotal,
            })),
          },
          payments: {
            create: {
              method: 'CASH',
              amount: layaway.subtotal,
            },
          },
        },
      })

      await tx.layaway.update({
        where: { id: layawayId },
        data: { status: 'COMPLETED', saleId: sale.id, completedAt: new Date() },
      })

      for (const item of layaway.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: { decrement: item.quantity },
          },
        })
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId,
            type: 'LAYAWAY_COMPLETE',
            quantity: item.quantity,
            previousStock: variant!.stock,
            newStock: variant!.stock - item.quantity,
            reason: `Apartado completado ${saleNumber}`,
            reference: sale.id,
          },
        })
      }

      return sale
    })
  }

  private async generateSaleNumber(): Promise<string> {
    const date = new Date()
    const prefix = `TICKET-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const count = await prisma.sale.count({ where: { createdAt: { gte: startOfDay } } })
    return `${prefix}-${String(count + 1).padStart(5, '0')}`
  }

  async cancel(layawayId: string, userId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const layaway = await tx.layaway.findUnique({
        where: { id: layawayId },
        include: { items: true },
      })
      if (!layaway) throw new Error('Apartado no encontrado')
      if (layaway.status !== 'ACTIVE') throw new Error('Solo se pueden cancelar apartados activos')

      await tx.layaway.update({
        where: { id: layawayId },
        data: { status: 'CANCELLED', cancelledAt: new Date(), notes: reason },
      })

      for (const item of layaway.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { decrement: item.quantity } },
        })
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId,
            type: 'LAYAWAY_CANCEL',
            quantity: item.quantity,
            previousStock: variant!.stock,
            newStock: variant!.stock,
            reason,
            reference: layaway.id,
          },
        })
      }

      return layaway
    })
  }
}

export const layawaysService = new LayawaysService()
