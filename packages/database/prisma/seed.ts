import { PrismaClient, UserRole, Gender, StockMovementType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Admin user
  const passwordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@omstore.com' },
    update: {},
    create: {
      name: 'Admin Principal',
      email: 'admin@omstore.com',
      passwordHash,
      role: UserRole.ADMIN,
    },
  })
  console.log('  ✓ Admin user created')

  // Demo users
  const manager = await prisma.user.upsert({
    where: { email: 'manager@omstore.com' },
    update: {},
    create: {
      name: 'Gerente Tienda',
      email: 'manager@omstore.com',
      passwordHash,
      role: UserRole.MANAGER,
    },
  })
  await prisma.user.upsert({
    where: { email: 'cajero@omstore.com' },
    update: {},
    create: {
      name: 'Cajero Demo',
      email: 'cajero@omstore.com',
      passwordHash,
      role: UserRole.CASHIER,
    },
  })
  await prisma.user.upsert({
    where: { email: 'vendedor@omstore.com' },
    update: {},
    create: {
      name: 'Vendedor Demo',
      email: 'vendedor@omstore.com',
      passwordHash,
      role: UserRole.SELLER,
    },
  })
  console.log('  ✓ Demo users created')

  // 2. Brands
  const brandsData = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance']
  const brands: Record<string, string> = {}
  for (const name of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    brands[name] = brand.id
  }
  console.log('  ✓ Brands created')

  // 3. Categories
  const categoriesData = ['Fútbol', 'Running', 'Casual', 'Formal', 'Sandalias']
  const categories: Record<string, string> = {}
  for (const name of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    categories[name] = cat.id
  }
  console.log('  ✓ Categories created')

  // 4. Products with variants
  const productsConfig = [
    { name: 'Mercurial Superfly 9', brand: 'Nike', category: 'Fútbol', gender: Gender.MEN, baseCost: 80, basePrice: 180 },
    { name: 'Predator Accuracy.1', brand: 'Adidas', category: 'Fútbol', gender: Gender.MEN, baseCost: 75, basePrice: 170 },
    { name: 'Revolution 7', brand: 'New Balance', category: 'Running', gender: Gender.UNISEX, baseCost: 45, basePrice: 95 },
    { name: 'Calzado Casual Suede', brand: 'Puma', category: 'Casual', gender: Gender.UNISEX, baseCost: 35, basePrice: 75 },
    { name: 'Club C 85 Vintage', brand: 'Reebok', category: 'Casual', gender: Gender.WOMEN, baseCost: 40, basePrice: 85 },
  ]

  const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
  const colors = ['Negro', 'Blanco', 'Azul', 'Rojo']

  for (const cfg of productsConfig) {
    const product = await prisma.product.create({
      data: {
        name: cfg.name,
        brandId: brands[cfg.brand],
        categoryId: categories[cfg.category],
        gender: cfg.gender,
        baseCost: cfg.baseCost,
        basePrice: cfg.basePrice,
        description: `${cfg.name} - ${cfg.brand} - ${cfg.category}`,
        variants: {
          create: sizes.slice(0, 6).flatMap((size) =>
            colors.slice(0, 2).map((color) => {
              const sku = `${cfg.name.substring(0, 3).toUpperCase()}-${size}-${color.substring(0, 3).toUpperCase()}`
              const stock = Math.floor(Math.random() * 40) + 5
              const idx = sizes.indexOf(size)
              const priceAdjust = idx >= 3 ? 10 : 0

              return {
                size,
                color,
                sku: `${sku}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                barcode: `590${Math.random().toString().slice(2, 12)}`,
                cost: cfg.baseCost + (idx * 2),
                price: cfg.basePrice + priceAdjust,
                stock,
                reservedStock: 0,
                minStock: 3,
              }
            })
          ),
        },
      },
      include: { variants: true },
    })

    // Create initial stock movements for each variant
    for (const variant of product.variants) {
      await prisma.stockMovement.create({
        data: {
          variantId: variant.id,
          userId: admin.id,
          type: StockMovementType.PURCHASE,
          quantity: variant.stock,
          previousStock: 0,
          newStock: variant.stock,
          reason: 'Stock inicial',
          reference: 'SEED-001',
        },
      })
    }

    console.log(`  ✓ Product: ${cfg.name} (${product.variants.length} variants)`)
  }

  // 5. Suppliers
  const suppliersData = [
    { name: 'Distribuidora Nike Colombia', document: '900123456-1', phone: '3001112233' },
    { name: 'Adidas Supply Co', document: '900789012-3', phone: '3004445566' },
    { name: 'Importadora Deportiva SAS', document: '900345678-9', phone: '3007778899' },
  ]
  for (const s of suppliersData) {
    await prisma.supplier.create({ data: s })
  }
  console.log('  ✓ Suppliers created')

  // 6. Customers
  const customersData = [
    { name: 'Carlos Martínez', document: '1234567890', phone: '3101112233' },
    { name: 'María García', document: '9876543210', phone: '3104445566' },
    { name: 'Juan Pérez', document: '5555555555', phone: '3107778899' },
    { name: 'Ana López', document: '1111111111', phone: '3100001122' },
    { name: 'Pedro Ramirez', document: '2222222222', phone: '3103334455' },
  ]
  for (const c of customersData) {
    await prisma.customer.create({ data: c })
  }
  console.log('  ✓ Customers created')

  // 7. Expense categories
  const expenseCats = ['Transporte', 'Servicios', 'Comida', 'Pago proveedor', 'Otro']
  for (const name of expenseCats) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log('  ✓ Expense categories created')

  // 8. Demo cash session
  await prisma.cashSession.create({
    data: {
      userId: manager.id,
      openingAmount: 500000,
      notes: 'Apertura demo para pruebas',
    },
  })
  console.log('  ✓ Demo cash session created')

  console.log('\n✅ Seed completed successfully!')
  console.log('\n📋 Credenciales de prueba:')
  console.log('   Admin:   admin@omstore.com / admin123')
  console.log('   Manager: manager@omstore.com / admin123')
  console.log('   Cajero:  cajero@omstore.com / admin123')
  console.log('   Vendedor: vendedor@omstore.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
