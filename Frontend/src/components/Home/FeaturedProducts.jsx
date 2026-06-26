import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

/**
 * Sección de productos/ofertas destacadas.
 * Muestra una cuadrícula de platos recomendados de diversos restaurantes.
 */
export default function FeaturedProducts({ products, loading, onSelectProduct, isFavorite, onFavoriteToggle }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const fmt = n => Number(n).toLocaleString('es-CO')

  return (
    <section id="ofertas" className="py-20 bg-slate-50/50 dark:bg-slate-900/10 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-2">
            <i className="fas fa-tag" /> {t('home.specialDiscounts') || "Descuentos especiales"}
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            {t('home.offersTitle') || "Ofertas del Día"}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium">
            {t('home.offersSubtitle') || "Los mejores platos con descuentos exclusivos para ti."}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 4, 8].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="w-full h-48 bg-gray-200 dark:bg-slate-700 rounded-2xl mb-4" />
                <div className="w-20 h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                <div className="w-full h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
                <div className="flex justify-between items-center">
                  <div className="w-16 h-8 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map(p => (
              <div key={p.id} className="group bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between">
                
                {/* Botón Favoritos */}
                <button 
                  onClick={() => onFavoriteToggle?.(p.id)}
                  className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm z-10"
                >
                  <i className={`${isFavorite?.(p.id) ? 'fas fa-heart text-red-500 scale-110' : 'far fa-heart'} transition-transform`} />
                </button>

                <div onClick={() => onSelectProduct?.(p)} className="cursor-pointer">
                  <div className="w-full h-48 rounded-2xl overflow-hidden mb-5 bg-slate-100 dark:bg-slate-700">
                    <img 
                      src={p.image || 'https://via.placeholder.com/300x200'} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full mb-3">
                    {p.restaurantName || 'AppiFood'}
                  </span>
                  
                  <h3 className="font-black text-gray-900 dark:text-white group-hover:text-[#FF4B3E] transition-colors leading-tight mb-2 truncate">
                    {p.name}
                  </h3>
                  
                  <p className="text-gray-400 dark:text-slate-400 text-xs line-clamp-2">
                    {p.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="block text-xl font-black text-gray-900 dark:text-white">${fmt(p.price)}</span>
                      {p.oldPrice && (
                        <span className="text-gray-400 dark:text-slate-500 text-xs line-through">${fmt(p.oldPrice)}</span>
                      )}
                    </div>
                    
                    <button className="w-10 h-10 rounded-2xl bg-gray-900 dark:bg-slate-800 text-white flex items-center justify-center hover:bg-red-500 dark:hover:bg-red-500 transition-colors shadow-lg">
                      <i className="fas fa-plus" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <button 
            onClick={() => navigate('/offers')}
            className="bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 hover:border-red-500 text-gray-900 dark:text-slate-200 font-black px-10 py-4 rounded-full transition-all shadow-sm hover:shadow-lg"
          >
            {t('home.viewAllOffers') || "Ver todas las ofertas"}
          </button>
        </div>
      </div>
    </section>
  )
}