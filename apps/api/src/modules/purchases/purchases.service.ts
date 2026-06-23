import { prisma } from '../../lib/prisma'
import { AuditAction, StockMovementType } from '@omstore/shared'
import type { CreatePurchaseInput } from './purchases.validation'

export class PurchasesService {
  async list() {
    return prisma.purchase.findMany({
      include: {
        supplier: true,
        items: { include: { variant: { include: { product: { select: { name: true, imageUrl: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getById(id: string) {
    return prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { variant: { include: { product: true } } } },
      },
    })
  }

  async create(data: CreatePurchaseInput, userId: string) {
    return prisma.$transaction(async (tx) => {
      let total = 0
      const itemsData = data.items.map((item) => {
        const subtotal = item.unitCost * item.quantity
        total += subtotal
        return {
          variantId: item.variantId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal,
        }
      })

      const purchase = await tx.purchase.create({
        data: {
          supplierId: data.supplierId,
          invoiceNo: data.invoiceNo,
          notes: data.notes,
          total,
          items: { create: itemsData },
        },
        include: { items: true },
      })

      for (const item of data.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        if (!variant) throw new Error(`Variante ${item.variantId} no encontrada`)

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })

        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId,
            type: StockMovementType.PURCHASE,
            quantity: item.quantity,
            previousStock: variant.stock,
            newStock: variant.stock + item.quantity,
            reason: `Compra #${purchase.id}`,
            reference: purchase.id,
          },
        })
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.CREATE,
          entity: 'Purchase',
          entityId: purchase.id,
          description: `Compra registrada. Factura: ${data.invoiceNo || 'N/A'}. Items: ${data.items.length}`,
          metadata: { invoiceNo: data.invoiceNo, itemsCount: data.items.length },
        },
      })

      return purchase
    })
  }
}

export const purchasesService = new PurchasesService()
