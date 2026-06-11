import { useRef } from 'react'
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { Link } from 'react-router-dom'

/**
 * Sección de cupones destacados con scroll horizontal suave.
 */
export default function CouponCarousel({ coupons }) {
  const { t } = useTranslation()
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section className="py-16 bg-gradient-to-b from-orange-50/50 dark:from-slate-900/50 to-white dark:to-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div className="max-w-2xl">
            <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
              <i className="fas fa-ticket-alt" /> {t('home.saveMore') || "Ahorra más en tus pedidos"}
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              {t('home.featuredCoupons') || "Cupones destacados"}
            </h2>
          </div>
          
          <div className="hidden md:flex gap-3">
            <button onClick={() => scroll(-1)} className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:text-red-500 shadow-sm transition-all flex items-center justify-center">
              <i className="fas fa-chevron-left" />
            </button>
            <button onClick={() => scroll(1)} className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:text-red-500 shadow-sm transition-all flex items-center justify-center">
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {coupons.map((coupon, idx) => (
            <div 
              key={coupon.code} 
              className="min-w-[300px] md:min-w-[380px] bg-white dark:bg-slate-900 rounded-3xl p-6 border border-red-50 dark:border-slate-800/80 relative overflow-hidden shadow-sm hover:shadow-md transition-all snap-start"
            >
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-red-50 dark:bg-red-950/30 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100 dark:border-red-950/40">
                      <i className={coupon.icon} /> {coupon.badge}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mt-3">{coupon.title}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{coupon.description}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-3 rounded-2xl text-center shadow-lg shadow-red-500/20">
                    <span className="block text-[10px] font-black opacity-80 uppercase leading-none">AHORRA</span>
                    <span className="block text-lg font-black mt-1 leading-none">{coupon.benefit}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-dashed border-gray-100 dark:border-slate-800">
                  <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-xl">
                    <code className="font-mono font-black text-gray-800 dark:text-slate-200 tracking-widest text-sm">{coupon.code}</code>
                  </div>
                  <Link 
                    to="/coupons" 
                    className="bg-gray-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2"
                  >
                    {t('home.viewDetail') || "Ver detalle"}
                    <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
