import { execSync } from 'child_process'
import * as path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')

function run(cmd: string, cwd = ROOT) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

async function main() {
  console.log('🚀 OmStore Setup\n')

  // 1. Install dependencies
  console.log('📦 Instalando dependencias...')
  run('pnpm install')

  // 2. Generate Prisma Client
  console.log('\n🔧 Generando Prisma Client...')
  run('pnpm db:generate')

  // 3. Try to create database if not exists
  console.log('\n🗄️  Verificando/Creando base de datos...')
  try {
    run('npx prisma db push --accept-data-loss', path.resolve(ROOT, 'packages/database'))
    console.log('  ✓ Base de datos sincronizada')
  } catch {
    console.log('  ⚠️  No se pudo conectar a la BD. Verifica DATABASE_URL en .env')
    console.log('  Luego ejecuta: pnpm db:push')
    process.exit(1)
  }

  // 4. Run seed
  console.log('\n🌱 Poblando base de datos...')
  try {
    run('pnpm db:seed')
  } catch {
    console.log('  ⚠️  Seed falló. Quizás ya hay datos. Ejecuta: pnpm db:seed')
  }

  console.log('\n✅ Setup completado!')
  console.log('\n📋 Para iniciar: pnpm dev')
  console.log('   Admin: admin@omstore.com / admin123')
}

main().catch(console.error)
