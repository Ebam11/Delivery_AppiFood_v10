// Archivo: src/components/RestaurantCard.jsx | Comentario: logica principal del modulo.
import { useState } from 'react'
import { useRestaurantImage } from '../hooks/useImages'
import { useLazyLoad } from '../hooks/useLazyLoad'
import { blurhash } from '../utils/blurhash'
import { useFavoritesStore } from '../store/favoritesStore'
import ScheduleDisplay, { isRestaurantOpenNow } from './ScheduleDisplay'
import heroImage from '../assets/hero.png'
import { useTranslate as useTranslation } from '../hooks/useTranslate';

/**
 * Tarjeta de restaurante con imagen dinámica de Unsplash + lazy loading + favoritos
 */
export default function RestaurantCard({ restaurant, onSelect, onFavoriteToggle, showSchedule = true }) {
  const { t } = useTranslation()
  const { image, loading } = useRestaurantImage(restaurant?.name, restaurant?.img)
  const { ref, src, isLoaded } = useLazyLoad(image, blurhash.restaurant())
  const { isFavorite } = useFavoritesStore()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  if (!restaurant || !restaurant.id) return null
  
  const isFav = isFavorite(restaurant.id)

  const productPreview = Array.isArray(restaurant.categories) && restaurant.categories.length > 0
    ? restaurant.categories.slice(0, 2)
    : Array.isArray(restaurant.menu_categories) && restaurant.menu_categories.length > 0
      ? restaurant.menu_categories.slice(0, 2)
      : []

  const categoryBadges = productPreview
    .map((category) => (typeof category === 'string' ? category : category?.name))
    .filter(Boolean)

  const fmt = n => Number(n).toLocaleString('es-CO', { maximumFractionDigits: 0 })
  const ratingLabel = Number(restaurant.rating || 0).toFixed(1)
  const deliveryLabel = restaurant.delivery > 0 ? `$${fmt(restaurant.delivery)}` : (t('restaurantCard.free') || 'Gratis')
  
  // Calcular si está abierto basado en schedule o is_open flag
  const sched = restaurant.schedule || restaurant.schedules || []
  const hasSchedule = Array.isArray(sched) && sched.length > 0
  const backendOpenFlag = (() => {
    if (typeof restaurant?.isOpen === 'boolean') return restaurant.isOpen
    if (restaurant?.isOpen === 1) return true
    if (restaurant?.isOpen === 0) return false
    if (typeof restaurant?.is_open === 'boolean') return restaurant.is_open
    if (restaurant?.is_open === 1) return true
    if (restaurant?.is_open === 0) return false
    if (restaurant?.status === 'open') return true
    if (restaurant?.status === 'closed') return false
    return undefined
  })()

  const isOpen = backendOpenFlag ?? (hasSchedule 
    ? isRestaurantOpenNow(sched)
    : (restaurant.is_active !== false))
  
  const statusLabel = isOpen ? (t('restaurantCard.open_now') || 'Abierto ahora') : (t('restaurantCard.check_schedule') || 'Consulta horario')
  
  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    setIsAnimating(true)
    await onFavoriteToggle?.(restaurant.id, !isFav)
    setTimeout(() => setIsAnimating(false), 600)
  }

  return (
    <article
      onClick={() => onSelect && onSelect(restaurant)}
      className="component-restaurant-card group relative cursor-pointer overflow-hidden rounded-2xl border border-[#ececec] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
    >
      <div className="relative h-48 overflow-hidden bg-[#f6f6f6] dark:bg-slate-800">
        {(loading || !isLoaded) && (
          <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-gray-300 dark:from-slate-700 via-gray-200 dark:via-slate-600 to-gray-300 dark:to-slate-700" />
        )}
        <img
          ref={ref}
          src={src}
          alt={restaurant.name}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isLoaded ? 'opacity-50' : 'opacity-100'}`}
          onError={e => { e.target.src = heroImage }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-1 z-10">
          {restaurant.promo && (
            <span className="rounded-full bg-[#FF4B3E] px-2 py-0.5 text-[9px] font-black text-white shadow-md w-fit">
              {restaurant.promo}
            </span>
          )}
          {(restaurant.is_new || restaurant.isNew) && (
            <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[9px] font-black text-black shadow-md flex items-center gap-1 w-fit">
              <i className="fas fa-star text-[8px]" /> {t('restaurantCard.new', { defaultValue: 'NUEVO' })}
            </span>
          )}
        </div>

        {/* Badge de estado abierto/cerrado */}
        {showSchedule && (
        <div className="absolute right-3 top-3 z-10">
          <ScheduleDisplay 
            schedule={sched}
            isOpen={isOpen}
            variant="badge"
            language="es"
          />
        </div>
        )}

        <button
          onClick={handleFavoriteClick}
          className={`absolute right-3 bottom-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md transition-all ${
            isFav
              ? 'text-[#FF4B3E]'
              : 'text-gray-300 hover:text-[#FF4B3E]'
          } ${isAnimating ? 'scale-125' : 'scale-100'}`}
          aria-label={isFav ? (t('restaurantCard.remove_fav') || 'Remover de favoritos') : (t('restaurantCard.add_fav') || 'Agregar a favoritos')}
        >
          <i className={`fas fa-heart text-xs ${isFav ? 'text-[#FF4B3E]' : ''}`} />
        </button>
      </div>

      <div className={showSchedule ? 'p-2.5' : 'p-4'}>
        <h3 className="line-clamp-1 text-sm font-bold text-[#111] dark:text-slate-200 mb-1">{restaurant.name}</h3>

        <p className="mb-2 text-[11px] text-[#888] dark:text-slate-400">{t('restaurantCard.selected_by') || 'Seleccionado por clientes'}</p>

        {categoryBadges.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {categoryBadges.map((category) => (
              <span
                key={category}
                className="inline-flex items-center rounded-full border border-[#f2e3d2] dark:border-amber-900/30 bg-[#fff8f1] dark:bg-[#fff8f1]/5 px-2 py-0.5 text-[10px] font-semibold text-[#7a4c22] dark:text-amber-400"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-0.5 text-[9px] font-semibold text-[#545454] dark:text-slate-400">
          <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#ffe8c9] dark:border-amber-950/30 bg-[#fff4e8] dark:bg-amber-950/20 px-1 py-1">
            <i className="fas fa-star text-[#f59e0b]" />{ratingLabel}
          </span>
          <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#dee7ff] dark:border-blue-950/30 bg-[#f4f7ff] dark:bg-blue-950/20 px-1 py-1">
            <i className="fas fa-clock" />{restaurant.time}
          </span>
          <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#d9f5e3] dark:border-green-950/30 bg-[#f5fff8] dark:bg-green-950/20 px-1 py-1">
            <i className="fas fa-motorcycle" />{deliveryLabel}
          </span>
        </div>

        {/* Horario actual o modal */}
        {showSchedule && hasSchedule && (
          <div className="mt-2.5 text-[10px]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsScheduleOpen(!isScheduleOpen)
              }}
              className="text-[#FF4B3E] hover:underline font-medium"
            >
              {isOpen ? (t('restaurantCard.view_full_schedule') || 'Ver horario completo') : (t('restaurantCard.view_schedule') || 'Ver horario')}
            </button>
            
            {isScheduleOpen && (
              <div className="absolute inset-x-0 top-full mt-1 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-3 w-72">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsScheduleOpen(false)
                  }}
                  className="absolute top-2 right-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-250"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
                <ScheduleDisplay
                  schedule={sched}
                  isOpen={isOpen}
                  variant="card"
                  language="es"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
