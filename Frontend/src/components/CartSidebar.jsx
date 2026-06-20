// Archivo: src/components/CartSidebar.jsx | Comentario: logica principal del modulo.
// src/components/CartSidebar.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useTranslate as useTranslation } from '../hooks/useTranslate';

export default function CartSidebar({ isAuth }) {
  const navigate = useNavigate()
  const { cart, count, subtotal, discount, total, DELIVERY, appliedCoupon,
          isOpen, setIsOpen, removeItem, updateQty, clearCart, applyCoupon, fmt } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [couponMsg, setCouponMsg]     = useState(null)
  const { t } = useTranslation()

  const handleCoupon = () => {
    const r = applyCoupon(couponInput)
    setCouponMsg(
      r.ok
        ? `✅ ${t('cart.couponApplied', { label: r.label })}`
        : `❌ ${t('cart.couponInvalid')}`
    )
    setTimeout(() => setCouponMsg(null), 3000)
  }

  const handleCheckout = () => {
    if (!cart.length) return
    if (!isAuth) { navigate('/login'); return }
    setIsOpen(false)
    navigate('/user/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/40 z-[49] transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} />

      {/* Panel */}
      <aside className={`component-cart-sidebar fixed top-16 right-0 h-[calc(100vh-64px)] w-full max-w-[400px] bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 z-[49] flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-800">
            🛒 {t('cart.title')} {count > 0 && <span className="text-sm font-normal text-gray-500">({count} {t('cart.items')})</span>}
          </h2>
          <button onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-[#FF4B3E] transition">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <span className="text-6xl">🛒</span>
              <p className="font-medium text-gray-500">{t('cart.empty')}</p>
              <p className="text-sm text-center">{t('cart.emptyHint')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <img src={item.img} alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={e => { e.target.src = 'https://via.placeholder.com/60/f3f3f3/ccc?text=🍔' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                    <p className="text-[#FF4B3E] font-bold text-sm">${fmt(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition font-bold">
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 rounded-full bg-[#FF4B3E] text-white flex items-center justify-center hover:bg-[#e03a2d] transition font-bold">
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition ml-1">
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            {/* Cupón */}
            <div className="flex gap-2">
              <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                placeholder={t('cart.couponPlaceholder')}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition" />
              <button onClick={handleCoupon}
                className="px-5 py-2 bg-[#FF4B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#e03a2d] transition shadow-sm">
                {t('cart.couponApplyBtn')}
              </button>
            </div>
            {couponMsg && <p className="text-xs text-center font-semibold p-2 bg-gray-50 rounded-lg">{couponMsg}</p>}

            {/* Totales */}
            <div className="space-y-2.5 text-sm bg-gray-50 -mx-5 px-5 py-4 rounded-xl">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">{t('cart.subtotal')}</span>
                <span className="font-semibold">${fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>✨ {t('cart.discount')} {appliedCoupon?.code}</span>
                  <span>-${fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">{t('cart.delivery')}</span>
                <span className="font-semibold">${fmt(DELIVERY)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-3 border-t-2 border-gray-200">
                <span className="text-gray-800">{t('cart.total')}</span>
                <span className="text-[#FF4B3E] text-lg">${fmt(total)}</span>
              </div>
            </div>

            <button onClick={handleCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#FF4B3E]/30 transition text-base">
              <i className="fas fa-shopping-bag mr-2"></i>
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}