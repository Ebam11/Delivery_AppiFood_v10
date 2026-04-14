// Archivo: src/components/ProductCard.jsx | Comentario: logica principal del modulo.
import { useProductImage } from '../hooks/useImages'
import { useLazyLoad } from '../hooks/useLazyLoad'
import { blurhash } from '../utils/blurhash'

/**
 * Tarjeta de producto con imagen dinámica de Unsplash + lazy loading
 */
export default function ProductCard({ product, onFav, isFav, onSelect }) {
  const { image, loading } = useProductImage(product.name, product.img)
  const { ref, src, isLoaded } = useLazyLoad(image, blurhash.product())
  
  const fmt = n => Number(n).toLocaleString('es-CO')

  return (
    <div 
      onClick={() => onSelect(product)}
      className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all overflow-hidden relative cursor-pointer group border border-gray-100"
    >
      {/* Botón Favorito */}
      <button 
        onClick={e => { e.stopPropagation(); onFav(product.id, e) }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-300 hover:text-[#FF4B3E] transition"
      >
        <i className={`fas fa-heart ${isFav ? 'text-[#FF4B3E]' : ''}`} />
      </button>

      {/* Badge de Descuento */}
      {product.pct && (
        <span className="absolute top-3 left-3 bg-[#FF4B3E] text-white text-xs font-bold px-3 py-1 rounded-full">
          -{product.pct}%
        </span>
      )}

      {/* Imagen */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {(loading || !isLoaded) && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        <img 
          ref={ref}
          src={src} 
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
          onError={e => { e.target.src = 'https://via.placeholder.com/220x160?text=🍔' }}
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Precios */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-[#FF4B3E] text-base">
            ${fmt(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-gray-500 line-through">
              ${fmt(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Botón */}
        <button
          onClick={(event) => {
            event.stopPropagation()
            onSelect(product)
          }}
          className="w-full py-2.5 bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] hover:shadow-lg hover:shadow-[#FF4B3E]/25 text-white rounded-xl font-bold text-xs transition"
        >
          <i className="fas fa-shopping-bag mr-2" />
          Agregar y ver detalle
        </button>
      </div>
    </div>
  )
}
