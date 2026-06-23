import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'
import { StockMovementType, AuditAction } from '@omstore/shared'

interface ListFilters {
  variantId?: string
  productId?: string
  lowStock?: boolean
}

interface MovementFilters {
  variantId?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}

interface AdjustmentInput {
  variantId: string
  type: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'
  quantity: number
  reason: string
}

export const inventoryService = {
  async list(filters: ListFilters = {}) {
    const where: Prisma.ProductVariantWhereInput = {}

    if (filters.variantId) where.id = filters.variantId
    if (filters.productId) where.productId = filters.productId

    const variants = await prisma.productVariant.findMany({
      where,
      include: { product: true },
      orderBy: { updatedAt: 'desc' },
    })

    if (filters.lowStock) {
      return variants.filter(v => (v.stock - v.reservedStock) < v.minStock)
    }

    return variants
  },

  async getMovements(filters: MovementFilters = {}) {
    const where: Prisma.StockMovementWhereInput = {}

    if (filters.variantId) where.variantId = filters.variantId
    if (filters.type) where.type = filters.type as any
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom)
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo)
    }

    return prisma.stockMovement.findMany({
      where,
      include: {
        variant: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async adjustment(input: AdjustmentInput, userId: string) {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUniqueOrThrow({
        where: { id: input.variantId },
      })

      const previousStock = variant.stock
      let newStock: number

      if (input.type === StockMovementType.ADJUSTMENT_IN) {
        newStock = previousStock + input.quantity
      } else {
        const available = previousStock - (variant.reservedStock ?? 0)
        if (available < input.quantity) {
          throw new Error(
            `Insufficient stock. Available: ${available}, requested: ${input.quantity}`,
          )
        }
        newStock = previousStock - input.quantity
      }

      await tx.productVariant.update({
        where: { id: input.variantId },
        data: { stock: newStock },
      })

      await tx.stockMovement.create({
        data: {
          variantId: input.variantId,
          type: input.type,
          quantity: input.quantity,
          previousStock,
          newStock,
          reason: input.reason,
          userId,
        },
      })

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.STOCK_ADJUSTMENT,
          entity: 'ProductVariant',
          entityId: input.variantId,
          description: `Stock ${input.type === StockMovementType.ADJUSTMENT_IN ? 'increased' : 'decreased'} by ${input.quantity}. Reason: ${input.reason}`,
        },
      })

      return { variantId: input.variantId, previousStock, newStock }
    })
  },

  async getLowStock() {
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: true },
      orderBy: { stock: 'asc' },
    })
    return variants.filter(v => v.minStock > 0 && (v.stock - v.reservedStock) < v.minStock)
  },
}
