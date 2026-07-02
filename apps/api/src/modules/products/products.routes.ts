import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { UserRole } from '@omstore/shared'
import { productController } from './products.controller'
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
} from './products.validation'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.SELLER),
  productController.list,
)

router.get('/:id', authenticate, productController.getById)

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validate(createProductSchema),
  productController.create,
)

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validate(updateProductSchema),
  productController.update,
)

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  productController.delete,
)

router.post(
  '/:id/variants',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validate(createVariantSchema.omit({ productId: true })),
  productController.createVariant,
)

router.patch(
  '/variants/:variantId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validate(updateVariantSchema),
  productController.updateVariant,
)

export default router
