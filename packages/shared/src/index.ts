export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  SELLER = 'SELLER',
  CLIENT = 'CLIENT',
}

export enum Gender {
  MEN = 'MEN',
  WOMEN = 'WOMEN',
  BOY = 'BOY',
  GIRL = 'GIRL',
  UNISEX = 'UNISEX',
}

export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  SALE_CANCEL = 'SALE_CANCEL',
  LAYAWAY_RESERVE = 'LAYAWAY_RESERVE',
  LAYAWAY_CANCEL = 'LAYAWAY_CANCEL',
  LAYAWAY_COMPLETE = 'LAYAWAY_COMPLETE',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  RETURN = 'RETURN',
  ECOMMERCE_RESERVE = 'ECOMMERCE_RESERVE',
  ECOMMERCE_CONFIRM = 'ECOMMERCE_CONFIRM',
  ECOMMERCE_CANCEL = 'ECOMMERCE_CANCEL',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  MIXED = 'MIXED',
}

export enum SaleStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum CashSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum LayawayStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CANCEL = 'CANCEL',
  OPEN_CASH = 'OPEN_CASH',
  CLOSE_CASH = 'CLOSE_CASH',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  LOGIN = 'LOGIN',
}

export enum CashMovementType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum StoreDeliveryType {
  LOCAL = 'LOCAL',
  INTERNATIONAL = 'INTERNATIONAL',
  PICKUP = 'PICKUP',
}

export enum StorePaymentMethod {
  BS = 'BS',
  USDT = 'USDT',
  ZELLE = 'ZELLE',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum StoreOrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_DECLARED = 'PAYMENT_DECLARED',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export interface StoreShippingResult {
  deliveryType: StoreDeliveryType
  shippingUsdCents: number
  available: boolean
  message: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: unknown
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}

export interface JwtPayload {
  userId: string
  role: UserRole
  name: string
  email: string
}
