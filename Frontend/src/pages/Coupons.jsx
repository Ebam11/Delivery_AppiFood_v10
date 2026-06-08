import { Link } from 'react-router-dom'
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { COUPONS } from '../data/coupons'

export default function Coupons() {
  const { t } = useTranslation()
  return (
    <main className="page-coupons min-h-screen bg-[#fff8f6] py-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-100 bg-gradient-to-r from-[#fff3ef] to-[#fffaf8] p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#FF4B3E] border border-red-100">
            <i className="fas fa-ticket-alt" /> {t('coupons.available') || 'Cupones disponibles'}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black text-gray-900">
            {t('coupons.title') || 'Elige tu cupón y aplícalo en el carrito'}
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            {t('coupons.subtitle') || 'Copia cualquiera de estos códigos y pégalo en tu checkout para activar el beneficio.'}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COUPONS.map((coupon) => (
            <article key={coupon.code} className={`rounded-2xl border border-gray-100 bg-gradient-to-br ${coupon.accent} shadow-sm p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#FF4B3E] border border-red-100">
                    <i className={coupon.icon} /> {t(`coupons.items.${coupon.code}.badge`, { defaultValue: coupon.badge })}
                  </span>
                  <h2 className="mt-3 text-lg font-black text-gray-900">{t(`coupons.items.${coupon.code}.title`, { defaultValue: coupon.title })}</h2>
                  <p className="mt-1 text-sm text-gray-500">{t(`coupons.items.${coupon.code}.description`, { defaultValue: coupon.description })}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fff0ed] text-[#FF4B3E]">
                  {t(`coupons.items.${coupon.code}.benefit`, { defaultValue: coupon.benefit })}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-3 bg-gray-50 flex items-center justify-between">
                <code className="font-black text-gray-800 tracking-wider">{coupon.code}</code>
                <span className="text-xs text-gray-500">{t('coupons.copy_hint') || 'Cópialo en carrito'}</span>
              </div>

              <p className="mt-3 text-xs text-gray-500">{t(`coupons.items.${coupon.code}.terms`, { defaultValue: coupon.terms })}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/restaurants" className="px-5 py-3 rounded-2xl bg-[#FF4B3E] text-white font-bold hover:bg-[#e03a2d] transition">
            {t('coupons.go_to_restaurants') || 'Ir a restaurantes'}
          </Link>
          <Link to="/user/cart" className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition">
            {t('coupons.go_to_cart') || 'Ir al carrito'}
          </Link>
        </div>
      </section>
    </main>
  )
}
