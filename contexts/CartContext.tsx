import React, { createContext, useContext, useEffect, useState } from 'react'

type CartItem = {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
}

type CartContextValue = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clear: () => void
  total: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const LOCAL_KEY = 'limited_stock_cart_v1'

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
    } catch (e) {
      // ignore
    }
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const exist = prev.find((p) => p.id === item.id)
      if (exist) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + qty } : p))
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id))

  const updateQuantity = (id: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)))
  }

  const clear = () => setItems([])

  const total = items.reduce((s, it) => s + it.price * it.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default CartContext
