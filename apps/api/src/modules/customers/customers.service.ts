import { prisma } from '../../lib/prisma'

export class CustomersService {
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
      prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ])
    return { data, total, page, limit }
  }

  async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          include: { items: { include: { variant: { include: { product: { select: { name: true } } } } } }, payments: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        layaways: {
          include: { items: { include: { variant: { include: { product: { select: { name: true } } } } } }, payments: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!customer) throw new Error('Cliente no encontrado')
    return customer
  }

  async create(input: { name: string; document?: string; phone?: string; email?: string; address?: string }) {
    if (input.document) {
      const existing = await prisma.customer.findUnique({ where: { document: input.document } })
      if (existing) throw new Error('Ya existe un cliente con ese documento')
    }
    return prisma.customer.create({ data: input })
  }

  async update(id: string, input: { name?: string; document?: string; phone?: string; email?: string; address?: string; isActive?: boolean }) {
    const customer = await prisma.customer.findUnique({ where: { id } })
    if (!customer) throw new Error('Cliente no encontrado')

    if (input.document && input.document !== customer.document) {
      const existing = await prisma.customer.findUnique({ where: { document: input.document } })
      if (existing) throw new Error('Ya existe un cliente con ese documento')
    }

    return prisma.customer.update({ where: { id }, data: input })
  }
}

export const customersService = new CustomersService()
