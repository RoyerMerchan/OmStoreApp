import { z } from 'zod'

export const createPurchaseSchema = z.object({
  supplierId: z.string().optional(),
  invoiceNo: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
      unitCost: z.number().positive(),
    })
  ).min(1),
})

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>
