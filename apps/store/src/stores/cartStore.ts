import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  productId: string
  productName: string
  size: string
  color: string
  imageUrl: string | null
  priceUsdCents: number
  quantity: number
  stock: number
}

interface CartStore {
  items: CartItem[]
  isDrawerOpen: boolean
  addItem: (item: CartItem) => void
  updateQuantity: (variantId: string, qty: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
  totalUsdCents: () => number
  itemCount: () => number
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) => {
        const items = get().items
        const existing = items.find((i) => i.variantId === item.variantId)
        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          })
        } else {
          set({ items: [...items, item] })
        }
      },

      updateQuantity: (variantId, qty) => {
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i
          ),
        })
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) })
      },

      clearCart: () => set({ items: [] }),

      totalUsdCents: () => {
        return get().items.reduce((sum, i) => sum + i.priceUsdCents * i.quantity, 0)
      },

      itemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
    }),
    { name: 'omstore-cart' }
  )
)
