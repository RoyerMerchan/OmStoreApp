import { z } from 'zod'

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
})

export const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
})
