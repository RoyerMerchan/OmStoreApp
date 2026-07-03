# Plan: E-commerce Storefront — OmStore

## 1. Qué se reutiliza (sin cambios)

| Componente | Uso |
|---|---|
| `Product` / `ProductVariant` (Prisma) | Catálogo público lee de estas tablas. Precio desde `variant.price ?? product.basePrice` |
| `stock` + `reservedStock` en `ProductVariant` | Reserva al crear orden, descuenta al confirmar |
| `GET /api/catalog` | Ya existe público. Se reutiliza para catálogo |
| `GET /api/products/:id` | Detalle de producto + variantes |
| Auth JWT (`authenticate` + `authorize`) | Protege rutas admin de gestión de pedidos |
| `PublicLayout` (React) | Se expande con navegación completa de tienda |
| `ThemeContext` | Dark mode heredado |
| Vite proxy `/api → :3001` | Sin cambios |

## 2. Tablas nuevas a agregar (Prisma)

```prisma
enum DeliveryType { LOCAL, INTERNATIONAL, PICKUP }
enum PaymentMethod { BS, USDT, ZELLE, CASH_ON_DELIVERY }
enum OrderStatus {
  PENDING_PAYMENT
  PAYMENT_DECLARED
  CONFIRMED
  PREPARING
  SHIPPED
  DELIVERED
  CANCELLED
  REJECTED
}

model ExchangeRate {
  id        String   @id @default(cuid())
  rate      Decimal  @db.Decimal(12,2)  // Bs por 1 USD
  createdAt DateTime @default(now())
}

model StoreOrder {
  id                 String       @id @default(cuid())
  orderNumber        String       @unique
  guestName          String
  guestPhone         String
  guestEmail         String
  deliveryLocation   Json         // { country, city, zone, address }
  deliveryType       DeliveryType
  paymentMethod      PaymentMethod
  status             OrderStatus  @default(PENDING_PAYMENT)

  subtotalUsdCents   Int
  shippingUsdCents   Int          @default(0)
  totalUsdCents      Int
  exchangeRateUsed   Decimal      @db.Decimal(12,2)  // tasa congelada al crear

  items              StoreOrderItem[]
  paymentProofs      PaymentProof[]

  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
}

model StoreOrderItem {
  id                String       @id @default(cuid())
  orderId           String
  variantId         String
  quantity          Int
  unitPriceUsdCents Int          // congelado al comprar

  order             StoreOrder   @relation(fields: [orderId], references: [id])
  variant           ProductVariant @relation(fields: [variantId], references: [id])

  @@index([orderId])
}

model PaymentProof {
  id              String        @id @default(cuid())
  orderId         String
  method          PaymentMethod // BS, USDT, ZELLE
  reference       String        // nº ref, hash USDT, confirmación Zelle
  proofFileUrl    String?       // captura subida (opcional)
  declaredAmount  Decimal       @db.Decimal(12,2)
  currency        String        // "Bs", "USDT", "USD"
  verified        Boolean       @default(false)
  verifiedAt      DateTime?
  createdAt       DateTime      @default(now())

  order           StoreOrder    @relation(fields: [orderId], references: [id])

  @@index([orderId])
}

model Notification {
  id         String   @id @default(cuid())
  type       String   // "new_order", "payment_declared", etc.
  title      String
  message    String   @db.Text
  data       Json?    // info adicional serializada
  read       Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

### Seed: ExchangeRate inicial
```ts
await prisma.exchangeRate.create({
  data: { rate: 60 } // 60 Bs/USD por defecto
})
```

## 3. Endpoints nuevos (Backend Express)

### Públicos (sin auth)

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/store/products` | Catálogo con precios USD + Bs (tasa vigente). Filtros: search, category, gender |
| GET | `/api/store/products/:id` | Detalle producto + variantes con stock disponible |
| GET | `/api/store/exchange-rate` | Tasa Bs/USD vigente |
| POST | `/api/store/orders` | Crear orden + reservar stock (transacción). Body: guestName, guestPhone, guestEmail, deliveryLocation, paymentMethod, items[], proof? |
| POST | `/api/store/orders/check-shipping` | Calcula deliveryType + costo según ubicación |

### Protegidos (ADMIN/Dueño de tienda)

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/admin/orders` | Lista pedidos pendientes + todos (filtro por status) |
| GET | `/api/admin/orders/:id` | Detalle de pedido con comprobantes |
| PATCH | `/api/admin/orders/:id/status` | Cambiar estado (confirmed → baja stock, shipped, delivered, rejected) |
| POST | `/api/admin/exchange-rate` | Actualizar tasa Bs/USD |
| GET | `/api/admin/notifications` | Notificaciones sin leer |
| PATCH | `/api/admin/notifications/:id/read` | Marcar como leída |

## 4. Frontend — Storefront (`apps/web/tienda/`)

Nuevos archivos dentro de `apps/web` (no app separada), montados en `PublicLayout`:

### Páginas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/tienda` | `pages/tienda/Catalogo.tsx` | Grid productos, filtros, precios USD + Bs |
| `/tienda/producto/:id` | `pages/tienda/ProductoDetalle.tsx` | Variantes, selector talla/color, agregar carrito |
| `/tienda/carrito` | `pages/tienda/Carrito.tsx` | Items, cantidades, subtotal, checkout |
| `/tienda/checkout` | `pages/tienda/Checkout.tsx` | Formulario datos + ubicación + entrega + pago |
| `/tienda/confirmacion/:id` | `pages/tienda/Confirmacion.tsx` | Factura generada, instrucciones |
| `/tienda/orden/:id` | `pages/tienda/OrdenStatus.tsx` | Estado del pedido (input order ID o link) |

