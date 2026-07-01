import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchJson } from '../api/fetchJson'
import { COUPONS as STATIC_COUPONS } from '../data/coupons'

export default function Coupons() {
  const { t } = useTranslation()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await fetchJson('/api/coupons')
        const list = Array.isArray(response) ? response : response?.data || []
        // Si no hay cupones en base de datos, mostramos los estáticos como iniciales
        setCoupons(list.length > 0 ? list : STATIC_COUPONS)
      } catch (err) {
        console.error('Error cargando cupones:', err)
        setCoupons(STATIC_COUPONS)
      } finally {
        setLoading(false)
      }
    }
    loadCoupons()
  }, [])

  const getCouponDisplayData = (coupon) => {
    // Si el cupón ya es un objeto de diseño completo estático
    if (coupon.accent && coupon.benefit) {
      return coupon;
    }

    // Si coincide con uno de nuestros cupones estáticos predefinidos
    const staticMatch = STATIC_COUPONS.find(c => c.code.toUpperCase() === coupon.code.toUpperCase())
    if (staticMatch) {
      return {
        ...coupon,
        title: t(`coupons.items.${staticMatch.code}.title`, { defaultValue: staticMatch.title }),
        description: t(`coupons.items.${staticMatch.code}.description`, { defaultValue: staticMatch.description }),
        badge: t(`coupons.items.${staticMatch.code}.badge`, { defaultValue: staticMatch.badge }),
        benefit: t(`coupons.items.${staticMatch.code}.benefit`, { defaultValue: staticMatch.benefit }),
        terms: t(`coupons.items.${staticMatch.code}.terms`, { defaultValue: staticMatch.terms }),
        icon: staticMatch.icon,
        accent: staticMatch.accent,
      }
    }

    // Para cupones creados dinámicamente
    const benefitText = coupon.type === 'percentage'
      ? `${Math.round(coupon.value)}% OFF`
      : `$${Number(coupon.value).toLocaleString('es-CO')} OFF`

    const termsText = coupon.minimum_order > 0
      ? `Monto mínimo $${Number(coupon.minimum_order).toLocaleString('es-CO')}.`
      : 'Sin monto mínimo de compra.'

    const expiresText = coupon.expires_at
      ? ` Vence el ${new Date(coupon.expires_at).toLocaleDateString('es-CO')}.`
      : ''

    return {
      code: coupon.code,
      title: coupon.description || `Descuento ${coupon.code}`,
      description: `Código promocional aplicable para tu pedido.`,
      benefit: benefitText,
      terms: termsText + expiresText,
      badge: coupon.restaurant_id ? 'Restaurante' : 'Cupón Especial',
      icon: 'fas fa-tag',
      accent: 'from-[#fff2ee] via-[#fff8f5] to-white', // Default
    }
  }

  return (
    <main className="page-coupons min-h-screen bg-[#fff8f6] dark:bg-slate-950 py-8 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-100 dark:border-slate-800 bg-gradient-to-r from-[#fff3ef] dark:from-slate-900/40 to-[#fffaf8] dark:to-slate-900/10 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-[#FF4B3E] border border-red-100 dark:border-slate-800">
            <i className="fas fa-ticket-alt" /> {t('coupons.available') || 'Cupones disponibles'}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
            {t('coupons.title') || 'Elige tu cupón y aplícalo en el carrito'}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-slate-400 max-w-2xl">
            {t('coupons.subtitle') || 'Copia cualquiera de estos códigos y pégalo en tu checkout para activar el beneficio.'}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#FF4B3E] border-t-transparent mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Cargando cupones...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {coupons.map((c) => {
              const coupon = getCouponDisplayData(c)
              return (
                <article key={coupon.code} className={`rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-gradient-to-br ${coupon.accent} dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 shadow-sm p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-3 py-1 text-[11px] font-bold text-[#FF4B3E] border border-red-100 dark:border-slate-800">
                        <i className={coupon.icon} /> {coupon.badge}
                      </span>
                      <h2 className="mt-3 text-lg font-black text-gray-900 dark:text-white">{coupon.title}</h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{coupon.description}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fff0ed] dark:bg-red-950/20 text-[#FF4B3E] shrink-0">
                      {coupon.benefit}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <code className="font-mono font-black text-gray-800 dark:text-slate-200 tracking-wider">{coupon.code}</code>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{t('coupons.copy_hint') || 'Cópialo en carrito'}</span>
                  </div>

                  <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">{coupon.terms}</p>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/restaurants" className="px-5 py-3 rounded-2xl bg-[#FF4B3E] text-white font-bold hover:bg-[#e03a2d] transition">
            {t('coupons.go_to_restaurants') || 'Ir a restaurantes'}
          </Link>
          <Link to="/user/cart" className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 font-bold hover:border-[#FF4B3E] hover:text-[#FF4B3E] dark:bg-slate-900 transition">
            {t('coupons.go_to_cart') || 'Ir al carrito'}
          </Link>
        </div>
      </section>
    </main>
  )
}