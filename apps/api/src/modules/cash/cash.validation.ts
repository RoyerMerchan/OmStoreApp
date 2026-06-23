import { z } from 'zod'

export const openCashSchema = z.object({
  openingAmount: z.number().min(0),
  notes: z.string().optional(),
})

export const closeCashSchema = z.object({
  closingAmount: z.number().min(0),
  notes: z.string().optional(),
})

export const cashMovementSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  concept: z.string().min(1),
  amount: z.number().positive(),
  notes: z.string().optional(),
})
