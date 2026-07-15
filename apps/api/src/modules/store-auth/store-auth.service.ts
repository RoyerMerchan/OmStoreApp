import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { signToken } from '../../lib/jwt'
import { UserRole } from '@omstore/shared'
import type { RegisterInput, LoginInput, UpdateProfileInput } from './store-auth.validation'

export class StoreAuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing) {
      throw new Error('El email ya está registrado')
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: UserRole.CLIENT,
        clientProfile: {
          create: {
            phone: input.phone,
          },
        },
      },
      select: { id: true, name: true, email: true, role: true },
    })

    const token = signToken({ userId: user.id, role: user.role as any, name: user.name, email: user.email })

    return { token, user }
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { clientProfile: true },
    })

    if (!user || !user.isActive) {
      throw new Error('Credenciales inválidas')
    }

    if (user.role !== UserRole.CLIENT) {
      throw new Error('Esta cuenta no es de cliente')
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) {
      throw new Error('Credenciales inválidas')
    }

    const token = signToken({ userId: user.id, role: user.role as any, name: user.name, email: user.email })

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.clientProfile,
      },
    }
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        clientProfile: {
          select: { phone: true, address: true, city: true, state: true, zipCode: true },
        },
      },
    })
    if (!user) throw new Error('Usuario no encontrado')
    return user
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        clientProfile: {
          update: {
            phone: input.phone,
            address: input.address,
            city: input.city,
            state: input.state,
            zipCode: input.zipCode,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        clientProfile: {
          select: { phone: true, address: true, city: true, state: true, zipCode: true },
        },
      },
    })
    return user
  }
}

export const storeAuthService = new StoreAuthService()
