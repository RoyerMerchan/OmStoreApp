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
      const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
      sendSuccess(res, categories)
    } catch (error) {
      sendError(res, 'Error fetching categories', 500)
    }
  },
)

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  async (req: AuthRequest, res: Response) => {
    try {
      const category = await prisma.category.create({ data: { name: req.body.name } })
      sendSuccess(res, category, 201)
    } catch (error) {
      sendError(res, 'Error creating category', 500)
    }
  },
)

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  async (req: AuthRequest, res: Response) => {
    try {
      const category = await prisma.category.update({
        where: { id: req.params.id },
        data: { name: req.body.name },
      })
      sendSuccess(res, category)
    } catch (error) {
      sendError(res, 'Error updating category', 500)
    }
  },
)

export default router
