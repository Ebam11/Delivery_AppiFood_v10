// Archivo: src/components/RestaurantCard.jsx | Comentario: logica principal del modulo.
import { useState } from 'react'
import { useRestaurantImage } from '../hooks/useImages'
import { useLazyLoad } from '../hooks/useLazyLoad'
import { blurhash } from '../utils/blurhash'
import { useFavoritesStore } from '../store/favoritesStore'

/**
 * Tarjeta de restaurante con imagen dinámica de Unsplash + lazy loading + favoritos
 */
export default function RestaurantCard({ restaurant, onSelect, onFavoriteToggle }) {
  const { image, loading } = useRestaurantImage(restaurant?.name, restaurant?.img)
  const { ref, src, isLoaded } = useLazyLoad(image, blurhash.restaurant())
  const { isFavorite } = useFavoritesStore()
  const [isAnimating, setIsAnimating] = useState(false)

  if (!restaurant || !restaurant.id) return null
  
  const isFav = isFavorite(restaurant.id)

  const productPreview = Array.isArray(restaurant.categories) && restaurant.categories.length > 0
    ? restaurant.categories.slice(0, 2)
    : Array.isArray(restaurant.menu_categories) && restaurant.menu_categories.length > 0
      ? restaurant.menu_categories.slice(0, 2)
      : []

  const fmt = n => Number(n).toLocaleString('es-CO', { maximumFractionDigits: 0 })
  const ratingLabel = Number(restaurant.rating || 0).toFixed(1)
  const deliveryLabel = restaurant.delivery > 0 ? `$${fmt(restaurant.delivery)}` : 'Gratis'
  const isOpen = restaurant.is_open === true || restaurant.is_open === 1 || restaurant.status === 'open'
  const statusLabel = isOpen ? 'Abierto ahora' : 'Consulta horario'
  
  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    setIsAnimating(true)
    await onFavoriteToggle?.(restaurant.id, !isFav)
    setTimeout(() => setIsAnimating(false), 600)
  }

  return (
    <article
      onClick={() => onSelect && onSelect(restaurant)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
    >
      <div className="relative h-48 overflow-hidden bg-[#f6f6f6]">
        {(loading || !isLoaded) && (
          <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300" />
        )}
        <img
          ref={ref}
          src={src}
          alt={restaurant.name}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isLoaded ? 'opacity-50' : 'opacity-100'}`}
          onError={e => { e.target.src = 'https://via.placeholder.com/320x200?text=🏪' }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />

        {restaurant.promo && (
          <span className="absolute left-3 top-3 rounded-full bg-[#FF4B3E] px-2 py-0.5 text-[9px] font-black text-white shadow-md">
            {restaurant.promo}
          </span>
        )}

        <button
          onClick={handleFavoriteClick}
          className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-all ${
            isFav
              ? 'text-[#FF4B3E]'
              : 'text-gray-300 hover:text-[#FF4B3E]'
          } ${isAnimating ? 'scale-125' : 'scale-100'}`}
          aria-label={isFav ? 'Remover de favoritos' : 'Agregar a favoritos'}
        >
          <i className={`fas fa-heart text-xs ${isFav ? 'text-[#FF4B3E]' : ''}`} />
        </button>
      </div>

      <div className="p-2.5">
        <h3 className="line-clamp-1 text-sm font-bold text-[#111] mb-1">{restaurant.name}</h3>

        <p className="mb-2 text-[11px] text-[#888]">Seleccionado por clientes</p>

        <div className="grid grid-cols-3 gap-0.5 text-[9px] font-semibold text-[#545454]">
          <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#ffe8c9] bg-[#fff4e8] px-1 py-1">
            <i className="fas fa-star text-[#f59e0b]" />{ratingLabel}
          </span>
          <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#dee7ff] bg-[#f4f7ff] px-1 py-1">
            <i className="fas fa-clock" />{restaurant.time}
          </span>
          <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#d9f5e3] bg-[#f5fff8] px-1 py-1">
            <i className="fas fa-motorcycle" />{deliveryLabel}
          </span>
        </div>
      </div>
    </article>
  )
}
