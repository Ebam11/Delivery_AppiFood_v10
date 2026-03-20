// Archivo: src/components/RestaurantCard.jsx | Comentario: logica principal del modulo.
import { useRestaurantImage } from '../hooks/useImages'
import { useLazyLoad } from '../hooks/useLazyLoad'
import { blurhash } from '../utils/blurhash'

/**
 * Tarjeta de restaurante con imagen dinámica de Unsplash + lazy loading
 */
export default function RestaurantCard({ restaurant, onSelect }) {
  const { image, loading } = useRestaurantImage(restaurant.name, restaurant.img)
  const { ref, src, isLoaded } = useLazyLoad(image, blurhash.restaurant())
  
  const fmt = n => Number(n).toLocaleString('es-CO', { maximumFractionDigits: 0 })

  return (
    <div 
      onClick={() => onSelect && onSelect(restaurant)}
      className="relative rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
    >
      {/* Imagen con efecto de carga */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {(loading || !isLoaded) && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse z-10" />
        )}
        <img 
          ref={ref}
          src={src}
          alt={restaurant.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${!isLoaded ? 'opacity-50' : 'opacity-100'}`}
          onError={e => { e.target.src = 'https://via.placeholder.com/320x200?text=🏪' }}
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Info superpuesta */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
        
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            <i className="fas fa-star text-yellow-400" />
            {restaurant.rating}
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-clock" />
            {restaurant.time}
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-motorcycle" />
            ${fmt(restaurant.delivery)}
          </span>
        </div>
      </div>

      {/* Badge de promoción */}
      {restaurant.promo && (
        <div className="absolute top-3 left-3 bg-[#FF4B3E] text-white text-xs font-bold px-3 py-1 rounded-full">
          {restaurant.promo}
        </div>
      )}
    </div>
  )
}
