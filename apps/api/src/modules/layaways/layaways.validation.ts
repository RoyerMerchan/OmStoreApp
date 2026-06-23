import { z } from 'zod'

export const createLayawaySchema = z.object({
  customerId: z.string(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1, 'Debe tener al menos un producto'),
  initialPayment: z.number().min(0),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  notes: z.string().optional(),
})

export const addPaymentSchema = z.object({
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'MOBILE_PAYMENT', 'MIXED']),
  amount: z.number().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export const cancelLayawaySchema = z.object({
  reason: z.string().min(1, 'Debe indicar un motivo'),
})
