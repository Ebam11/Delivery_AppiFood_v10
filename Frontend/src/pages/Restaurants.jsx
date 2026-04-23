// Archivo: src/pages/Restaurants.jsx | Comentario: logica principal del modulo.
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJson } from '../api/fetchJson'
import RestaurantCard from '../components/RestaurantCard'
import FoodCategoryCarousel from '../components/FoodCategoryCarousel'
import Footer from '../components/Footer'
import { MOCK_RESTAURANTS } from '../data/mockRestaurants'
import { useFavoritesStore } from '../store/favoritesStore'
import { useAuthStore } from '../store/authStore'

const formatDeliveryTime = (restaurant) => {
  if (restaurant.delivery_time_min && restaurant.delivery_time_max) {
    return `${restaurant.delivery_time_min}-${restaurant.delivery_time_max} min`
  }

  if (restaurant.delivery_time_min) {
    return `${restaurant.delivery_time_min} min`
  }

  if (restaurant.time) {
    return restaurant.time
  }

  return '-- min'
}

const normalizeRestaurant = (restaurant, index = 0) => {
  const fallback = MOCK_RESTAURANTS[index % MOCK_RESTAURANTS.length] || {}
  const categories = Array.isArray(restaurant.categories) ? restaurant.categories : []
  const menuCategories = Array.isArray(restaurant.menu_categories) ? restaurant.menu_categories : []
  const products = Array.isArray(restaurant.products) ? restaurant.products : []
  const isMock = Boolean(restaurant.isMock)
  const normalizeProduct = (product) => ({ ...product, isMock })
  const derivedCategory =
    restaurant.category ||
    categories[0]?.name?.toLowerCase() ||
    menuCategories[0]?.name?.toLowerCase() ||
    fallback.category ||
    'general'

  return {
    ...restaurant,
    img: restaurant.banner || restaurant.logo || restaurant.image || restaurant.img || fallback.image || fallback.img || '',
    image: restaurant.banner || restaurant.logo || restaurant.image || restaurant.img || fallback.image || fallback.img || '',
    rating: Number((Number(restaurant.average_rating ?? restaurant.rating ?? fallback.rating ?? 0)).toFixed(1)),
    time: formatDeliveryTime(restaurant),
    delivery: Number(restaurant.delivery_cost ?? restaurant.delivery ?? fallback.delivery ?? 0),
    isOpen: typeof restaurant.isOpen === 'boolean'
      ? restaurant.isOpen
      : Boolean(restaurant.today_schedule?.is_open_now ?? fallback.isOpen ?? false),
    category: derivedCategory,
    isMock,
    products: products.map(normalizeProduct),
    menu_categories: menuCategories.map((category) => ({
      ...category,
      products: Array.isArray(category.products) ? category.products.map(normalizeProduct) : [],
    })),
  }
}

const FAST_FOOD_TERMS = [
  'fastfood',
  'fast food',
  'comida rapida',
  'burger',
  'hamburguesa',
  'pizza',
  'hot dog',
  'perro caliente',
  'sandwich',
  'tacos',
  'pollo frito',
  'fried chicken',
]

const matchesFastFood = (restaurant) => {
  const values = [
    restaurant.category,
    restaurant.name,
    restaurant.description,
    ...(Array.isArray(restaurant.categories) ? restaurant.categories.map((c) => c?.name) : []),
    ...(Array.isArray(restaurant.menu_categories) ? restaurant.menu_categories.map((c) => c?.name) : []),
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase())

  return FAST_FOOD_TERMS.some((term) => values.some((value) => value.includes(term)))
}

