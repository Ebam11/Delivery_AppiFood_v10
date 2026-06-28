import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import RestaurantCard from '../RestaurantCard'

/**
 * Sección de restaurantes populares con carrusel horizontal y flechas a los costados.
 */
export default function PopularRestaurants({ restaurants, loading, onSelect, onFavoriteToggle }) {
  const { t } = useTranslation()
  const trackRef = useRef(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const updateScrollState = () => {
    if (!trackRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current
    setCanScrollPrev(scrollLeft > 5)
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 5)
  }

  useEffect(() => {
    const el = trackRef.current
    if (el) {
      el.addEventListener('scroll', updateScrollState)
      updateScrollState()
      window.addEventListener('resize', updateScrollState)
    }
    return () => {
      if (el) el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [restaurants])

  const slide = (direction) => {
    const track = trackRef.current
    if (!track) return
    const cardWidth = 320
    const scrollAmount = cardWidth * 2 * direction
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <section id="popular" className="py-20 bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6">
        {/* Cabecera de Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-2">
              {t('home.featured') || "Destacados"}
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              {t('home.popular_restaurants') || "Restaurantes Populares"}
            </h2>
          </div>
        </div>

        {/* Contenedor del Carrusel con flechas laterales */}
        <div className="relative w-full">
          {/* Flecha izquierda */}
          {canScrollPrev && !loading && (
            <button 
              onClick={() => slide(-1)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:text-[#FF4B3E] hover:border-[#FF4B3E]/30 shadow-lg transition-all flex items-center justify-center"
            >
              <i className="fas fa-chevron-left text-xs" />
            </button>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-slate-400 font-medium italic">{t('restaurants.loading') || "Cargando la mejor comida..."}</p>
            </div>
          ) : (
            <div 
              ref={trackRef}
              className="flex gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {restaurants.map((r) => (
                <div key={r.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                  <RestaurantCard 
                     restaurant={r}
                     onSelect={onSelect}
                     onFavoriteToggle={onFavoriteToggle}
                  />
                </div>
              ))}
              
              {restaurants.length === 0 && (
                <div className="w-full text-center py-20 bg-gray-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                  <p className="text-gray-400 dark:text-slate-500">{t('restaurants.no_results') || "No se encontraron restaurantes cerca de ti."}</p>
                </div>
              )}
            </div>
          )}

          {/* Flecha derecha */}
          {canScrollNext && !loading && (
            <button 
              onClick={() => slide(1)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:text-[#FF4B3E] hover:border-[#FF4B3E]/30 shadow-lg transition-all flex items-center justify-center"
            >
              <i className="fas fa-chevron-right text-xs" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}