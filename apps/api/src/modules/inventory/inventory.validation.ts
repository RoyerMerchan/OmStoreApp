import { z } from 'zod'
import { StockMovementType } from '@omstore/shared'

export const adjustmentSchema = z.object({
  variantId: z.string().uuid(),
  type: z.enum([StockMovementType.ADJUSTMENT_IN, StockMovementType.ADJUSTMENT_OUT]),
  quantity: z.number().int().positive(),
  reason: z.string().min(1).max(500),
})
