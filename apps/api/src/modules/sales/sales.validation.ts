import { z } from 'zod'

export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().min(0).default(0),
  })).min(1, 'Debe tener al menos un producto'),
  payments: z.array(z.object({
    method: z.enum(['CASH', 'CARD', 'TRANSFER', 'MOBILE_PAYMENT', 'MIXED']),
    amount: z.number().positive(),
    reference: z.string().optional(),
  })).min(1, 'Debe tener al menos un método de pago'),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
})

export const cancelSaleSchema = z.object({
  reason: z.string().min(1, 'Debe indicar un motivo'),
})

export const refundSaleSchema = z.object({
  items: z.array(z.object({
    saleItemId: z.string(),
    quantity: z.number().int().positive(),
  })).optional(),
  reason: z.string().min(1),
})
