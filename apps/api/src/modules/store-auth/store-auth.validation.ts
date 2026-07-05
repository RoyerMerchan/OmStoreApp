import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().max(200),
  password: z.string().min(6).max(100),
  phone: z.string().max(50).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
