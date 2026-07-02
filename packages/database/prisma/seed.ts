import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding users only...')

  const passwordHash = await bcrypt.hash('admin123', 10)

  const users = [
    { name: 'Admin Principal', email: 'admin@omstore.com', role: UserRole.ADMIN },
    { name: 'Gerente Tienda', email: 'manager@omstore.com', role: UserRole.MANAGER },
    { name: 'Cajero Demo', email: 'cajero@omstore.com', role: UserRole.CASHIER },
    { name: 'Vendedor Demo', email: 'vendedor@omstore.com', role: UserRole.SELLER },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
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

  console.log('Users created: admin@omstore.com / admin123 (all users)')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
