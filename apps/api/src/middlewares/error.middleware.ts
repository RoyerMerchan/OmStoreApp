import type { Request, Response, NextFunction } from 'express'
import { sendError } from '../lib/response'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[ERROR]', err.message, err.stack)
  sendError(res, 'Error interno del servidor', 500, process.env.NODE_ENV === 'development' ? err.message : undefined)
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 'Ruta no encontrada', 404)
}
