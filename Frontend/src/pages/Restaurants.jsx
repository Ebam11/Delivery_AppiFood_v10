// Archivo: src/pages/Restaurants.jsx | Comentario: logica principal del modulo.
import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { fetchJson } from '../api/fetchJson'
import FoodCategoryCarousel from '../components/FoodCategoryCarousel'
import Footer from '../components/Footer'
import { MOCK_RESTAURANTS } from '../data/mockRestaurants'

const DEFAULT_LOCATION = {
  lat: 2.4448,
  lng: -76.6147,
  label: 'Popayán, Cauca',
}

const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900'

const DEFAULT_FOOD_TYPES = [
  'Comida Casera',
  'Sopas y Caldos',
  'Antojitos Payaneses',
  'Empanadas y Fritos',
  'Tamales',
  'Hamburguesas',
  'Pizza',
  'Japonesa',
  'Italiana',
  'Mexicana',
  'Saludable',
  'Panadería y Postres',
  'Bebidas Tradicionales',
]

const normalizeCategory = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()

const parseStoredLocation = (storedAddress) => {
  const value = String(storedAddress || '').trim()

  try {
    const storedCoords = JSON.parse(localStorage.getItem('selected_delivery_coords') || 'null')
    if (storedCoords && Number.isFinite(Number(storedCoords.lat)) && Number.isFinite(Number(storedCoords.lng))) {
      return {
        lat: Number(storedCoords.lat),
        lng: Number(storedCoords.lng),
        label: storedCoords.label || value || DEFAULT_LOCATION.label,
      }
    }
  } catch (error) {
    // Ignore malformed coordinate cache and fall through to the text-based fallback.
  }

  const match = value.match(/ubicaci[oó]n actual \(([-\d.]+),\s*([-\d.]+)\)/i)

  if (match) {
    return {
      lat: Number(match[1]),
      lng: Number(match[2]),
      label: value,
    }
  }

  return DEFAULT_LOCATION
}

const toRadians = (value) => (value * Math.PI) / 180

