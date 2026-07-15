import { z } from 'zod'

export const loginSchema = z.object({
  // Acepta un usuario (ej. "admin") o un email
  email: z.string().trim().min(1, 'Ingresa tu usuario'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>