export default function RestaurantsPage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { fetchFavorites, toggleFavorite, toggleFavoriteLocal, isFavorite } = useFavoritesStore()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'open', 'closed'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const trackRef = useRef(null)

  // Cargar favoritos al montar
  useEffect(() => {
    if (token) {
      fetchFavorites(token)
    }
  }, [token, fetchFavorites])

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const data = await fetchJson('/restaurants')
      console.log('📍 Restaurantes cargados:', data)
      
      // Asegurar que sea un array
      const restaurantsArray = Array.isArray(data) ? data : data.data || data.restaurants || []
      
      if (restaurantsArray.length === 0) {
        throw new Error('No restaurants data')
      }
      
      const categories = ['fastfood', 'burger', 'pizza', 'sushi', 'tacos', 'asian', 'dessert', 'vegan', 'seafood', 'chicken', 'coffee']

      // Agregar estado de apertura y categoría si no existe
      const enrichedApi = restaurantsArray.map((restaurant, idx) =>
        normalizeRestaurant({
          ...restaurant,
          category: restaurant.category || categories[idx % categories.length],
        }, idx)
      )

      setRestaurants(enrichedApi)
      setError(null)
    } catch (err) {
      console.error('❌ Error cargando restaurantes:', err.message)
      const fallbackRestaurants = MOCK_RESTAURANTS.map((restaurant, idx) => normalizeRestaurant(restaurant, idx))
      setRestaurants(fallbackRestaurants)
      setError('No se pudo cargar el catálogo desde el backend. Verifica que el API esté activa y accesible.')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar restaurantes
  const filteredRestaurants = restaurants.filter(r => {
    // Filtro por estado
    if (filter === 'open' && !r.isOpen) return false
    if (filter === 'closed' && r.isOpen) return false
    
    // Filtro por categoría
    if (selectedCategory === 'fastfood' && !matchesFastFood(r)) return false
    if (selectedCategory && selectedCategory !== 'fastfood' && (!r.category || r.category !== selectedCategory)) return false
    
    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return r.name.toLowerCase().includes(query) || 
             (r.description && r.description.toLowerCase().includes(query))
    }
    
    return true
  })

  const openCount = restaurants.filter(r => r.isOpen).length
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

  const handleFavoriteClick = async (event, restaurantId) => {
    event.stopPropagation()

    if (token) {
      await toggleFavorite(restaurantId, token)
      return
    }

    toggleFavoriteLocal(restaurantId)
  }

  const getRestaurantTags = (restaurant) => {
    const tags = []

    if (Array.isArray(restaurant.menu_categories) && restaurant.menu_categories.length > 0) {
      tags.push(...restaurant.menu_categories.map((category) => category?.name).filter(Boolean))
    }

    if (Array.isArray(restaurant.categories) && restaurant.categories.length > 0) {
      tags.push(...restaurant.categories.map((category) => category?.name).filter(Boolean))
    }

    if (restaurant.category) {
      tags.push(String(restaurant.category))
    }

    const normalized = tags
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))

    return [...new Set(normalized)].slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* ═══════════ SECCIÓN: Filtros y Categorías ═══════════ */}
      <section className="py-4 md:py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Restaurantes cerca de mí
            </h1>
            <p className="text-sm text-gray-500">
              Elige tu categoría favorita y descubre opciones deliciosas
            </p>
          </div>

          {/* Estadísticas superiores */}
          {!loading && restaurants.length > 0 && (
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 max-w-2xl">
              <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-[#FF4B3E] leading-none">
                  {restaurants.length}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Restaurantes
                </p>
              </div>
              <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-green-600 leading-none">
                  {openCount}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Abiertos
                </p>
              </div>
              <div className="text-center p-3 md:p-4 bg-gray-100 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-gray-600 leading-none">
                  {closedCount}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Cerrados
                </p>
              </div>
            </div>
          )}

          {/* Filtros por Categoría - Horizontal Scroll */}
          <div className="mb-4 flex gap-2 overflow-x-auto flex-nowrap pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition ${
                selectedCategory === null
                  ? 'bg-[#FF4B3E] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF4B3E]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedCategory('fastfood')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'fastfood'
                  ? 'bg-[#FF4B3E] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF4B3E]'
              }`}
            >
              Comidas rapidas
            </button>
            <button
              onClick={() => setSelectedCategory('burger')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'burger'
                  ? 'bg-[#FFB84D] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FFB84D]'
              }`}
            >
              Mexicana
            </button>
            <button
              onClick={() => setSelectedCategory('pizza')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'pizza'
                  ? 'bg-[#FF6B6B] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF6B6B]'
              }`}
            >
              Italiana
            </button>
            <button
              onClick={() => setSelectedCategory('sushi')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'sushi'
                  ? 'bg-[#4ECDC4] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#4ECDC4]'
              }`}
            >
              Japonesa
            </button>
            <button
              onClick={() => setSelectedCategory('tacos')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'tacos'
                  ? 'bg-[#FFD93D] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FFD93D]'
              }`}
            >
              Sopas
            </button>
            <button
              onClick={() => setSelectedCategory('asian')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'asian'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#6C5CE7]'
              }`}
            >
              Asiatica
            </button>
            <button
              onClick={() => setSelectedCategory('dessert')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'dessert'
                  ? 'bg-[#FD79A8] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FD79A8]'
              }`}
            >
              Postres
            </button>
          </div>

          {/* Categoría Carousel - Icon Carousel */}
          {!loading && (
            <div className="mb-6">
              <FoodCategoryCarousel 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ SECCIÓN: Restaurantes Favoritos (Pequeños) ═══════════ */}
      <section className="py-4 md:py-6 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8">
          
          {/* Header Sección */}
          <div className="mb-4">
            <p className="text-[#FF4B3E] font-bold text-xs tracking-widest uppercase mb-2">
              LOS MAS POPULARES
            </p>
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Restaurantes Favoritos
              </h2>
              
              {/* Botones de navegación carrusel */}
              <div className="flex gap-3">
                <button
                  onClick={() => slide(-1)}
                  disabled={carouselIndex === 0}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#FF4B3E] hover:bg-[#FF4B3E] transition group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left text-gray-600 group-hover:text-white transition" />
                </button>
                <button
                  onClick={() => slide(1)}
                  disabled={carouselIndex >= Math.max(0, restaurants.length - 6)}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#FF4B3E] hover:bg-[#FF4B3E] transition group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-right text-gray-600 group-hover:text-white transition" />
                </button>
              </div>
            </div>
          </div>

          {/* Carrusel de Restaurantes Pequeños */}
          {!loading && (
            <div className="overflow-hidden">
              <div
                ref={trackRef}
                className="flex gap-4 transition-transform duration-500 ease-out"
                style={{ transform: 'translateX(0)' }}
              >
                {restaurants.slice(0, 15).map(restaurant => (
                  <div
                    key={restaurant.id}
                    className="restaurant-card-item flex-shrink-0 w-48 cursor-pointer"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } })}
                  >
                    <div className="relative rounded-lg overflow-hidden h-40 bg-gray-200 group shadow-md hover:shadow-lg transition">
                      {/* Imagen */}
                      <img
                        src={restaurant.image || 'https://via.placeholder.com/640x360?text=Restaurante'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(event) => {
                          event.currentTarget.src = 'https://via.placeholder.com/640x360?text=Restaurante'
                        }}
                      />
                      
                      {/* Overlay oscuro */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />
                      
                      {/* Contenido Info */}
                      <div className="absolute inset-0 flex flex-col justify-between p-3">
                        {/* Estado Badge + Favorito */}
                        <div className="flex items-start justify-between gap-2">
                          {restaurant.isOpen ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              Abierto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-800 text-white">
                              Cerrado
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(event) => handleFavoriteClick(event, restaurant.id)}
                            className={`h-8 w-8 rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition ${
                              isFavorite(restaurant.id) ? 'text-[#FF4B3E]' : 'text-gray-400 hover:text-[#FF4B3E]'
                            }`}
                            aria-label={isFavorite(restaurant.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                          >
                            <i className="fas fa-heart text-sm" />
                          </button>
                        </div>
                        
                        {/* Nombre y detalles al fondo */}
                        <div>
                          <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                            {restaurant.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white text-xs">
                            <span className="flex items-center gap-0.5">
                              <i className="fas fa-star text-yellow-400" />
                              {restaurant.rating}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <i className="fas fa-clock text-gray-300" />
                              {restaurant.time}
                            </span>
                          </div>
                          {getRestaurantTags(restaurant).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {getRestaurantTags(restaurant).map((tag) => (
                                <span key={`${restaurant.id}-${tag}`} className="rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold text-white line-clamp-1">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Detalles debajo */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {restaurant.description}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        ${Number(restaurant.delivery || 0).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ SECCIÓN: Grilla de Resultados ═══════════ */}
      <section className="py-6 md:py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          
          {/* Header Sección */}
          <div className="mb-4">
            <p className="text-[#FF4B3E] font-bold text-xs tracking-widest uppercase mb-2">
              TODOS LOS RESTAURANTES
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Explora todos nuestros locales
            </h2>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Cargando restaurantes...</p>
              </div>
            </div>
          )}

          {/* Grid de Restaurantes */}
          {!loading && filteredRestaurants.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition cursor-pointer group"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } })}
                >
                  {/* Imagen */}
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={restaurant.image || 'https://via.placeholder.com/640x360?text=Restaurante'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(event) => {
                        event.currentTarget.src = 'https://via.placeholder.com/640x360?text=Restaurante'
                      }}
                    />
                    
                    {/* Badge estado */}
                    <div className="absolute top-3 left-3 z-10">
                      {restaurant.isOpen ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                          Abierto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          Cerrado
                        </span>
                      )}
                    </div>

                    {/* Favorito */}
                    <button
                      type="button"
                      onClick={(event) => handleFavoriteClick(event, restaurant.id)}
                      className={`absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white shadow-lg transition ${
                        isFavorite(restaurant.id) ? 'text-[#FF4B3E]' : 'text-gray-400 hover:text-[#FF4B3E]'
                      }`}
                      aria-label={isFavorite(restaurant.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    >
                      <i className="fas fa-heart" />
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>

                    {getRestaurantTags(restaurant).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {getRestaurantTags(restaurant).map((tag) => (
                          <span key={`${restaurant.id}-${tag}`} className="rounded-full bg-[#fff0ed] px-2.5 py-1 text-[11px] font-semibold text-[#FF4B3E]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <i className="fas fa-star text-yellow-400" />
                          <span className="font-bold text-gray-900">{restaurant.rating}</span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 flex items-center gap-1">
                          <i className="fas fa-clock" />
                          {restaurant.time}
                        </span>
                      </div>
                      <span className="text-gray-600 font-medium">
                        ${Number(restaurant.delivery || 0).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {!loading && filteredRestaurants.length === 0 && (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No hay restaurantes
              </h3>
              <p className="text-gray-600">
                Intenta ajustar tus filtros
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer restaurants={restaurants} />
    </div>
  )
}