### Componentes

| Componente | Uso |
|---|---|
| `tienda/ProductCard.tsx` | Card de producto en catálogo |
| `tienda/PriceTag.tsx` | Muestra USD + Bs (ej: "$25.00 | Bs 1,500") |
| `tienda/ShippingForm.tsx` | Selector país/ciudad/zona + cálculo envío |
| `tienda/PaymentSelector.tsx` | Botones Bs / USDT / Zelle / Contraentrega |
| `tienda/ProofUpload.tsx` | Input referencia + subida captura |
| `tienda/CartDrawer.tsx` | Carrito flotante (slide-in) |
| `tienda/OrderSummary.tsx` | Resumen de orden para checkout |

### Lógica

| Módulo | Archivo | Función |
|---|---|---|
| Cart store | `stores/cartStore.ts` | Zustand, persist en localStorage. Items, cantidades, totales |
| API helper | `lib/storeApi.ts` | Llamadas a `/api/store/*` |

## 5. Orden de construcción (capas verticales)

### Capa 1: Migraciones + Seed
- Agregar modelos al schema de Prisma
- `npx prisma migrate dev --name add-ecommerce`
- Seed: ExchangeRate inicial 60 Bs/USD
- Verificar que compila (`npx prisma generate`)

### Capa 2: Catálogo público (sin carrito)
- Endpoint `GET /api/store/products` con precios y tasa
- Frontend: Catalogo.tsx + ProductCard + PriceTag
- Frontend: ProductoDetalle.tsx con selector variante
- **Validar**: navegación, filtros, precios en USD + Bs

### Capa 3: Carrito + Checkout
- Cart store (Zustand + localStorage)
- Carrito flotante (slide-in drawer)
- Checkout form: datos personales + ubicación
- Endpoint `POST /api/store/orders/check-shipping`
- ShippingForm: selector país/ciudad/zona
- **Validar**: carrito persiste, envío se calcula

### Capa 4: Pago + Comprobante
- PaymentSelector + ProofUpload
- `POST /api/store/orders` crea orden + reserva stock
- Subida de captura (multer + static serve)
- Confirmacion.tsx: muestra factura generada
- **Validar**: orden creada, stock reservado, comprobante guardado

### Capa 5: Admin panel — gestión de pedidos
- Nueva sección en Sidebar: "Pedidos"
- OrdenesList.tsx: tabla con filtro por status
- OrdenDetalle.tsx: info comprador, items, comprobante
- Botones: Confirmar / Rechazar / Enviar / Entregado
- `PATCH /api/admin/orders/:id/status` con transacción de stock
- Notificaciones en Header (badge + dropdown)
- Formulario tasa de cambio en Settings
- **Validar**: flujo completo admin verifica → stock baja

### Capa 6: Notificaciones + extras
- Notification store (Zustand, polling cada 30s)
- Badge en admin Header con count no leídas
- OrdenStatus.tsx: página pública para que el cliente vea su estado
- **Validar**: admin recibe notif, cliente ve status

## 6. Dependencias nuevas

```json
// apps/api/package.json
"multer": "^1.4.5-lts.1",
"nodemailer": "^6.9.0"
// @types/multer como devDep
```

El frontend no necesita nuevas dependencias (Lucide ya está, Tailwind ya está).

## 7. Seguridad aplicada

- **Total recalculado en servidor**: `items[]` solo lleva `{ variantId, quantity }`. El server calcula subtotal desde `variant.price ?? product.basePrice`
- **Tasa congelada**: al crear orden, se guarda `exchangeRateUsed`. Si la tasa cambia, la factura no se altera
- **Stock en transacción**: `prisma.$transaction()` en creación y confirmación
- **Archivos**: multer validación tipo (image/png, image/jpeg, application/pdf), tamaño max 5MB, guardado en `uploads/proofs/` fuera de rutas públicas
- **Inputs validados con Zod**: todos los endpoints nuevos usan `validate()` middleware
- **Auth admin**: rutas `/api/admin/*` protegidas con `authenticate` + `authorize('ADMIN')`

## 8. Lo que NO se hace

- ❌ No se reconstruye el backend, DB ni admin existentes
- ❌ No se agrega pasarela de pago automática (solo pagos manuales)
- ❌ No se exige registro de cuenta al cliente (guest checkout)
- ❌ No se tocan las tablas POS existentes (Sale, CashSession, etc.)
- ❌ No se modifican endpoints admin existentes
