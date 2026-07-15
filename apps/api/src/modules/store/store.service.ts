import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
import { sendNewOrderAlertToAdmins, sendOrderConfirmationToClient } from '../../lib/email'

const prisma = new PrismaClient()

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'proofs')

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

type DeliveryType = 'LOCAL' | 'INTERNATIONAL' | 'PICKUP'
const STORE_ZONES: Record<string, { type: DeliveryType; costCents: number }> = {
  'caracas:libertador': { type: 'LOCAL', costCents: 0 },
  'caracas:chacao': { type: 'LOCAL', costCents: 300 },
  'caracas:baruta': { type: 'LOCAL', costCents: 500 },
  'caracas:sucre': { type: 'LOCAL', costCents: 500 },
  'caracas:el_hatillo': { type: 'LOCAL', costCents: 800 },
  'miranda:los_teques': { type: 'LOCAL', costCents: 3000 },
  'miranda:altos_mirandinos': { type: 'LOCAL', costCents: 3500 },
  'miranda:valles_del_tuy': { type: 'LOCAL', costCents: 4000 },
  'miranda:gualcaipuro': { type: 'LOCAL', costCents: 3000 },
}

export async function getLatestExchangeRate() {
  const rate = await prisma.exchangeRate.findFirst({ orderBy: { createdAt: 'desc' } })
  return rate ? Number(rate.rate) : 60
}

export async function getProducts(search?: string, categoryId?: string, gender?: string) {
  const where: any = {
    isActive: true,
    product: { isActive: true },
  }
  if (search) {
    where.product = { ...where.product, name: { contains: search } }
  }
  if (gender) {
    where.product = { ...where.product, gender }
  }
  if (categoryId) {
    where.product = { ...where.product, categoryId }
  }

  const variants = await prisma.productVariant.findMany({
    where: { ...where, stock: { gt: 0 } },
    include: {
      product: {
        include: { brand: true, category: true },
      },
    },
    orderBy: { product: { name: 'asc' } },
  })

  const rate = await getLatestExchangeRate()

  return variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    stock: v.stock - v.reservedStock,
    sku: v.sku,
    priceUsdCents: Math.round(Number(v.price ?? v.product.basePrice) * 100),
    priceBs: Number(v.price ?? v.product.basePrice) * rate,
    exchangeRate: rate,
    product: {
      id: v.product.id,
      name: v.product.name,
      description: v.product.description,
      gender: v.product.gender,
      imageUrl: v.product.imageUrl,
      brand: v.product.brand?.name ?? null,
      category: v.product.category?.name ?? null,
    },
  }))
}

export async function getProductDetail(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      brand: true,
      category: true,
      variants: {
        where: { isActive: true },
        orderBy: [{ size: 'asc' }, { color: 'asc' }],
      },
    },
  })

  if (!product || !product.isActive) return null

  const rate = await getLatestExchangeRate()

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    gender: product.gender,
    imageUrl: product.imageUrl,
    brand: product.brand?.name ?? null,
    category: product.category?.name ?? null,
    priceUsdCents: Math.round(Number(product.basePrice) * 100),
    priceBs: Number(product.basePrice) * rate,
    exchangeRate: rate,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock - v.reservedStock,
      sku: v.sku,
      priceUsdCents: Math.round(Number(v.price ?? product.basePrice) * 100),
      priceBs: Number(v.price ?? product.basePrice) * rate,
    })),
  }
}

export function checkShipping(country: string, city: string, zone: string) {
  const key = `${city.toLowerCase()}:${zone.toLowerCase().replace(/\s+/g, '_')}`
  const zoneConfig = STORE_ZONES[key]

  if (zoneConfig) {
    return {
      deliveryType: zoneConfig.type,
      shippingUsdCents: zoneConfig.costCents,
      available: true,
      message: `Envío ${zoneConfig.type === 'LOCAL' ? 'local' : 'internacional'} disponible`,
    }
  }

  if (country.toLowerCase() !== 'venezuela') {
    return {
      deliveryType: 'INTERNATIONAL' as DeliveryType,
      shippingUsdCents: 0,
      available: true,
      message: 'Envío internacional — el costo se confirmará con el asesor',
    }
  }

  return {
    deliveryType: 'PICKUP' as DeliveryType,
    shippingUsdCents: 0,
    available: true,
    message: 'Retiro en tienda disponible',
  }
}

