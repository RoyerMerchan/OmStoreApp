import { prisma } from '../../lib/prisma'

export class CatalogService {
  async getCatalog(filters: { size?: string; brand?: string; brandId?: string; gender?: string; search?: string }) {
    const where: any = { isActive: true }
    const productWhere: any = { isActive: true }

    if (filters.size) where.size = filters.size
    if (filters.brandId) productWhere.brandId = filters.brandId
    if (filters.brand) productWhere.brand = { name: { contains: filters.brand } }
    if (filters.gender) productWhere.gender = filters.gender as any
    if (filters.search) productWhere.name = { contains: filters.search }

    where.product = productWhere

    const variants = await prisma.productVariant.findMany({
      where,
      include: { product: { include: { brand: true, category: true } } },
      orderBy: [{ product: { name: 'asc' } }, { size: 'asc' }],
    })

    const available = variants.filter(v => (v.stock - v.reservedStock) > 0)

    const sizeMap = new Map<string, any[]>()
    const sizeCount = new Map<string, number>()
    for (const v of available) {
      const s = v.size
      if (!sizeMap.has(s)) sizeMap.set(s, [])
      sizeMap.get(s)!.push({
        variantId: v.id,
        productId: v.productId,
        productName: v.product.name,
        brand: v.product.brand?.name || '',
        category: v.product.category?.name || '',
        gender: v.product.gender,
        color: v.color,
        size: v.size,
        price: v.price || v.product.basePrice,
        availableStock: v.stock - v.reservedStock,
        barcode: v.barcode || v.sku,
        imageUrl: v.product.imageUrl,
      })
      sizeCount.set(s, (sizeCount.get(s) || 0) + 1)
    }

    const sortedSizes = [...sizeMap.keys()].sort((a, b) => Number(a) - Number(b))
    const brandSet = new Set(available.map(v => v.product.brand?.name).filter(Boolean))

    return {
      generatedAt: new Date().toISOString(),
      totalVariants: available.length,
      sizes: sortedSizes.map(s => ({ size: s, items: sizeMap.get(s)! })),
      sizeSummary: sortedSizes.map(s => ({ size: s, count: sizeCount.get(s)! })),
      brands: [...brandSet].sort(),
    }
  }

  async exportCsv(filters: { size?: string; brandId?: string; gender?: string }) {
    const catalog = await this.getCatalog(filters)
    const rows: any[] = []
    for (const sizeGroup of catalog.sizes) {
      for (const item of sizeGroup.items) {
        rows.push({
          Producto: item.productName,
          Marca: item.brand,
          Categoria: item.category,
          Genero: item.gender,
          Talla: item.size,
          Color: item.color,
          Precio: item.price,
          Stock: item.availableStock,
          Codigo: item.barcode,
        })
      }
    }
    return rows
  }
}

export const catalogService = new CatalogService()
