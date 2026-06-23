import { prisma } from '../../lib/prisma'

export class SalesService {
  private async generateSaleNumber(): Promise<string> {
    const date = new Date()
    const prefix = `TICKET-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const count = await prisma.sale.count({ where: { createdAt: { gte: startOfDay } } })
    return `${prefix}-${String(count + 1).padStart(5, '0')}`
  }

  async list(filters: { page?: number; limit?: number; startDate?: string; endDate?: string; userId?: string; status?: string }) {
    const page = filters.page || 1
    const limit = filters.limit || 20
    const where: any = {}
    if (filters.startDate) where.createdAt = { gte: new Date(filters.startDate) }
    if (filters.endDate) where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) }
    if (filters.userId) where.userId = filters.userId
    if (filters.status) where.status = filters.status

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: { user: { select: { name: true } }, customer: { select: { name: true } }, payments: true, items: { include: { variant: { include: { product: { select: { name: true } } } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ])
    return { data, total, page, limit }
  }

  async getById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        customer: true,
        items: { include: { variant: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } } },
        payments: true,
      },
    })
    if (!sale) throw new Error('Venta no encontrada')
    return sale
  }

  async create(input: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const cashSession = await tx.cashSession.findFirst({ where: { userId, status: 'OPEN' } })
      if (!cashSession) throw new Error('No hay caja abierta. Debe abrir caja primero.')

      let subtotal = 0
      const saleItems: any[] = []
      for (const item of input.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        if (!variant || !variant.isActive) throw new Error(`Variante ${item.variantId} no encontrada`)
        const availableStock = variant.stock - variant.reservedStock
        if (availableStock < item.quantity) throw new Error(`Stock insuficiente para ${variant.sku}. Disponible: ${availableStock}`)

        const lineSubtotal = item.unitPrice * item.quantity - item.discount
        subtotal += lineSubtotal

        saleItems.push({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitCost: variant.cost || 0,
          discount: item.discount || 0,
          subtotal: lineSubtotal,
        })
      }

      const total = subtotal - (input.discount || 0)
      const saleNumber = await this.generateSaleNumber()

      const sale = await tx.sale.create({
        data: {
          saleNumber,
          userId,
          customerId: input.customerId || null,
          cashSessionId: cashSession.id,
          subtotal,
          discount: input.discount || 0,
          total,
          notes: input.notes,
          items: { create: saleItems },
          payments: { create: input.payments },
        },
      })

      for (const item of input.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId,
            type: 'SALE',
            quantity: item.quantity,
            previousStock: variant!.stock,
            newStock: variant!.stock - item.quantity,
            reason: `Venta ${saleNumber}`,
            reference: sale.id,
          },
        })
      }

      return sale
    })
  }

  async cancel(saleId: string, userId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId }, include: { items: true } })
      if (!sale) throw new Error('Venta no encontrada')
      if (sale.status !== 'COMPLETED') throw new Error('Solo se pueden cancelar ventas completadas')

      await tx.sale.update({ where: { id: saleId }, data: { status: 'CANCELLED' } })

      for (const item of sale.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } })
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId,
            type: 'SALE_CANCEL',
            quantity: item.quantity,
            previousStock: variant!.stock,
            newStock: variant!.stock + item.quantity,
            reason,
            reference: sale.id,
          },
        })
      }

      return sale
    })
  }

  async refund(saleId: string, userId: string, input: any) {
    return this.cancel(saleId, userId, input.reason)
  }
}

export const salesService = new SalesService()