export async function createOrder(input: any, clientId: string) {
  const rate = await getLatestExchangeRate()

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    include: { clientProfile: true },
  })
  if (!client) throw new Error('Cliente no encontrado')

  const itemsWithPrices = await Promise.all(
    input.items.map(async (item: any) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      })
      if (!variant || !variant.isActive) throw new Error(`Variante ${item.variantId} no encontrada`)
      if (variant.stock - variant.reservedStock < item.quantity) {
        throw new Error(`Stock insuficiente para variante ${variant.sku}`)
      }
      const unitPriceCents = Math.round(Number(variant.price ?? variant.product.basePrice) * 100)
      return { variant, quantity: item.quantity, unitPriceCents }
    })
  )

  const subtotalUsdCents = itemsWithPrices.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0)
  const shippingUsdCents = input.deliveryType === 'PICKUP' ? 0 : (input.shippingUsdCents ?? 0)
  const totalUsdCents = subtotalUsdCents + shippingUsdCents

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const order = await prisma.$transaction(async (tx) => {
    for (const item of itemsWithPrices) {
      await tx.productVariant.update({
        where: { id: item.variant.id },
        data: {
          reservedStock: { increment: item.quantity },
        },
      })
      await tx.stockMovement.create({
        data: {
          variantId: item.variant.id,
          type: 'ECOMMERCE_RESERVE',
          quantity: item.quantity,
          previousStock: item.variant.stock,
          newStock: item.variant.stock,
          reason: `Reserva orden ${orderNumber}`,
        },
      })
    }

    const created = await tx.storeOrder.create({
      data: {
        orderNumber,
        clientId,
        deliveryLocation: input.deliveryLocation,
        deliveryType: input.deliveryType,
        paymentMethod: input.paymentMethod,
        paymentReference: input.paymentReference,
        paymentDate: input.paymentDate,
        status: 'PENDING_PAYMENT',
        subtotalUsdCents,
        shippingUsdCents,
        totalUsdCents,
        exchangeRateUsed: rate,
        notes: input.notes,
        items: {
          create: itemsWithPrices.map((i) => ({
            variantId: i.variant.id,
            quantity: i.quantity,
            unitPriceUsdCents: i.unitPriceCents,
          })),
        },
        notification: {
          create: {},
        },
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        client: { select: { name: true, email: true } },
        notification: true,
      },
    })

    return created
  })

  const totalBs = (order.totalUsdCents * rate).toLocaleString('es-VE', { style: 'currency', currency: 'VES' })
  const itemsFormatted = order.items.map((i) => ({
    name: i.variant.product.name,
    quantity: i.quantity,
    price: totalBs,
  }))

  try {
    await sendNewOrderAlertToAdmins({
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientName: order.client.name,
      clientEmail: order.client.email,
      total: totalBs,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference ?? undefined,
      items: itemsFormatted,
    })
    await prisma.storeNotification.update({
      where: { id: order.notification!.id },
      data: { adminEmailSent: true, adminEmailSentAt: new Date() },
    })
  } catch (e) {
    console.error('Failed to send admin email:', e)
  }

  return order
}

export async function getOrder(orderId: string, clientId?: string) {
  const where: any = { id: orderId }
  if (clientId) where.clientId = clientId

  const order = await prisma.storeOrder.findFirst({
    where,
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      paymentProof: true,
      client: { select: { id: true, name: true, email: true, clientProfile: true } },
    },
  })
  return order
}

