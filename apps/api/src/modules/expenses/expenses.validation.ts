import { z } from 'zod'

export const createExpenseSchema = z.object({
  categoryId: z.string().optional(),
  concept: z.string().min(1, 'Concepto requerido'),
  amount: z.number().positive('Monto debe ser positivo'),
  notes: z.string().optional(),
})

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
