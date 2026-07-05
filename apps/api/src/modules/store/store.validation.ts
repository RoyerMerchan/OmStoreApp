import { z } from 'zod'

const deliveryLocationSchema = z.object({
  country: z.string().min(1),
  city: z.string().min(1),
  zone: z.string().min(1),
  address: z.string().min(1),
})

export const createOrderSchema = z.object({
  deliveryLocation: deliveryLocationSchema,
  deliveryType: z.enum(['LOCAL', 'INTERNATIONAL', 'PICKUP']),
  paymentMethod: z.enum(['BS', 'USDT', 'ZELLE', 'CASH_ON_DELIVERY']),
  paymentReference: z.string().max(500).optional(),
  paymentDate: z.string().datetime().optional(),
  shippingUsdCents: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1),
})

export const checkShippingSchema = z.object({
  country: z.string().min(1),
  city: z.string().min(1),
  zone: z.string().min(1),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'REJECTED', 'CANCELLED']),
  reason: z.string().optional(),
})

export const exchangeRateSchema = z.object({
  rate: z.number().positive(),
})

export const uploadProofSchema = z.object({
  method: z.enum(['BS', 'USDT', 'ZELLE']),
  reference: z.string().min(1).max(500),
  declaredAmount: z.number().positive(),
  currency: z.enum(['Bs', 'USDT', 'USD']),
  proofFileUrl: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CheckShippingInput = z.infer<typeof checkShippingSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type UploadProofInput = z.infer<typeof uploadProofSchema>
