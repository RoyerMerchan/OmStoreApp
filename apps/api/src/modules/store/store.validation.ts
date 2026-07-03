import { z } from 'zod'

const deliveryLocationSchema = z.object({
  country: z.string().min(1),
  city: z.string().min(1),
  zone: z.string().min(1),
  address: z.string().min(1),
})

export const createOrderSchema = z.object({
  guestName: z.string().min(1).max(200),
  guestPhone: z.string().min(1).max(50),
  guestEmail: z.string().email().max(200),
  deliveryLocation: deliveryLocationSchema,
  deliveryType: z.enum(['LOCAL', 'INTERNATIONAL', 'PICKUP']),
  paymentMethod: z.enum(['BS', 'USDT', 'ZELLE', 'CASH_ON_DELIVERY']),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1),
  proof: z.object({
    method: z.enum(['BS', 'USDT', 'ZELLE']),
    reference: z.string().min(1).max(500),
    currency: z.enum(['Bs', 'USDT', 'USD']),
    declaredAmount: z.number().positive(),
  }).optional(),
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

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CheckShippingInput = z.infer<typeof checkShippingSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