export async function listClientOrders(clientId: string) {
  return prisma.storeOrder.findMany({
    where: { clientId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      paymentProof: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function listOrders(status?: string) {
  const where: any = {}
  if (status) where.status = status

  return prisma.storeOrder.findMany({
    where,
    include: {
      items: { include: { variant: { include: { product: true } } } },
      paymentProof: true,
      client: { select: { id: true, name: true, email: true, clientProfile: true } },
      notification: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateOrderStatus(orderId: string, status: string, reason?: string) {
  const order = await prisma.storeOrder.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      client: { select: { name: true, email: true } },
      notification: true,
    },
  })
  if (!order) throw new Error('Pedido no encontrado')

  const rate = await getLatestExchangeRate()
  const totalBs = (order.totalUsdCents * rate).toLocaleString('es-VE', { style: 'currency', currency: 'VES' })

  return prisma.$transaction(async (tx) => {
    if (status === 'CONFIRMED') {
      for (const item of order.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        if (!variant) continue
        const newStock = variant.stock - item.quantity
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: newStock,
            reservedStock: { decrement: item.quantity },
          },
        })
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: 'ECOMMERCE_CONFIRM',
            quantity: item.quantity,
            previousStock: variant.stock,
            newStock,
            reason: `Confirmación orden ${order.orderNumber}`,
          },
        })
      }

      try {
        await sendOrderConfirmationToClient(
          order.client.email,
          order.client.name,
          order.orderNumber,
          totalBs,
          order.paymentMethod,
          order.paymentReference ?? undefined
        )
        if (order.notification) {
          await tx.storeNotification.update({
            where: { id: order.notification.id },
            data: { clientEmailSent: true, clientEmailSentAt: new Date() },
          })
        }
      } catch (e) {
        console.error('Failed to send confirmation email:', e)
      }
    }

    if (status === 'REJECTED' || status === 'CANCELLED') {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { decrement: item.quantity } },
        })
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: 'ECOMMERCE_CANCEL',
            quantity: item.quantity,
            previousStock: (await tx.productVariant.findUnique({ where: { id: item.variantId } }))!.stock,
            newStock: (await tx.productVariant.findUnique({ where: { id: item.variantId } }))!.stock,
            reason: `Rechazo orden ${order.orderNumber}`,
          },
        })
      }
    }

    return tx.storeOrder.update({
      where: { id: orderId },
      data: { status: status as any, notes: reason ? `${order.notes || ''}\nRazón: ${reason}`.trim() : order.notes },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        paymentProof: true,
        client: { select: { id: true, name: true, email: true, clientProfile: true } },
        notification: true,
      },
    })
  })
}

export async function uploadPaymentProof(orderId: string, clientId: string, data: {
  method: string
  reference: string
  declaredAmount: number
  currency: string
  proofFileUrl?: string
}) {
  const order = await prisma.storeOrder.findFirst({
    where: { id: orderId, clientId },
  })
  if (!order) throw new Error('Pedido no encontrado')
  if (order.status !== 'PENDING_PAYMENT') throw new Error('No se puede subir comprobante')

  return prisma.$transaction(async (tx) => {
    const proof = await tx.paymentProof.upsert({
      where: { orderId },
      create: {
        orderId,
        method: data.method as any,
        reference: data.reference,
        declaredAmount: data.declaredAmount,
        currency: data.currency,
        proofFileUrl: data.proofFileUrl,
      },
      update: {
        method: data.method as any,
        reference: data.reference,
        declaredAmount: data.declaredAmount,
        currency: data.currency,
        proofFileUrl: data.proofFileUrl,
      },
    })

    await tx.storeOrder.update({
      where: { id: orderId },
      data: {
        status: 'PAYMENT_DECLARED',
        paymentReference: data.reference,
        paymentDate: new Date(),
      },
    })

    return proof
  })
}

export async function updateExchangeRate(rate: number) {
  return prisma.exchangeRate.create({ data: { rate } })
}

export async function getStoreNotifications(unreadOnly = false) {
  const where: any = {}
  if (unreadOnly) where.adminEmailSent = false

  const notifications = await prisma.storeNotification.findMany({
    where,
    include: {
      order: {
        include: {
          client: { select: { name: true, email: true } },
          items: { include: { variant: { include: { product: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return notifications
}
