import { useRef, useState } from 'react'
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import RestaurantCard from '../RestaurantCard'

/**
 * Sección de restaurantes populares con carrusel horizontal.
 */
export default function PopularRestaurants({ restaurants, loading, onSelect, onFavoriteToggle }) {
  const { t } = useTranslation()
  const trackRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const slide = (direction) => {
    const track = trackRef.current
    if (!track) return
    const cardWidth = 300 // Ancho aproximado de la tarjeta + gap
    const scrollAmount = cardWidth * 2 * direction
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <section id="popular" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Cabecera de Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-2">
              {t('home.featured') || "Destacados"}
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              {t('home.popular_restaurants') || "Restaurantes Populares"}
            </h2>
          </div>
          
          {/* Controles de Navegación */}
          <div className="flex gap-3">
            <button 
              onClick={() => slide(-1)}
              className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <button 
              onClick={() => slide(1)}
              className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>

        {/* Contenedor del Carrusel */}
        <div className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium italic">Cargando la mejor comida...</p>
            </div>
          ) : (
            <div 
              ref={trackRef}
              className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {restaurants.map((r, idx) => (
                <div key={r.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                  <RestaurantCard 
                    restaurant={r}
                    onSelect={onSelect}
                    onFavoriteToggle={onFavoriteToggle}
                  />
                </div>
              ))}
              
              {restaurants.length === 0 && (
                <div className="w-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400">No se encontraron restaurantes cerca de ti.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
