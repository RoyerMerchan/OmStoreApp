import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding users only...')

  const users = [
    { name: 'Admin Principal', email: 'admin', role: UserRole.ADMIN, password: '123456' },
    { name: 'Gerente Tienda', email: 'manager@omstore.com', role: UserRole.MANAGER, password: 'admin123' },
    { name: 'Cajero Demo', email: 'cajero@omstore.com', role: UserRole.CASHIER, password: 'admin123' },
    { name: 'Vendedor Demo', email: 'vendedor@omstore.com', role: UserRole.SELLER, password: 'admin123' },
  ]

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash },
      create: { name: u.name, email: u.email, role: u.role, passwordHash },
    })
  }

  // Expense categories
  const expenseCats = ['Transporte', 'Servicios', 'Comida', 'Pago proveedor', 'Otro']
  for (const name of expenseCats) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log('Expense categories created')

  console.log('Users created: admin / 123456 (ADMIN) — manager|cajero|vendedor@omstore.com / admin123')

  // Exchange rate
  const existingRate = await prisma.exchangeRate.findFirst()
  if (!existingRate) {
    await prisma.exchangeRate.create({ data: { rate: 60 } })
    console.log('Exchange rate created: 60 Bs/USD')
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
