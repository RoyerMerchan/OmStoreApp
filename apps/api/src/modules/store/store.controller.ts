import { Request, Response } from 'express'
import * as storeService from './store.service'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'proofs')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, UPLOAD_DIR),
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname)
    cb(null, `proof-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) return cb(null, true)
    cb(new Error('Tipo de archivo no permitido. Use JPG, PNG o PDF'), false)
  },
})

export async function getProducts(req: Request, res: Response) {
  try {
    const { search, categoryId, gender } = req.query
    const result = await storeService.getProducts(
      search as string,
      categoryId as string,
      gender as string,
    )
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function getProductDetail(req: Request, res: Response) {
  try {
    const result = await storeService.getProductDetail(req.params.id)
    if (!result) return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function getExchangeRate(_req: Request, res: Response) {
  try {
    const rate = await storeService.getLatestExchangeRate()
    res.json({ success: true, data: { rate } })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function checkShipping(req: Request, res: Response) {
  try {
    const { country, city, zone } = req.body
    const result = storeService.checkShipping(country, city, zone)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const order = await storeService.createOrder(req.body)
    res.status(201).json({ success: true, data: order })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export async function uploadProof(req: any, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Archivo requerido' })
    const url = `/uploads/proofs/${req.file.filename}`
    res.json({ success: true, data: { url } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const order = await storeService.getOrder(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
    res.json({ success: true, data: order })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function listOrders(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined
    const orders = await storeService.listOrders(status)
    res.json({ success: true, data: orders })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const order = await storeService.updateOrderStatus(req.params.id, req.body.status, req.body.reason)
    res.json({ success: true, data: order })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export async function setExchangeRate(req: Request, res: Response) {
  try {
    const rate = await storeService.updateExchangeRate(req.body.rate)
    res.json({ success: true, data: rate })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function getNotifications(req: Request, res: Response) {
  try {
    const unreadOnly = req.query.unread === 'true'
    const notifications = await storeService.getNotifications(unreadOnly)
    res.json({ success: true, data: notifications })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export async function markNotificationRead(req: Request, res: Response) {
  try {
    const notif = await storeService.markNotificationRead(req.params.id)
    res.json({ success: true, data: notif })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}
