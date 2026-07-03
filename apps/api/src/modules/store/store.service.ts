import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

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
    // handled above
}

export async function createOrder(input: any) {
  const rate = await getLatestExchangeRate()

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
  const shippingUsdCents = input.deliveryType === 'PICKUP' ? 0 : 0
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
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestEmail: input.guestEmail,
        deliveryLocation: input.deliveryLocation,
        deliveryType: input.deliveryType,
        paymentMethod: input.paymentMethod,
        status: input.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING_PAYMENT' : 'PENDING_PAYMENT',
        subtotalUsdCents,
        shippingUsdCents,
        totalUsdCents,
        exchangeRateUsed: rate,
        items: {
          create: itemsWithPrices.map((i) => ({
            variantId: i.variant.id,
            quantity: i.quantity,
            unitPriceUsdCents: i.unitPriceCents,
          })),
        },
      },
      include: { items: true },
    })

    if (input.proof) {
      await tx.paymentProof.create({
        data: {
          orderId: created.id,
          method: input.proof.method,
          reference: input.proof.reference,
          declaredAmount: input.proof.declaredAmount,
          currency: input.proof.currency,
        },
      })
      await tx.storeOrder.update({
        where: { id: created.id },
        data: { status: 'PAYMENT_DECLARED' },
      })
    }

    await tx.notification.create({
      data: {
        type: 'new_order',
        title: `Nuevo pedido #${orderNumber}`,
        message: `${input.guestName} - ${input.paymentMethod === 'CASH_ON_DELIVERY' ? 'Contraentrega' : `Pago ${input.paymentMethod}`}`,
        data: { orderId: created.id, orderNumber },
      },
    })

    created.status = input.proof ? 'PAYMENT_DECLARED' : 'PENDING_PAYMENT'
    return created
  })

  return order
}

export async function getOrder(orderId: string) {
  const order = await prisma.storeOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      paymentProofs: true,
    },
  })
  return order
}

export async function listOrders(status?: string) {
  const where: any = {}
  if (status) where.status = status

  return prisma.storeOrder.findMany({
    where,
    include: {
      items: { include: { variant: { include: { product: true } } } },
      paymentProofs: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateOrderStatus(orderId: string, status: string, reason?: string) {
  const order = await prisma.storeOrder.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!order) throw new Error('Pedido no encontrado')

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
    }

    if (status === 'REJECTED' || status === 'CANCELLED') {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { decrement: item.quantity } },
        })
      }
    }

    return tx.storeOrder.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        paymentProofs: true,
      },
    })
  })
}

export async function updateExchangeRate(rate: number) {
  return prisma.exchangeRate.create({ data: { rate } })
}

export async function getNotifications(unreadOnly = false) {
  const where: any = {}
  if (unreadOnly) where.read = false
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { read: true } })
}
