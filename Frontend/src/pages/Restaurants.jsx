/**
 * Archivo: src/pages/Restaurants.jsx
 * Página de exploración de restaurantes.
 * Permite filtrar por categorías, buscar y ver restaurantes cercanos.
 */

import { useTranslation } from 'react-i18next'
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
    navigate
  } = useRestaurants()

  // Tipos de comida disponibles
  const foodTypes = [
    "Hamburguesas", "Pizza", "Japonesa", "Italiana", "Mexicana", 
    "Saludable", "Panadería y Postres", "Bebidas"
  ]

  return (
    <div className="bg-white min-h-screen">
      {/* Cabecera y Filtros */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {t("restaurants.title") || "Explora Restaurantes"}
            </h1>
            <p className="text-gray-500">
              {t("restaurants.subtitle") || "Descubre los mejores sabores de la ciudad."}
            </p>
          </div>

          {/* Estadísticas Rápidas (Opcional) */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100 flex items-center gap-3 whitespace-nowrap">
              <span className="text-2xl font-black text-red-500">{allRestaurants.length}</span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Locales</span>
            </div>
            <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 flex items-center gap-3 whitespace-nowrap">
              <span className="text-2xl font-black text-green-600">{allRestaurants.filter(r => r.isOpen).length}</span>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Abiertos</span>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {[
              { id: 'all', label: 'Todos', icon: 'fas fa-border-all' },
              { id: 'promo', label: 'Promo', icon: 'fas fa-gift', color: 'text-orange-500' },
              { id: 'rating', label: 'Top Rating', icon: 'fas fa-star', color: 'text-yellow-500' },
              { id: 'favorites', label: 'Mis Favoritos', icon: 'fas fa-heart', color: 'text-red-500' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all border-2 whitespace-nowrap
                  ${filter === f.id ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-red-500'}`}
              >
                <i className={`${f.icon} ${filter === f.id ? 'text-white' : f.color}`} />
                {f.label}
              </button>
            ))}
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
      <section className="py-12 bg-slate-50/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-gray-900">
              {searchQuery ? `Buscando "${searchQuery}"` : selectedCategory || 'Todos los restaurantes'}
            </h2>
            <span className="text-gray-400 font-medium">{restaurants.length} resultados</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-gray-100 rounded-3xl h-72 animate-pulse" />
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
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-500">Intenta cambiar los filtros o la búsqueda.</p>
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
