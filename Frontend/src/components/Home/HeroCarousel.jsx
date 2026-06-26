import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

/**
 * Carrusel Hero de la página de inicio.
 * Muestra promociones destacadas con animaciones fluidas.
 */
export default function HeroCarousel({ slides, currentIndex, onIndexChange, stats }) {
  const { t } = useTranslation()
  const activeSlide = slides[currentIndex]
  
  const fmt = n => Number(n).toLocaleString('es-CO')

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center justify-center">
      {/* Fondo con transición suave */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 z-0"
        style={{ backgroundImage: `url('${activeSlide.image}')` }}
      />
      
      {/* Overlay gradiente para legibilidad */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Contenido Central */}
      <div className="relative z-20 container mx-auto px-6 text-center max-w-4xl">
        <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-4 animate-bounce">
          {activeSlide.subtitle}
        </p>
        
        <h1 className="text-white text-4xl md:text-6xl font-black leading-tight mb-6 whitespace-pre-line">
          {activeSlide.title}
        </h1>
        
        {/* Badge de Oferta */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-lg shadow-xl shadow-red-500/30">
            -{activeSlide.discount}%
          </div>
          <p className="text-gray-300 text-lg">
            {t('home.hero.limited_offer', { defaultValue: 'Oferta limitada — solo' })} <span className="text-white font-bold text-xl">${fmt(activeSlide.price)}</span>
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Link to="/restaurants" className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2">
            <i className="fas fa-utensils" /> {t('home.order_now') || "Ordenar ahora"}
          </Link>
          <Link to="/restaurants" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2">
            <i className="fas fa-store" /> {t('home.view_restaurants') || "Ver restaurantes"}
          </Link>
        </div>

        {/* Indicadores de Carrusel */}
        <div className="flex gap-2 justify-center mb-12">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-10 bg-red-500 shadow-lg shadow-red-500/50' : 'w-2.5 bg-white/30'}`}
            />
          ))}
        </div>

        {/* Estadísticas Rápidas */}
        <div className="flex justify-center gap-10 md:gap-20 border-t border-white/10 pt-10">
          {[
            { value: stats.restaurants, label: t('home.hero.stats_restaurants', { defaultValue: 'Restaurantes' }) },
            { value: stats.avg_delivery, label: t('home.hero.stats_delivery', { defaultValue: 'Entrega prom.' }) },
            { value: stats.avg_rating, label: t('home.hero.stats_rating', { defaultValue: 'Calificación' }) },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <span className="block text-white text-2xl font-black">{s.value}</span>
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}