import { z } from 'zod'
import { Gender } from '@omstore/shared'

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  gender: z.nativeEnum(Gender),
  baseCost: z.number().nonnegative(),
  basePrice: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
})

export const updateProductSchema = createProductSchema.partial()

export const createVariantSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().max(50),
  color: z.string().max(50),
  sku: z.string().min(1).max(100),
  barcode: z.string().max(100).optional(),
  cost: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(0),
})

export const updateVariantSchema = createVariantSchema.omit({ productId: true }).partial()
