import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { UserRole } from '@omstore/shared'
import { prisma } from '../../lib/prisma'
import { sendSuccess, sendError } from '../../lib/response'
import type { AuthRequest } from '../../middlewares/auth.middleware'
import type { Response } from 'express'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  async (_req: AuthRequest, res: Response) => {
    try {
      const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })
      sendSuccess(res, brands)
    } catch (error) {
      sendError(res, 'Error fetching brands', 500)
    }
  },
)

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  async (req: AuthRequest, res: Response) => {
    try {
      const brand = await prisma.brand.create({ data: { name: req.body.name } })
      sendSuccess(res, brand, 201)
    } catch (error) {
      sendError(res, 'Error creating brand', 500)
    }
  },
)

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  async (req: AuthRequest, res: Response) => {
    try {
      const brand = await prisma.brand.update({
        where: { id: req.params.id },
        data: { name: req.body.name },
      })
      sendSuccess(res, brand)
    } catch (error) {
      sendError(res, 'Error updating brand', 500)
    }
  },
)

export default router
