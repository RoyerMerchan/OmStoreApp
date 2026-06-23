import type { Response } from 'express'
import type { ApiResponse } from '@omstore/shared'

export function sendSuccess<T>(res: Response, data: T, messageOrStatus?: string | number, status?: number): void {
  if (typeof messageOrStatus === 'number') {
    const body: ApiResponse<T> = { success: true, message: 'Ok', data }
    res.status(messageOrStatus).json(body)
    return
  }
  const body: ApiResponse<T> = { success: true, message: messageOrStatus || 'Ok', data }
  res.status(status || 200).json(body)
}

export function sendError(res: Response, message: string, status = 400, error?: unknown): void {
  const body: ApiResponse = {
    success: false,
    message,
    ...(error ? { error } : {}),
  }
  res.status(status).json(body)
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Ok'
): void {
  res.status(200).json({
    success: true,
    message,
    data,
    total,
    page,
    limit,
  })
}
