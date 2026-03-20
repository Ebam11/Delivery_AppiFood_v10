// Archivo: src/context/useCart.js | Comentario: logica principal del modulo.
import { useContext } from 'react'
import { CartContext } from './CartContext'

export const useCart = () => useContext(CartContext)
