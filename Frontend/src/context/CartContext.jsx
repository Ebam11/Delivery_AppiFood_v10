// Archivo: src/context/CartContext.jsx | Comentario: logica principal del modulo.
// src/context/CartContext.jsx
import { createContext, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useCartStore } from '../store/cartStore'

const CartContext = createContext(null)

const DELIVERY = 3500
const GUEST_CART_KEY = 'guest_cart_items'
const APPLIED_COUPON_KEY = 'applied_coupon'
const fmt = n => Number(n).toLocaleString('es-CO')

const COUPONS = {
  BIENVENIDO: { type: 'percentage', value: 15, label: '15%' },
  BURGER10:   { type: 'percentage', value: 10, label: '10%' },
  PIZZA5000:  { type: 'fixed',      value: 5000, label: '$5.000' },
}

export function CartProvider({ children }) {
  const [cart, setCart]               = useState([])
  const [isOpen, setIsOpen]           = useState(false)
  const [appliedCoupon, setApplied]   = useState(() => {
    try {
      const raw = localStorage.getItem(APPLIED_COUPON_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [recentlyAddedItemId, setRecentlyAddedItemId] = useState(null)
  const previousCartRef = useRef([])
  const hasHydratedRef = useRef(false)

  const {
    cart: serverCart,
    fetchCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCartItems,
  } = useCartStore()

  const isAuthenticated = Boolean(localStorage.getItem('token'))

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {})
      return
    }

    try {
      const raw = localStorage.getItem(GUEST_CART_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      setCart(Array.isArray(parsed) ? parsed : [])
    } catch {
      setCart([])
    }
  }, [fetchCart, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    const mapped = (serverCart?.items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      img: item.image,
      price: Number(item.unit_price || 0),
      qty: Number(item.quantity || 0),
    }))

    if (hasHydratedRef.current) {
      const previous = previousCartRef.current
      const changed = mapped.find((item) => {
        const before = previous.find((prevItem) => prevItem.id === item.id)
        return !before || item.qty > before.qty
      })

      if (changed) {
        setRecentlyAddedItemId(changed.id)
        setIsOpen(true)
        setTimeout(() => setRecentlyAddedItemId(null), 1400)
      }
    }

    hasHydratedRef.current = true
    previousCartRef.current = mapped
    setCart(mapped)
  }, [serverCart, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) return
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  }, [cart, isAuthenticated])

  const addItem = useCallback((product, qty = 1) => {
    const productId = product?.id ?? product?.product_id
    const restaurantId = product?.restaurant_id ?? product?.restaurantId ?? serverCart?.restaurant_id

    if (!productId) {
      return
    }

    if (!isAuthenticated) {
      const localItemId = `guest-${productId}`
      setCart((prev) => {
        const exists = prev.find((item) => item.id === localItemId)
        if (exists) {
          return prev.map((item) =>
            item.id === localItemId ? { ...item, qty: item.qty + qty } : item
          )
        }

        return [
          ...prev,
          {
            id: localItemId,
            productId,
            name: product?.name || 'Producto',
            img: product?.img || product?.image || null,
            price: Number(product?.price || 0),
            qty,
          },
        ]
      })
      setRecentlyAddedItemId(localItemId)
      setIsOpen(true)
      setTimeout(() => setRecentlyAddedItemId(null), 1400)
      return
    }

    if (!restaurantId) {
      return
    }

    addItemToCart(restaurantId, productId, qty).catch(() => {})
  }, [addItemToCart, isAuthenticated, serverCart?.restaurant_id])

  const removeItem = useCallback(id => {
    if (!isAuthenticated) {
      setCart((prev) => prev.filter((item) => item.id !== id))
      return
    }

    removeItemFromCart(id).catch(() => {})
  }, [isAuthenticated, removeItemFromCart])

  const updateQty = useCallback((id, delta) => {
    const currentItem = cart.find((item) => item.id === id)
    if (!currentItem) return
    const nextQty = currentItem.qty + delta

    if (!isAuthenticated) {
      if (nextQty <= 0) {
        setCart((prev) => prev.filter((item) => item.id !== id))
        return
      }

      setCart((prev) => prev.map((item) =>
        item.id === id ? { ...item, qty: nextQty } : item
      ))
      return
    }

    updateItemQuantity(id, nextQty).catch(() => {})
  }, [cart, isAuthenticated, updateItemQuantity])

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      clearCartItems().catch(() => {})
    } else {
      setCart([])
      localStorage.removeItem(GUEST_CART_KEY)
    }
    setApplied(null)
    localStorage.removeItem(APPLIED_COUPON_KEY)
  }, [clearCartItems, isAuthenticated])

  const applyCoupon = useCallback(code => {
    // Normaliza el código para evitar fallos por mayúsculas/minúsculas.
    const c = COUPONS[code.toUpperCase()]
    if (c) {
      const applied = { code: code.toUpperCase(), ...c }
      setApplied(applied)
      localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(applied))
      return { ok: true, label: c.label }
    }
    return { ok: false }
  }, [])

  const subtotal = useMemo(() => {
    if (isAuthenticated && typeof serverCart?.subtotal !== 'undefined' && serverCart?.subtotal !== null) {
      return Number(serverCart.subtotal)
    }

    return cart.reduce((s, i) => s + i.price * i.qty, 0)
  }, [serverCart?.subtotal, cart, isAuthenticated])
  // Calcula descuento según tipo de cupón aplicado.
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.round(subtotal * appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0
  // El domicilio solo aplica cuando hay al menos un producto en el carrito.
  const currentDeliveryCost = (isAuthenticated && typeof serverCart?.delivery_cost !== 'undefined')
    ? Number(serverCart.delivery_cost)
    : DELIVERY

  const total    = subtotal - discount + (cart.length ? currentDeliveryCost : 0)
  const count    = useMemo(() => {
    if (isAuthenticated && typeof serverCart?.total_items !== 'undefined' && serverCart?.total_items !== null) {
      return Number(serverCart.total_items)
    }

    return cart.reduce((s, i) => s + i.qty, 0)
  }, [serverCart?.total_items, cart, isAuthenticated])

  return (
    <CartContext.Provider value={{
      cart, count, subtotal, discount, total, DELIVERY, appliedCoupon,
      recentlyAddedItemId,
      isOpen, setIsOpen,
      addItem, removeItem, updateQty, clearCart, applyCoupon, fmt,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }
