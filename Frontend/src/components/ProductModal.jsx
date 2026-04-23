// Archivo: src/components/ProductModal.jsx | Comentario: logica principal del modulo.
// src/components/ProductModal.jsx
import { useState } from 'react'
import { useCart } from '../context/useCart'
import { useTranslation } from 'react-i18next'

export default function ProductModal({ product, onClose }) {
  const [qty, setQty]   = useState(1)
  const { addItem, fmt } = useCart()
  const { t } = useTranslation()

  if (!product) return null

  const confirm = () => {
    addItem(product, qty)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="relative">
          <img src={product.img} alt={product.name}
            className="w-full h-56 object-cover"
            onError={e => { e.target.src = 'https://via.placeholder.com/400x200/f3f3f3/ccc?text=🍔' }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-[#FF4B3E] hover:bg-red-50 transition font-bold text-lg">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <h3 className="font-bold text-2xl text-gray-800 mb-2">{product.name}</h3>
          <p className="text-[#FF4B3E] font-bold text-2xl mb-5">${fmt(product.price)}</p>

          <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-xl">
            <span className="text-sm font-semibold text-gray-600">{t('productModal.quantity')}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-[#FF4B3E] hover:text-[#FF4B3E] hover:bg-red-50 transition text-lg">
                −
              </button>
              <span className="w-8 text-center font-bold text-lg text-gray-800">{qty}</span>
              <button onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 rounded-full bg-[#FF4B3E] text-white flex items-center justify-center font-bold hover:bg-[#e03a2d] shadow-md hover:shadow-lg transition text-lg">
                +
              </button>
            </div>
          </div>

          <button onClick={confirm}
            className="w-full py-3.5 bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#FF4B3E]/30 transition text-lg">
            <i className="fas fa-shopping-bag mr-2"></i>
            {t('productModal.addButton', { price: fmt(product.price * qty) })}
          </button>
        </div>
      </div>
    </div>
  )
}