const getDistanceKm = (from, to) => {
  const fromLat = Number(from?.lat)
  const fromLng = Number(from?.lng)
  const toLat = Number(to?.lat)
  const toLng = Number(to?.lng)

  if ([fromLat, fromLng, toLat, toLng].some((value) => Number.isNaN(value))) {
    return Number.POSITIVE_INFINITY
  }

  const earthRadiusKm = 6371
  const latDelta = toRadians(toLat - fromLat)
  const lngDelta = toRadians(toLng - fromLng)
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(lngDelta / 2) ** 2

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const getRestaurantCategories = (restaurant) => {
  const values = []
  const candidates = [
    restaurant?.category,
    restaurant?.category_name,
    restaurant?.foodType,
    restaurant?.food_type,
    restaurant?.type,
  ]

  candidates.forEach((candidate) => {
    if (typeof candidate === 'string' && candidate.trim()) {
      values.push(candidate)
    }
  })

  if (Array.isArray(restaurant?.categories)) {
    restaurant.categories.forEach((category) => {
      if (typeof category === 'string' && category.trim()) {
        values.push(category)
      }
      if (category && typeof category === 'object' && typeof category.name === 'string') {
        values.push(category.name)
      }
    })
  }

  return values
}

const normalizeRestaurant = (restaurant) => {
  const categories = Array.isArray(restaurant?.categories)
    ? restaurant.categories
    : []

  const categoryNames = categories
    .map((category) => (typeof category === 'string' ? category : category?.name))
    .filter(Boolean)

  return {
    ...restaurant,
    image: restaurant?.banner || restaurant?.logo || restaurant?.image || DEFAULT_RESTAURANT_IMAGE,
    rating: Number(restaurant?.average_rating ?? restaurant?.rating ?? 0),
    delivery: Number(restaurant?.delivery_cost ?? restaurant?.delivery ?? 0),
    lat: Number(restaurant?.lat ?? restaurant?.latitude ?? NaN),
    lng: Number(restaurant?.lng ?? restaurant?.longitude ?? NaN),
    time: restaurant?.delivery_time_min
      ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max ?? restaurant.delivery_time_min + 10} min`
      : restaurant?.time || '20-30 min',
    isOpen: Boolean(restaurant?.isOpen ?? restaurant?.is_open ?? false),
    categories: categories.length > 0 ? categories : categoryNames,
  }
}

const sortRestaurants = (list = []) => {
  return [...list].sort((a, b) => {
    const openA = Boolean(a?.isOpen)
    const openB = Boolean(b?.isOpen)

    if (openA !== openB) {
      return Number(openB) - Number(openA)
    }

    return Number(b?.rating || 0) - Number(a?.rating || 0)
  })
}

const handleRestaurantImageError = (event) => {
  if (!event?.currentTarget) return

  if (event.currentTarget.dataset.fallbackApplied === 'true') {
    return
  }

  event.currentTarget.dataset.fallbackApplied = 'true'
  event.currentTarget.src = DEFAULT_RESTAURANT_IMAGE
}

export default function RestaurantsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { token } = useAuthStore()
  const { favorites, fetchFavorites } = useFavoritesStore()
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    let active = true

    const loadRestaurants = async () => {
      try {
        const data = await fetchJson('/restaurants?paginate=false')
        const restaurantsArray = Array.isArray(data)
          ? data
          : data.data || data.restaurants || []

        const normalized = restaurantsArray.map(normalizeRestaurant)
        if (active) {
          const source = normalized.length > 0 ? normalized : MOCK_RESTAURANTS.map(normalizeRestaurant)
          setRestaurants(sortRestaurants(source))
          setError(null)
        }
      } catch (err) {
        console.error('Error cargando restaurantes:', err)
        if (active) {
          setRestaurants(sortRestaurants(MOCK_RESTAURANTS.map(normalizeRestaurant)))
          setError(null)
        }
      }
    }

    loadRestaurants()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const nextQuery = params.get('q') || ''
    setSearchQuery(nextQuery)
  }, [location.search])

  useEffect(() => {
    const syncLocation = () => {
      const storedAddress = localStorage.getItem('selected_delivery_address') || ''
      setUserLocation(parseStoredLocation(storedAddress))
    }

    syncLocation()
    window.addEventListener('delivery-address-updated', syncLocation)
    window.addEventListener('storage', syncLocation)

    return () => {
      window.removeEventListener('delivery-address-updated', syncLocation)
      window.removeEventListener('storage', syncLocation)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchFavorites(token)
    }
  }, [token, fetchFavorites])

  const hasPromo = (restaurant) => Number(restaurant.delivery || 0) <= 4000
  const hasHighRating = (restaurant) => Number(restaurant.rating || 0) >= 4.7
  const isFavoriteRestaurant = (restaurant) => favorites.includes(restaurant.id)

  const availableFoodTypes = useMemo(() => {
    const categorySet = new Set()
    restaurants.forEach((restaurant) => {
      getRestaurantCategories(restaurant).forEach((category) => categorySet.add(category))
    })
    const ordered = DEFAULT_FOOD_TYPES.filter((category) => categorySet.has(category))
    return ordered.length > 0 ? ordered : DEFAULT_FOOD_TYPES
  }, [restaurants])

  const isInSelectedCategory = (restaurant) => {
    if (!selectedCategory) return true
    const selected = normalizeCategory(selectedCategory)
    return getRestaurantCategories(restaurant)
      .some((category) => normalizeCategory(category) === selected)
  }

  const filteredRestaurants = restaurants.filter(r => {
    if (filter === 'promo' && !hasPromo(r)) return false
    if (filter === 'rating' && !hasHighRating(r)) return false
    if (filter === 'favorites' && !isFavoriteRestaurant(r)) return false
    if (!isInSelectedCategory(r)) return false
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      const haystack = [
        r.name,
        r.description,
        r.category,
        r.category_name,
        r.foodType,
        r.food_type,
        ...(Array.isArray(r.categories)
          ? r.categories.flatMap((category) => {
              if (typeof category === 'string') return [category]
              if (category && typeof category === 'object') return [category.name, category.slug]
              return []
            })
          : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    }
    return true
  })

  const nearbyRestaurants = useMemo(() => (
    [...restaurants]
      .map((restaurant) => ({
        ...restaurant,
        distanceKm: getDistanceKm(userLocation, restaurant),
      }))
      .filter((restaurant) => Number.isFinite(restaurant.distanceKm))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 8)
  ), [restaurants, userLocation])

  const openCount   = restaurants.filter(r => r.isOpen).length
  const closedCount = restaurants.filter(r => !r.isOpen).length

  const slide = (dir) => {
    if (!trackRef.current) return
    const cards = trackRef.current.querySelectorAll('.restaurant-card-item')
    if (!cards.length) return
    const vis = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4
    const max = Math.max(0, cards.length - vis)
    const next = Math.max(0, Math.min(carouselIndex + dir, max))
    setCarouselIndex(next)
    trackRef.current.style.transform = `translateX(-${next * (cards[0].offsetWidth + 24)}px)`
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory((previous) => (previous === category ? null : category))
  }

  const handleClearFilters = () => {
    setFilter('all')
    setSelectedCategory(null)
    setSearchQuery('')
    navigate('/restaurants', { replace: true })
  }

  const hasActiveFilters = filter !== 'all' || Boolean(selectedCategory) || Boolean(searchQuery.trim())

  return (
    <div className="page-restaurants min-h-screen bg-white">

      {/* ═══════════ SECCIÓN: Filtros y Categorías ═══════════ */}
      <section className="py-4 md:py-6">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">

          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {t('restaurants.title')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('restaurants.subtitle')}
            </p>
          </div>

          {restaurants.length > 0 && (
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 max-w-2xl">
              <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-[#FF4B3E] leading-none">{restaurants.length}</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{t('restaurants.count')}</p>
              </div>
              <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-green-600 leading-none">{openCount}</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{t('restaurants.open')}</p>
              </div>
              <div className="text-center p-3 md:p-4 bg-gray-100 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-gray-600 leading-none">{closedCount}</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{t('restaurants.closed')}</p>
              </div>
            </div>
          )}

          {/* Filtros principales */}
          <div className="mb-4 flex gap-2 overflow-x-auto flex-nowrap pb-2">
            <button onClick={() => setFilter('all')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition ${
                filter === 'all'
                  ? 'bg-[#FF4B3E] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF4B3E]'
              }`}>
              Todos
            </button>
            <button onClick={() => setFilter('promo')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                filter === 'promo' ? 'bg-[#FFB84D] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FFB84D]'
              }`}>
              🎁 Promo
            </button>
            <button onClick={() => setFilter('rating')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                filter === 'rating' ? 'bg-[#4ECDC4] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#4ECDC4]'
              }`}>
              ⭐ Calificación alta
            </button>
            <button onClick={() => setFilter('favorites')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                filter === 'favorites' ? 'bg-[#FD79A8] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FD79A8]'
              }`}>
              ❤️ Favoritos
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-shrink-0 px-4 py-2 rounded-full font-bold transition flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF4B3E]"
                aria-label="Limpiar filtros"
                title="Limpiar filtros"
              >
                <i className="fas fa-trash" />
              </button>
            )}
          </div>

          <div className="mb-3">
            <FoodCategoryCarousel
              categories={availableFoodTypes}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          </div>

          {error && (
            <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
        </div>
      </section>

      {selectedCategory && (
        <section className="py-6 md:py-8">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="mb-4">
              <p className="text-[#FF4B3E] font-bold text-xs tracking-widest uppercase mb-2">
                🍽️ {t('restaurants.all_restaurants')}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t('restaurants.explore')}
              </h2>
            </div>

            {filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <div key={`category-${restaurant.id}`}
                    className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition cursor-pointer group"
                    onClick={() => navigate(`/restaurants/${restaurant.id}`, { state: { restaurant } })}>
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <img src={restaurant.image} alt={restaurant.name}
                        onError={handleRestaurantImageError}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-3 right-3 z-10">
                        {restaurant.isOpen ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            {t('restaurants.open_badge')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            {t('restaurants.closed_badge')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-star text-yellow-400" />
                            <span className="font-bold text-gray-900">{restaurant.rating}</span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600 flex items-center gap-1">
                            <i className="fas fa-clock" />{restaurant.time}
                          </span>
                        </div>
                        <span className="text-gray-600 font-medium">${restaurant.delivery.toLocaleString()} {t('restaurants.delivery')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('restaurants.no_results')}</h3>
                <p className="text-gray-600">{t('restaurants.no_results_hint')}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════ SECCIÓN: Restaurantes Favoritos ═══════════ */}
      {!selectedCategory && (
        <section className="py-4 md:py-6 bg-gray-50">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="mb-4">
              <p className="text-[#FF4B3E] font-bold text-xs tracking-widest uppercase mb-2">
                ⭐ {t('restaurants.most_popular')}
              </p>
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {t('restaurants.favorites')}
                </h2>
                <div className="flex gap-3">
                  <button onClick={() => slide(-1)} disabled={carouselIndex === 0}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#FF4B3E] hover:bg-[#FF4B3E] transition group disabled:opacity-50 disabled:cursor-not-allowed">
                    <i className="fas fa-chevron-left text-gray-600 group-hover:text-white transition" />
                  </button>
                  <button onClick={() => slide(1)} disabled={carouselIndex >= Math.max(0, restaurants.length - 6)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#FF4B3E] hover:bg-[#FF4B3E] transition group disabled:opacity-50 disabled:cursor-not-allowed">
                    <i className="fas fa-chevron-right text-gray-600 group-hover:text-white transition" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <div ref={trackRef} className="flex gap-4 transition-transform duration-500 ease-out" style={{ transform: 'translateX(0)' }}>
                {restaurants.slice(0, 15).map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="restaurant-card-item flex-shrink-0 w-48 cursor-pointer"
                    onClick={() => navigate(`/restaurants/${restaurant.id}`, { state: { restaurant } })}
                  >
                    <div className="relative rounded-lg overflow-hidden h-40 bg-gray-200 group shadow-md hover:shadow-lg transition">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        onError={handleRestaurantImageError}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />
                      <div className="absolute inset-0 flex flex-col justify-between p-3">
                        <div>
                          {restaurant.isOpen ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              {t('restaurants.open_badge')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-800 text-white">
                              {t('restaurants.closed_badge')}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">{restaurant.name}</h3>
                          <div className="flex items-center gap-2 text-white text-xs">
                            <span className="flex items-center gap-0.5">
                              <i className="fas fa-star text-yellow-400" />{restaurant.rating}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <i className="fas fa-clock text-gray-300" />{restaurant.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 line-clamp-1">{restaurant.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ SECCIÓN: Grilla de Resultados ═══════════ */}
      {!selectedCategory && (
        <section className="py-6 md:py-8">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">

          <div className="mb-4">
            <p className="text-[#FF4B3E] font-bold text-xs tracking-widest uppercase mb-2">
              🍽️ {t('restaurants.all_restaurants')}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('restaurants.explore')}
            </h2>
          </div>

          {filteredRestaurants.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map(restaurant => (
                <div key={restaurant.id}
                  className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition cursor-pointer group"
                  onClick={() => navigate(`/restaurants/${restaurant.id}`, { state: { restaurant } })}>
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img src={restaurant.image} alt={restaurant.name}
                      onError={handleRestaurantImageError}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-3 right-3 z-10">
                      {restaurant.isOpen ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                          {t('restaurants.open_badge')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          {t('restaurants.closed_badge')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <i className="fas fa-star text-yellow-400" />
                          <span className="font-bold text-gray-900">{restaurant.rating}</span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 flex items-center gap-1">
                          <i className="fas fa-clock" />{restaurant.time}
                        </span>
                      </div>
                      <span className="text-gray-600 font-medium">${restaurant.delivery.toLocaleString()} {t('restaurants.delivery')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('restaurants.no_results')}</h3>
              <p className="text-gray-600">{t('restaurants.no_results_hint')}</p>
            </div>
          )}
          </div>
        </section>
      )}

      <section className="py-4 md:py-6 bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[#FF4B3E] font-bold text-xs tracking-widest uppercase mb-2">
                📍 Restaurantes cercanos
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Cerca de {userLocation.label}
              </h2>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              Mostramos primero los restaurantes más próximos a tu ubicación base.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nearbyRestaurants.map((restaurant) => (
              <div key={`nearby-${restaurant.id}`} className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition cursor-pointer group"
                onClick={() => navigate(`/restaurants/${restaurant.id}`, { state: { restaurant } })}>
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img src={restaurant.image} alt={restaurant.name}
                    onError={handleRestaurantImageError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 text-gray-800 text-xs font-bold rounded-full shadow-lg">
                      <i className="fas fa-location-dot text-[#FF4B3E]" />
                      {restaurant.distanceKm < 1 ? `${Math.round(restaurant.distanceKm * 1000)} m` : `${restaurant.distanceKm.toFixed(1)} km`}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    {restaurant.isOpen ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        {t('restaurants.open_badge')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        {t('restaurants.closed_badge')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <i className="fas fa-star text-yellow-400" />
                        <span className="font-bold text-gray-900">{restaurant.rating}</span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <i className="fas fa-clock" />{restaurant.time}
                      </span>
                    </div>
                    <span className="text-gray-600 font-medium">${restaurant.delivery.toLocaleString()} {t('restaurants.delivery')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer restaurants={restaurants} />
    </div>
  )
}