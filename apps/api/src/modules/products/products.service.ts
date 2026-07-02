import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'

interface ListFilters {
  name?: string
  brandId?: string
  categoryId?: string
  gender?: string
  isActive?: boolean
}

interface CreateProductInput {
  name: string
  description?: string
  gender: string
  baseCost: number
  basePrice: number
  imageUrl?: string
  brandId?: string
  categoryId?: string
}

interface UpdateProductInput {
  name?: string
  description?: string
  gender?: string
  baseCost?: number
  basePrice?: number
  imageUrl?: string
  brandId?: string
  categoryId?: string
}

interface CreateVariantInput {
  productId: string
  size: string
  color: string
  sku: string
  barcode?: string
  cost?: number
  price?: number
  stock: number
  minStock: number
}

interface UpdateVariantInput {
  size?: string
  color?: string
  sku?: string
  barcode?: string
  cost?: number
  price?: number
  stock?: number
  minStock?: number
}

export const productService = {
  async list(filters: ListFilters = {}) {
    const where: Prisma.ProductWhereInput = {}

    if (filters.name) {
      where.name = { contains: filters.name }
    }
    if (filters.brandId) where.brandId = filters.brandId
    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.gender) where.gender = filters.gender as any
    if (filters.isActive !== undefined) where.isActive = filters.isActive

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        variants: filters.name ? { where: { isActive: true }, take: 20 } : false,
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (filters.name) {
      return products.flatMap((p) =>
        (p as any).variants.map((v: any) => ({
          id: v.id,
          productId: p.id,
          name: p.name,
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
          price: v.price || p.basePrice,
          cost: v.cost || p.baseCost,
        }))
      )
    }

    return products
  },

  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: true,
      },
    })
  },

  async create(input: CreateProductInput) {
    const data: any = { ...input }
    if (!data.brandId) delete data.brandId
    if (!data.categoryId) delete data.categoryId
    return prisma.product.create({ data })
  },

  async update(id: string, input: UpdateProductInput) {
    const data: any = { ...input }
    if (!data.brandId) delete data.brandId
    if (!data.categoryId) delete data.categoryId
    return prisma.product.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    })
  },

  async createVariant(productId: string, input: Omit<CreateVariantInput, 'productId'>) {
    return prisma.productVariant.create({
      data: { ...input, productId },
    })
  },

  async updateVariant(variantId: string, input: UpdateVariantInput) {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: input,
    })
  },
}
