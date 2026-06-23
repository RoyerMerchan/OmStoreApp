import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import type { CreateUserInput, UpdateUserInput } from './users.validation'

export class UsersService {
  async list() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(input: CreateUserInput) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } })
    if (exists) throw new Error('El email ya está registrado')

    const passwordHash = await bcrypt.hash(input.password, 10)
    return prisma.user.create({
      data: { ...input, passwordHash },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })
  }

  async update(id: string, input: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new Error('Usuario no encontrado')

    const data: any = { ...input }
    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 10)
      delete data.password
    }

    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })
  }

  async toggleStatus(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new Error('Usuario no encontrado')

    return prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })
  }
}

export const usersService = new UsersService()
