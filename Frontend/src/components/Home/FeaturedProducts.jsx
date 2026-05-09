import { useTranslation } from 'react-i18next'

/**
 * Sección de productos/ofertas destacadas.
 * Muestra una cuadrícula de platos recomendados de diversos restaurantes.
 */
export default function FeaturedProducts({ products, loading, onSelectProduct, isFavorite, onFavoriteToggle }) {
  const { t } = useTranslation()
  
  const fmt = n => Number(n).toLocaleString('es-CO')

  return (
    <section id="ofertas" className="py-20 bg-slate-50/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-2">
            <i className="fas fa-tag" /> {t('home.specialDiscounts') || "Descuentos especiales"}
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            {t('home.offersTitle') || "Ofertas del Día"}
          </h2>
          <p className="text-gray-500 font-medium">
            {t('home.offersSubtitle') || "Los mejores platos con descuentos exclusivos para ti."}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, idx) => (
              <div 
                key={`${p.id}-${idx}`}
                onClick={() => onSelectProduct(p)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                {/* Imagen del Producto */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={p.image || '/images/placeholder.png'} 
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop' }}
                  />
                  
                  {/* Badge de Descuento */}
                  {p.pct && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg">
                      -{p.pct}%
                    </div>
                  )}

                  {/* Botón Favorito */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onFavoriteToggle(p.restaurantId) }}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/80 backdrop-blur-sm shadow-md
                      ${isFavorite(p.restaurantId) ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <i className={`${isFavorite(p.restaurantId) ? 'fas' : 'far'} fa-heart`} />
                  </button>
                </div>

                {/* Info del Producto */}
                <div className="p-5">
                  <p className="text-red-500 font-bold text-[10px] uppercase tracking-wider mb-1">
                    {p.restaurantName}
                  </p>
                  <h3 className="font-black text-gray-900 text-lg mb-2 truncate" title={p.name}>
                    {p.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="block text-xl font-black text-gray-900">${fmt(p.price)}</span>
                      {p.oldPrice && (
                        <span className="text-gray-400 text-xs line-through">${fmt(p.oldPrice)}</span>
                      )}
                    </div>
                    
                    <button className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg">
                      <i className="fas fa-plus" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <button className="bg-white border-2 border-gray-100 hover:border-red-500 text-gray-900 font-black px-10 py-4 rounded-full transition-all shadow-sm hover:shadow-lg">
            Ver todas las ofertas
          </button>
        </div>
      </div>
    </section>
  )
}
