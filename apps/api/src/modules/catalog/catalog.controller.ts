import type { Response, NextFunction } from 'express'
import type { Request } from 'express'
import { catalogService } from './catalog.service'
import { sendSuccess } from '../../lib/response'

export class CatalogController {
  async getCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const { size, brand, brandId, gender, search } = req.query as any
      const data = await catalogService.getCatalog({ size, brand, brandId, gender, search })
      sendSuccess(res, data)
    } catch (err) { next(err) }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { size, brandId, gender } = req.query as any
      const rows = await catalogService.exportCsv({ size, brandId, gender })

      if (rows.length === 0) {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="catalogo.csv"')
        return res.send('\ufeff')
      }

      const headers = Object.keys(rows[0])
      const csvLines = rows.map(row => headers.map(h => {
        const val = row[h]
        if (val == null) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(','))

      const bom = '\ufeff'
      const csv = bom + headers.join(',') + '\n' + csvLines.join('\n')

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="catalogo-${Date.now()}.csv"`)
      res.send(csv)
    } catch (err) { next(err) }
  }
}

export const catalogController = new CatalogController()
