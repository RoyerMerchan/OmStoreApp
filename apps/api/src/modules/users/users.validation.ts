import { z } from 'zod'
import { UserRole } from '@omstore/shared'

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  role: z.nativeEnum(UserRole),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
