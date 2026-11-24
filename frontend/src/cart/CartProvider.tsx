import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const CART_STORAGE_KEY = 'eneba.cart.items'

export interface CartItem {
  offerId: number
  productSlug: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  totalQuantity: number
  isAddToCartModalOpen: boolean
  addOffer: (productSlug: string, offerId: number) => void
  closeAddToCartModal: () => void
  setQuantity: (offerId: number, quantity: number) => void
  removeOffer: (offerId: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function readCart(): CartItem[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []

    const validItems = stored.filter((item): item is CartItem => {
      if (typeof item !== 'object' || item === null) return false
      if (!('offerId' in item) || !Number.isSafeInteger(item.offerId) || Number(item.offerId) < 1) return false
      if (!('productSlug' in item) || typeof item.productSlug !== 'string') return false
      if (!item.productSlug.trim() || item.productSlug.length > 255) return false
      if (!('quantity' in item) || !Number.isSafeInteger(item.quantity) || Number(item.quantity) < 1) return false
      return true
    })

    const uniqueItems = new Map<number, CartItem>()
    for (const item of validItems) {
      const existing = uniqueItems.get(item.offerId)
      if (!existing) {
        uniqueItems.set(item.offerId, { ...item, productSlug: item.productSlug.trim() })
      } else if (existing.productSlug === item.productSlug.trim()) {
        const combinedQuantity = existing.quantity + item.quantity
        if (Number.isSafeInteger(combinedQuantity)) {
          uniqueItems.set(item.offerId, { ...existing, quantity: combinedQuantity })
        }
      }
    }

    return [...uniqueItems.values()]
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart)
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Keep the in-memory cart usable if browser storage is unavailable.
    }
  }, [items])

  function addOffer(productSlug: string, offerId: number) {
    if (!productSlug.trim() || !Number.isSafeInteger(offerId) || offerId < 1) return
    const existing = items.find((item) => item.offerId === offerId)
    if (existing && existing.quantity >= Number.MAX_SAFE_INTEGER) return

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.offerId === offerId)
      if (existing) {
        return currentItems.map((item) => item.offerId === offerId
          ? { ...item, quantity: Math.min(Number.MAX_SAFE_INTEGER, item.quantity + 1) }
          : item)
      }

      return [...currentItems, { offerId, productSlug: productSlug.trim(), quantity: 1 }]
    })
    setIsAddToCartModalOpen(true)
  }

  function closeAddToCartModal() {
    setIsAddToCartModalOpen(false)
  }

  function setQuantity(offerId: number, quantity: number) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return
    setItems((currentItems) => currentItems.map((item) => item.offerId === offerId ? { ...item, quantity } : item))
  }

  function removeOffer(offerId: number) {
    setItems((currentItems) => currentItems.filter((item) => item.offerId !== offerId))
  }

  function clearCart() {
    setItems([])
  }

  const value: CartContextValue = {
    items,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    isAddToCartModalOpen,
    addOffer,
    closeAddToCartModal,
    setQuantity,
    removeOffer,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// The hook shares the provider module so cart state has a single context owner.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used within a CartProvider.')
  return value
}
