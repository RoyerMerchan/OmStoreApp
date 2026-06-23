# OmStore - Sistema Administrativo POS para Tienda de Zapatos

Monorepo con backend (Express + TypeScript + Prisma) y frontend (React + Vite + TypeScript + Tailwind).

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Base de datos | MySQL / MariaDB |
| Autenticación | JWT + bcryptjs |
| Validaciones | Zod (backend y frontend) |
| UI | Lucide React, Recharts, Sonner |
| Estado | Zustand |
| Contenedores | Docker + Docker Compose |

## Estructura

```
/
├── apps/
│   ├── api/          # Backend Express
│   └── web/          # Frontend React
├── packages/
│   ├── database/     # Prisma schema + seed
│   └── shared/       # Tipos/enums compartidos
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Requisitos

- Node.js >= 18
- pnpm >= 8
- MySQL o MariaDB (local o Docker)

## Instalación

```bash
# 1. Copiar variables de entorno y editar credenciales
cp .env.example .env

# 2. Setup automático (instala deps, crea BD, corre seed)
pnpm setup

# 3. Iniciar desarrollo
pnpm dev
```

O paso a paso:

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env
# Editar DATABASE_URL en .env con tus credenciales MySQL/MariaDB

# Generar Prisma Client + crear tablas + seed
pnpm db:generate
pnpm db:push
pnpm db:seed

# Iniciar desarrollo (API + Web simultáneamente)
pnpm dev
```

## Desarrollo

```bash
# Solo API
pnpm --filter @omstore/api dev

# Solo Web
pnpm --filter @omstore/web dev

# Generar Prisma Client
pnpm db:generate

# Abrir Prisma Studio
pnpm db:studio
```

## Docker

```bash
# Construir y levantar todo
docker compose up -d --build

# Detener
docker compose down
```

## Usuario admin inicial

| Rol | Email | Contraseña |
|-----|-------|-----------|
| ADMIN | admin@omstore.com | admin123 |
| MANAGER | manager@omstore.com | admin123 |
| CASHIER | cajero@omstore.com | admin123 |
| SELLER | vendedor@omstore.com | admin123 |

## Módulos del sistema

1. **Autenticación y usuarios** — Login JWT, roles (ADMIN, MANAGER, CASHIER, SELLER)
2. **Dashboard** — Ventas día/mes, productos top, bajo stock, actividad reciente
3. **Catálogo de productos** — Marcas, categorías, modelos, variantes por talla/color
4. **Inventario** — Stock general, movimientos, ajustes, alertas de bajo stock
5. **Compras / Proveedores** — Registro de compras con entrada automática de stock
6. **Ventas / POS** — Punto de venta rápido, búsqueda de productos, carrito, pagos mixtos
7. **Caja** — Apertura/cierre, ingresos/egresos, cálculo de diferencia
8. **Apartados** — Reserva de stock, abonos, vencimiento, conversión a venta
9. **Clientes** — Registro, historial de compras y apartados
10. **Gastos** — Registro de gastos con categorías
11. **Reportes** — Ventas, inventario, caja, apartados, ganancias, exportación CSV
12. **Auditoría** — Registro de acciones críticas
13. **Catálogo público** — Vista pública de productos disponibles por talla

## Reglas de negocio críticas

- `Stock disponible = stock - reservedStock`
- No se puede vender sin caja abierta
- No se puede vender una variante sin stock disponible
- Al crear apartado: aumenta `reservedStock`, movimiento `LAYAWAY_RESERVE`
- Al cancelar apartado: disminuye `reservedStock`, movimiento `LAYAWAY_CANCEL`
- Al completar apartado: disminuye stock real + reservedStock, crea venta final
- Al vender: disminuye stock, movimiento `SALE`, asociado a caja abierta
- Al cancelar venta: restaura stock, requiere ADMIN/MANAGER
- Al registrar compra: aumenta stock, movimiento `PURCHASE`
- Al cerrar caja: calcula diferencia entre esperado y contado
- Operaciones críticas usan transacciones Prisma

## Comandos principales

```bash
pnpm install          # Instalar dependencias
pnpm setup            # Setup completo (deps + BD + seed)
pnpm dev              # Desarrollo (API + Web)
pnpm build            # Build producción
pnpm db:generate      # Generar Prisma Client
pnpm db:migrate       # Ejecutar migraciones
pnpm db:seed          # Poblar DB con datos demo
pnpm db:studio        # Abrir Prisma Studio
pnpm lint             # TypeScript check
```

## API Endpoints

### Auth
- `POST /api/auth/login` — Iniciar sesión
- `GET /api/auth/me` — Usuario autenticado

### Catálogo público
- `GET /api/catalog` — Catálogo público con filtros (size, brandId, gender, search)
- `GET /api/catalog/export` — Exportar CSV del catálogo

### Productos
- `GET /api/products` — Listar productos
- `POST /api/products` — Crear producto
- `GET /api/products/:id` — Detalle del producto
- `PATCH /api/products/:id` — Actualizar producto
- `DELETE /api/products/:id` — Desactivar producto
- `POST /api/products/:id/variants` — Crear variante
- `PATCH /api/products/variants/:variantId` — Actualizar variante

### Inventario
- `GET /api/inventory` — Listar inventario
- `GET /api/inventory/movements` — Movimientos de stock
- `GET /api/inventory/low-stock` — Productos con bajo stock
- `POST /api/inventory/adjustment` — Ajuste manual de stock

### Compras
- `GET /api/purchases` — Listar compras
- `POST /api/purchases` — Registrar compra
- `GET /api/purchases/:id` — Detalle de compra

### Ventas
- `GET /api/sales` — Listar ventas
- `POST /api/sales` — Crear venta
- `GET /api/sales/:id` — Detalle de venta
- `POST /api/sales/:id/cancel` — Cancelar venta

### Caja
- `GET /api/cash/current` — Caja actual
- `POST /api/cash/open` — Abrir caja
- `POST /api/cash/close` — Cerrar caja
- `POST /api/cash/movement` — Movimiento manual
- `GET /api/cash/history` — Historial de cierres

### Apartados
- `GET /api/layaways` — Listar apartados
- `POST /api/layaways` — Crear apartado
- `GET /api/layaways/:id` — Detalle
- `POST /api/layaways/:id/payment` — Registrar abono
- `POST /api/layaways/:id/complete` — Completar apartado
- `POST /api/layaways/:id/cancel` — Cancelar apartado
- `GET /api/layaways/expired` — Apartados vencidos

### Dashboard
- `GET /api/dashboard/summary` — Resumen de métricas
- `GET /api/dashboard/top-products` — Productos más vendidos
- `GET /api/dashboard/low-stock` — Bajo stock
- `GET /api/dashboard/recent-activity` — Actividad reciente
- `GET /api/dashboard/top-sizes` — Tallas más vendidas
- `GET /api/dashboard/payment-methods` — Métodos de pago

### Reportes
- `GET /api/reports/sales` — Reporte de ventas
- `GET /api/reports/inventory` — Reporte de inventario
- `GET /api/reports/cash` — Reporte de caja
- `GET /api/reports/layaways` — Reporte de apartados
- `GET /api/reports/profit` — Reporte de ganancias
