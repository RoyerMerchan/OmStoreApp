import { prisma } from '../../lib/prisma'
import { stringify } from 'csv-stringify/sync'

export class ReportsService {
  async salesReport(startDate: string, endDate: string) {
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) }, status: 'COMPLETED' },
      include: { items: { include: { variant: { include: { product: true } } } }, payments: true, user: { select: { name: true } }, customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return sales
  }

  async inventoryReport() {
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: { include: { brand: true, category: true } } },
      orderBy: [{ product: { name: 'asc' } }, { size: 'asc' }],
    })
    return variants.map(v => ({
      ...v,
      availableStock: v.stock - v.reservedStock,
    }))
  }

  async cashReport(startDate: string, endDate: string) {
    const sessions = await prisma.cashSession.findMany({
      where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } },
      include: { user: { select: { name: true } }, sales: { include: { payments: true } }, cashMovements: true, expenses: true },
      orderBy: { createdAt: 'desc' },
    })
    return sessions
  }

  async layawayReport(startDate: string, endDate: string) {
    const layaways = await prisma.layaway.findMany({
      where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } },
      include: { customer: { select: { name: true, document: true } }, items: { include: { variant: { include: { product: { select: { name: true } } } } } }, payments: true },
      orderBy: { createdAt: 'desc' },
    })
    return layaways
  }

  async profitReport(startDate: string, endDate: string) {
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) }, status: 'COMPLETED' },
      include: { items: true },
    })
    let totalRevenue = 0
    let totalCost = 0
    for (const sale of sales) {
      totalRevenue += Number(sale.total)
      for (const item of sale.items) {
        totalCost += Number(item.unitCost) * item.quantity
      }
    }
    return { totalRevenue, totalCost, totalProfit: totalRevenue - totalCost, margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2) : '0' }
  }

  exportToCsv(data: any[], filename: string): { csv: string; filename: string } {
    const csv = stringify(data, { header: true })
    return { csv, filename: `${filename}-${Date.now()}.csv` }
  }
}

export const reportsService = new ReportsService()
