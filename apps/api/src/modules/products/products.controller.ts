import type { Response } from 'express'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import { sendSuccess, sendError } from '../../lib/response'
import { productService } from './products.service'

export const productController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const { name, search, brandId, categoryId, gender, isActive, active } = req.query
      const filters: any = {}
      const searchTerm = (name || search) as string
      if (searchTerm) filters.name = searchTerm
      if (brandId) filters.brandId = brandId as string
      if (categoryId) filters.categoryId = categoryId as string
      if (gender) filters.gender = gender as string
      const activeFlag = isActive ?? active
      if (activeFlag !== undefined) filters.isActive = activeFlag === 'true'

      const products = await productService.list(filters)
      sendSuccess(res, products)
    } catch (error) {
      sendError(res, 'Error fetching products', 500)
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const product = await productService.getById(req.params.id)
      if (!product) {
        return sendError(res, 'Product not found', 404)
      }
      sendSuccess(res, product)
    } catch (error) {
      sendError(res, 'Error fetching product', 500)
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const product = await productService.create(req.body)
      sendSuccess(res, product, 201)
    } catch (error) {
      sendError(res, 'Error creating product', 500)
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const product = await productService.update(req.params.id, req.body)
      sendSuccess(res, product)
    } catch (error) {
      sendError(res, 'Error updating product', 500)
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      await productService.delete(req.params.id)
      sendSuccess(res, { message: 'Product deleted' })
    } catch (error) {
      sendError(res, 'Error deleting product', 500)
    }
  },

  async createVariant(req: AuthRequest, res: Response) {
    try {
      const variant = await productService.createVariant(req.params.id, req.body)
      sendSuccess(res, variant, 201)
    } catch (error) {
      sendError(res, 'Error creating variant', 500)
    }
  },

  async updateVariant(req: AuthRequest, res: Response) {
    try {
      const variant = await productService.updateVariant(req.params.variantId, req.body)
      sendSuccess(res, variant)
    } catch (error) {
      sendError(res, 'Error updating variant', 500)
    }
  },
}
