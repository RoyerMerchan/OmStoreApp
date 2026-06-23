import { prisma } from '../../lib/prisma'

export class SuppliersService {
  async list(filters: { page?: number; limit?: number; search?: string }) {
    const page = filters.page || 1
    const limit = filters.limit || 20
    const where: any = {}

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { document: { contains: filters.search } },
        { phone: { contains: filters.search } },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supplier.count({ where }),
    ])
    return { data, total, page, limit }
  }

  async getById(id: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id } })
    if (!supplier) throw new Error('Proveedor no encontrado')
    return supplier
  }

  async create(input: { name: string; document?: string; phone?: string; email?: string; address?: string }) {
    return prisma.supplier.create({ data: input })
  }

  async update(id: string, input: { name?: string; document?: string; phone?: string; email?: string; address?: string; isActive?: boolean }) {
    const supplier = await prisma.supplier.findUnique({ where: { id } })
    if (!supplier) throw new Error('Proveedor no encontrado')
    return prisma.supplier.update({ where: { id }, data: input })
  }
}

export const suppliersService = new SuppliersService()
