"use client"

import { useState, useEffect, useCallback } from "react"

export interface CartItem {
  productId: string
  name: string
  slug: string
  image: string
  size: string
  quantity: number
  pricePerUnit: number
}

type Listener = () => void

let cartItems: CartItem[] = []
const listeners: Set<Listener> = new Set()

function persist() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("chittamma-cart", JSON.stringify(cartItems))
  }
}

function emitChange() {
  persist()
  for (const listener of listeners) {
    listener()
  }
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const saved = sessionStorage.getItem("chittamma-cart")
    if (!saved) return []
    const parsed = JSON.parse(saved) as CartItem[]
    // Migrate old cart items that don't have name/slug/image
    const hasOldFormat = parsed.some((item) => !item.name)
    if (hasOldFormat) {
      // Clear old format cart items - user needs to re-add
      sessionStorage.removeItem("chittamma-cart")
      return []
    }
    return parsed
  } catch {
    return []
  }
}

export function addToCart(
  productId: string,
  size: string,
  pricePerUnit: number,
  quantity = 1,
  meta?: { name: string; slug: string; image: string }
) {
  // Ensure loaded
  if (cartItems.length === 0 && typeof window !== "undefined") {
    cartItems = loadCart()
  }
  const existingIndex = cartItems.findIndex(
    (item) => item.productId === productId && item.size === size
  )
  if (existingIndex >= 0) {
    cartItems = cartItems.map((item, idx) =>
      idx === existingIndex
        ? { ...item, quantity: item.quantity + quantity }
        : item
    )
  } else {
    cartItems = [
      ...cartItems,
      {
        productId,
        name: meta?.name || productId,
        slug: meta?.slug || productId,
        image: meta?.image || "/images/placeholder.jpg",
        size,
        quantity,
        pricePerUnit,
      },
    ]
  }
  emitChange()
}

export function updateCartQuantity(productId: string, size: string, quantity: number) {
  if (quantity < 1) {
    removeFromCart(productId, size)
    return
  }
  cartItems = cartItems.map((item) =>
    item.productId === productId && item.size === size
      ? { ...item, quantity }
      : item
  )
  emitChange()
}

export function removeFromCart(productId: string, size: string) {
  cartItems = cartItems.filter(
    (item) => !(item.productId === productId && item.size === size)
  )
  emitChange()
}

export function clearCart() {
  cartItems = []
  emitChange()
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load cart from sessionStorage on mount
    cartItems = loadCart()
    setItems([...cartItems])
    setMounted(true)

    // Listen for changes from other components
    const listener = () => {
      setItems([...cartItems])
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0
  )

  const add = useCallback(
    (
      productId: string,
      size: string,
      pricePerUnit: number,
      quantity = 1,
      meta?: { name: string; slug: string; image: string }
    ) => {
      addToCart(productId, size, pricePerUnit, quantity, meta)
    },
    []
  )

  const update = useCallback((productId: string, size: string, quantity: number) => {
    updateCartQuantity(productId, size, quantity)
  }, [])

  const remove = useCallback((productId: string, size: string) => {
    removeFromCart(productId, size)
  }, [])

  const clear = useCallback(() => {
    clearCart()
  }, [])

  return { items, totalItems, subtotal, add, update, remove, clear, mounted }
}
