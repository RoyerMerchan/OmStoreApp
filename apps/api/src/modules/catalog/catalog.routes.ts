import { Router } from 'express'
import { catalogController } from './catalog.controller'

export const catalogRoutes = Router()

catalogRoutes.get('/', catalogController.getCatalog.bind(catalogController))
catalogRoutes.get('/export', catalogController.exportCsv.bind(catalogController))
