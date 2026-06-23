import { prisma } from '../../lib/prisma'

export class DashboardService {
  async getSummary() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const [dailySales, monthlySales, totalProducts, totalStock, activeLayaways, expiredLayaways, openCash, allVariants] = await Promise.all([
      prisma.sale.aggregate({ where: { createdAt: { gte: today }, status: 'COMPLETED' }, _sum: { total: true }, _count: true }),
      prisma.sale.aggregate({ where: { createdAt: { gte: monthStart }, status: 'COMPLETED' }, _sum: { total: true }, _count: true }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.aggregate({ _sum: { stock: true } }),
      prisma.layaway.count({ where: { status: 'ACTIVE' } }),
      prisma.layaway.count({ where: { status: 'ACTIVE', dueDate: { lt: new Date() } } }),
      prisma.cashSession.findFirst({ where: { status: 'OPEN' }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.productVariant.findMany({ where: { isActive: true }, select: { stock: true, reservedStock: true, minStock: true } }),
    ])

    // Filter low stock in-memory: stock - reservedStock < minStock
    const lowStockCount = allVariants.filter(v => (v.stock - v.reservedStock) < v.minStock).length

    return {
      salesToday: dailySales._sum.total || 0,
      salesTodayCount: dailySales._count,
      salesMonth: monthlySales._sum.total || 0,
      salesMonthCount: monthlySales._count,
      totalProducts,
      totalStock: totalStock._sum.stock || 0,
      activeLayaways,
      lowStockCount,
      expiredLayaways,
      openCash: openCash ? { id: openCash.id, user: openCash.user.name, openingAmount: openCash.openingAmount } : null,
    }
  }

  async getTopProducts(limit = 10) {
    const products = await prisma.saleItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    })
    const variantIds = products.map(p => p.variantId)
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, size: true, color: true, price: true, product: { select: { id: true, name: true, basePrice: true, brand: { select: { name: true } } } } },
    })
    return products.map(p => {
      const v = variants.find(v => v.id === p.variantId)
      return {
        id: p.variantId,
        name: v?.product?.name || '',
        brand: v?.product?.brand?.name || '',
        size: v?.size || '',
        color: v?.color || '',
        totalSold: p._sum.quantity || 0,
        revenue: (p._sum.quantity || 0) * Number(v?.price || v?.product?.basePrice || 0),
      }
    })
  }

  async getLowStock() {
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { stock: 'asc' },
    })
    return variants
      .filter(v => (v.stock - v.reservedStock) < v.minStock)
      .map(v => ({
        id: v.id,
        productName: v.product.name,
        size: v.size,
        color: v.color,
        stock: v.stock,
        reservedStock: v.reservedStock,
        available: v.stock - v.reservedStock,
        minStock: v.minStock,
      }))
  }

  async getRecentActivity(limit = 10) {
    const [recentSales, recentMovements] = await Promise.all([
      prisma.sale.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: { select: { name: true } },
          customer: { select: { name: true } },
          items: true,
          payments: true,
        },
      }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: { select: { name: true } },
          variant: { include: { product: { select: { name: true } } } },
        },
      }),
    ])

    const formattedSales = recentSales.map(s => ({
      id: s.id,
      saleNumber: s.saleNumber,
      total: s.total,
      itemsCount: s.items.length,
      paymentMethod: s.payments[0]?.method || 'N/A',
      customerName: s.customer?.name || null,
      userName: s.user.name,
      createdAt: s.createdAt,
    }))

    const formattedMovements = recentMovements.map(m => ({
      id: m.id,
      type: m.type,
      quantity: m.quantity,
      productName: m.variant.product.name,
      size: m.variant.size,
      color: m.variant.color,
      userName: m.user?.name || null,
      reason: m.reason,
      createdAt: m.createdAt,
    }))

    return { recentSales: formattedSales, recentMovements: formattedMovements }
  }

  async getTopSizes(limit = 10) {
    const sizes = await prisma.saleItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 50,
    })
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: sizes.map(s => s.variantId) } },
      select: { id: true, size: true },
    })
    const sizeMap: Record<string, number> = {}
    for (const s of sizes) {
      const v = variants.find(v => v.id === s.variantId)
      if (v) sizeMap[v.size] = (sizeMap[v.size] || 0) + (s._sum.quantity || 0)
    }
    return Object.entries(sizeMap)
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  async getPaymentMethodStats() {
    const payments = await prisma.salePayment.groupBy({
      by: ['method'],
      _sum: { amount: true },
      _count: true,
    })
    return payments.map(p => ({ method: p.method, total: p._sum.amount || 0, count: p._count }))
  }
}

export const dashboardService = new DashboardService()
