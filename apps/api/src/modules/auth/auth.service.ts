import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { signToken } from '../../lib/jwt'
import { AuditAction, StockMovementType } from '@omstore/shared'
import type { LoginInput } from './auth.validation'

export class AuthService {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } })
    if (!user || !user.isActive) {
      throw new Error('Credenciales inválidas')
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) {
      throw new Error('Credenciales inválidas')
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.LOGIN,
        entity: 'User',
        entityId: user.id,
        description: `Inicio de sesión: ${user.email}`,
      },
    })

    const token = signToken({ userId: user.id, role: user.role as any, name: user.name, email: user.email })

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    })
    if (!user) throw new Error('Usuario no encontrado')
    return user
  }
}

export const authService = new AuthService()
