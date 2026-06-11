/**
 * Archivo: src/pages/Restaurants.jsx
 * Página de exploración de restaurantes.
 * Permite filtrar por categorías, buscar y ver restaurantes cercanos.
 */

import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { useRestaurants } from '../hooks/useRestaurants'
import FoodCategoryCarousel from '../components/FoodCategoryCarousel'
import RestaurantCard from '../components/RestaurantCard'
import Footer from '../components/Footer'

export default function RestaurantsPage() {
  const { t } = useTranslation()
  const {
    restaurants,
    allRestaurants,
    loading,
    filter,
    setFilter,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    handleFavoriteToggle,
    navigate,
    deliveryFilter,
    setDeliveryFilter,
    timeFilter,
    setTimeFilter,
    ratingFilter,
    setRatingFilter
  } = useRestaurants()

  // Tipos de comida disponibles
  // Tipos de comida disponibles (Incluyendo categorías locales de Popayán)
  const foodTypes = [
    "Restaurantes Locales", "Comida Casera", "Sopas y Caldos", 
    "Antojitos Payaneses", "Empanadas y Fritos", "Tamales",
    "Hamburguesas", "Pizza", "Sushi", "Japonesa", "Italiana", 
    "Mexicana", "Saludable", "Panadería y Postres", "Bebidas Tradicionales"
  ]

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* Cabecera y Filtros */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              {t("restaurants.title") || "Explora Restaurantes"}
            </h1>
            <p className="text-gray-500 dark:text-slate-400">
              {t("restaurants.subtitle") || "Descubre los mejores sabores de la ciudad."}
            </p>
          </div>

          {/* Estadísticas Rápidas (Opcional) */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="bg-orange-50 dark:bg-orange-950/20 px-6 py-3 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-center gap-3 whitespace-nowrap">
              <span className="text-2xl font-black text-red-500">{allRestaurants.length}</span>
              <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Locales</span>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 px-6 py-3 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-center gap-3 whitespace-nowrap">
              <span className="text-2xl font-black text-green-600">{allRestaurants.filter(r => r.isOpen).length}</span>
              <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Abiertos</span>
            </div>
          </div>



          {/* Filtros Avanzados */}
          <div className="flex flex-wrap gap-3 mb-8 items-center bg-gray-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-gray-100 dark:border-slate-800">
            <span className="text-xs font-black text-gray-400 dark:text-gray-550 uppercase tracking-widest mr-2">Filtros:</span>
            
            {/* Selector de Envío */}
            <select
              value={deliveryFilter}
              onChange={e => setDeliveryFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer hover:border-[#FF4B3E] dark:hover:border-[#FF4B3E] transition"
            >
              <option value="all">🛵 Envio: Cualquiera</option>
              <option value="free">🛵 Envio: Gratis</option>
              <option value="cheap">🛵 Envio: Menos de $3.000</option>
            </select>

            {/* Selector de Tiempo */}
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer hover:border-[#FF4B3E] dark:hover:border-[#FF4B3E] transition"
            >
              <option value="all">⚡ Tiempo: Cualquiera</option>
              <option value="fast">⚡ Tiempo: Fast (&lt;30 min)</option>
              <option value="under45">⚡ Tiempo: Menos de 45 min</option>
            </select>

            {/* Selector de Calificación */}
            <select
              value={ratingFilter}
              onChange={e => setRatingFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer hover:border-[#FF4B3E] dark:hover:border-[#FF4B3E] transition"
            >
              <option value="all">⭐ Calificación: Cualquiera</option>
              <option value="4plus">⭐ Calificación: 4.0+</option>
              <option value="45plus">⭐ Calificación: 4.5+</option>
            </select>

            {/* Botón de limpiar si hay filtros activos */}
            {(deliveryFilter !== 'all' || timeFilter !== 'all' || ratingFilter !== 'all') && (
              <button
                onClick={() => { setDeliveryFilter('all'); setTimeFilter('all'); setRatingFilter('all'); }}
                className="ml-auto text-xs font-black text-[#FF4B3E] hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Carrusel de Categorías */}
          <FoodCategoryCarousel 
            categories={foodTypes} 
            selectedCategory={selectedCategory}
            onSelectCategory={(c) => setSelectedCategory(prev => prev === c ? null : c)}
          />
        </div>
      </section>

      {/* Grilla de Resultados */}
      <section className="py-12 bg-slate-50/30 dark:bg-slate-900/10 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {searchQuery ? `Buscando "${searchQuery}"` : selectedCategory || 'Todos los restaurantes'}
            </h2>
            <span className="text-gray-400 dark:text-slate-500 font-medium">{restaurants.length} resultados</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-slate-900 rounded-3xl h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {restaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {restaurants.map(r => (
                    <RestaurantCard 
                      key={r.id} 
                      restaurant={r} 
                      onSelect={(res) => navigate(`/restaurants/${res.id}`)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-500 dark:text-slate-400">Intenta cambiar los filtros o la búsqueda.</p>
                  <button 
                    onClick={() => { setFilter('all'); setSelectedCategory(null); }}
                    className="mt-6 text-red-500 font-bold hover:underline"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
