// Archivo: src/pages/Restaurants.jsx | Comentario: logica principal del modulo.
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchJson } from '../api/fetchJson'
import RestaurantCard from '../components/RestaurantCard'
import FoodCategoryCarousel from '../components/FoodCategoryCarousel'
import Footer from '../components/Footer'
import { MOCK_RESTAURANTS } from '../data/mockRestaurants'

export default function RestaurantsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => { loadRestaurants() }, [])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const data = await fetchJson('/restaurants')
      const restaurantsArray = Array.isArray(data) ? data : data.data || data.restaurants || []
      if (restaurantsArray.length === 0) throw new Error('No restaurants data')
      const categories = ['burger', 'pizza', 'sushi', 'tacos', 'asian', 'dessert', 'vegan', 'seafood', 'chicken', 'coffee']
      const enriched = restaurantsArray.map((r, idx) => ({
        ...r,
        isOpen: typeof r.isOpen === 'boolean' ? r.isOpen : false,
        category: r.category || categories[idx % categories.length],
      }))
      setRestaurants(enriched)
      setError(null)
    } catch (err) {
      setRestaurants(MOCK_RESTAURANTS)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(r => {
    if (filter === 'open' && !r.isOpen) return false
    if (filter === 'closed' && r.isOpen) return false
    if (selectedCategory && (!r.category || r.category !== selectedCategory)) return false
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return r.name.toLowerCase().includes(query) ||
             (r.description && r.description.toLowerCase().includes(query))
    }
    return true
  })

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

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════ SECCIÓN: Filtros y Categorías ═══════════ */}
      <section className="py-4 md:py-6">
        <div className="px-4 sm:px-6 lg:px-8">

          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {t('restaurants.title')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('restaurants.subtitle')}
            </p>
          </div>

          {!loading && restaurants.length > 0 && (
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

          {/* Filtros por Categoría */}
          <div className="mb-4 flex gap-2 overflow-x-auto flex-nowrap pb-2">
            <button onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition ${
                selectedCategory === null
                  ? 'bg-[#FF4B3E] text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF4B3E]'
              }`}>
              {t('restaurants.all')}
            </button>
            <button onClick={() => setSelectedCategory('burger')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'burger' ? 'bg-[#FFB84D] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FFB84D]'
              }`}>
              🍔 {t('restaurants.burgers')}
            </button>
            <button onClick={() => setSelectedCategory('pizza')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'pizza' ? 'bg-[#FF6B6B] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF6B6B]'
              }`}>
              🍕 {t('restaurants.pizzas')}
            </button>
            <button onClick={() => setSelectedCategory('sushi')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'sushi' ? 'bg-[#4ECDC4] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#4ECDC4]'
              }`}>
              🍣 {t('restaurants.sushi')}
            </button>
            <button onClick={() => setSelectedCategory('tacos')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'tacos' ? 'bg-[#FFD93D] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FFD93D]'
              }`}>
              🌮 {t('restaurants.tacos')}
            </button>
            <button onClick={() => setSelectedCategory('asian')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'asian' ? 'bg-[#6C5CE7] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#6C5CE7]'
              }`}>
              🍜 {t('restaurants.asian')}
            </button>
            <button onClick={() => setSelectedCategory('dessert')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                selectedCategory === 'dessert' ? 'bg-[#FD79A8] text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FD79A8]'
              }`}>
              🍰 {t('restaurants.desserts')}
            </button>
          </div>

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

      {/* ═══════════ SECCIÓN: Restaurantes Favoritos ═══════════ */}
      <section className="py-4 md:py-6 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8">

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

          {!loading && (
            <div className="overflow-hidden">
              <div ref={trackRef} className="flex gap-4 transition-transform duration-500 ease-out" style={{ transform: 'translateX(0)' }}>
                {restaurants.slice(0, 15).map(restaurant => (
                  <div key={restaurant.id} className="restaurant-card-item flex-shrink-0 w-48 cursor-pointer"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } })}>
                    <div className="relative rounded-lg overflow-hidden h-40 bg-gray-200 group shadow-md hover:shadow-lg transition">
                      <img src={restaurant.image} alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
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
                      <p className="text-sm font-bold text-gray-900 mt-1">💵 ${restaurant.delivery.toLocaleString()}</p>
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

          <div className="mb-4">
            <p className="text-[#FF4B3E] font-bold text-xs tracking-widest uppercase mb-2">
              🍽️ {t('restaurants.all_restaurants')}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('restaurants.explore')}
            </h2>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">{t('restaurants.loading')}</p>
              </div>
            </div>
          )}

          {!loading && filteredRestaurants.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map(restaurant => (
                <div key={restaurant.id}
                  className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition cursor-pointer group"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } })}>
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img src={restaurant.image} alt={restaurant.name}
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

          {!loading && filteredRestaurants.length === 0 && (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('restaurants.no_results')}</h3>
              <p className="text-gray-600">{t('restaurants.no_results_hint')}</p>
            </div>
          )}
        </div>
      </section>

      <Footer restaurants={restaurants} />
    </div>
  )
}