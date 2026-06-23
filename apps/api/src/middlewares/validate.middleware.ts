import type { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodSchema } from 'zod'
import { sendError } from '../lib/response'

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source])
      req[source] = parsed
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
        sendError(res, 'Error de validación', 400, messages)
        return
      }
      sendError(res, 'Error de validación', 400)
    }
  }
}
