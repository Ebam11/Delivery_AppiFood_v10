// Archivo: src/context/CartContext.jsx | Comentario: logica principal del modulo.
// src/context/CartContext.jsx
import { createContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

const DELIVERY = 3500
const fmt = n => Number(n).toLocaleString('es-CO')

const COUPONS = {
  BIENVENIDO: { type: 'percentage', value: 15, label: '15%' },
  BURGER10:   { type: 'percentage', value: 10, label: '10%' },
  PIZZA5000:  { type: 'fixed',      value: 5000, label: '$5.000' },
}

export function CartProvider({ children }) {
  const [cart, setCart]               = useState([])
  const [isOpen, setIsOpen]           = useState(false)
  const [appliedCoupon, setApplied]   = useState(null)

  const addItem = useCallback((product, qty = 1) => {
    setCart(prev => {
      // Si el producto ya existe, acumula cantidad en lugar de duplicar fila.
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty }]
    })
  }, [])

  const removeItem = useCallback(id => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      // Elimina automáticamente items con cantidad 0 o negativa.
      .filter(i => i.qty > 0)
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setApplied(null)
  }, [])

  const applyCoupon = useCallback(code => {
    // Normaliza el código para evitar fallos por mayúsculas/minúsculas.
    const c = COUPONS[code.toUpperCase()]
    if (c) { setApplied({ code: code.toUpperCase(), ...c }); return { ok: true, label: c.label } }
    return { ok: false }
  }, [])

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  // Calcula descuento según tipo de cupón aplicado.
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.round(subtotal * appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0
  // El domicilio solo aplica cuando hay al menos un producto en el carrito.
  const total    = subtotal - discount + (cart.length ? DELIVERY : 0)
  const count    = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{
      cart, count, subtotal, discount, total, DELIVERY, appliedCoupon,
      isOpen, setIsOpen,
      addItem, removeItem, updateQty, clearCart, applyCoupon, fmt,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }
