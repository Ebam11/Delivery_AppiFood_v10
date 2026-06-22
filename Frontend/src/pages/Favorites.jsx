// Archivo: src/pages/Favorites.jsx | Comentario: logica principal del modulo con visualizacion e integracion de imagenes
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchJson } from '../api/fetchJson';
import { useRestaurantImage } from '../hooks/useImages';
import './Favorites.css';
import '../components/SharedUI.css';

const normalizeRestaurant = (restaurant) => ({
  ...restaurant,
  image: restaurant?.banner || restaurant?.logo || restaurant?.image || restaurant?.img || '',
  rating: Number(restaurant?.average_rating ?? restaurant?.rating ?? 0),
  time: restaurant?.delivery_time_min
    ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max ?? restaurant.delivery_time_min + 10} min`
    : restaurant?.time || '-- min',
})

// Subcomponente para renderizar la tarjeta con resolución de imagen dinámica
function FavoriteRestaurantCard({ restaurant, navigate, t, handleRemoveFavorite }) {
  const { image, loading } = useRestaurantImage(restaurant?.name, restaurant?.image);
  
  return (
    <div className="favorite-item">
      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-650" />
        ) : (
          <img src={image || restaurant.image} alt={restaurant.name} className="favorite-img" />
        )}
      </div>
      <div className="favorite-info">
        <h3>{restaurant.name}</h3>
        <p className="description">{(restaurant.description || '').substring(0, 100)}</p>
        <div className="favorite-rating">
          <span className="rating">{restaurant.rating ? `⭐ ${restaurant.rating}` : ''}</span>
        </div>
      </div>
      <div className="favorite-actions flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-4 border-t border-gray-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(`/restaurants/${restaurant.id}`)} 
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors text-center mr-2 shadow-sm"
        >
          {t('favorites.view') || 'Ver menú'}
        </button>
        <button 
          onClick={() => handleRemoveFavorite(restaurant.id)} 
          className="w-10 h-10 flex items-center justify-center border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200" 
          title={t('restaurantCard.remove_fav') || "Quitar favorito"}
        >
          <i className="fas fa-heart text-base"></i>
        </button>
      </div>
    </div>
  );
}

export default function Favorites() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [restaurants, setRestaurants] = useState([]);
  const {
    favorites,
    loading,
    error,
    fetchFavorites,
    toggleFavorite,
    toggleFavoriteLocal
  } = useFavoritesStore();

  useEffect(() => {
    if (token) fetchFavorites(token)
  }, [token, fetchFavorites])

  useEffect(() => {
    let active = true

    const loadRestaurants = async () => {
      try {
        const data = await fetchJson('/restaurants?paginate=false')
        const restaurantsArray = Array.isArray(data) ? data : data.data || data.restaurants || []
        const normalized = restaurantsArray.map(normalizeRestaurant)

        if (active) {
          setRestaurants(normalized)
        }
      } catch (error) {
        console.error('Error cargando restaurantes para favoritos:', error)
        if (active) {
          setRestaurants([])
        }
      }
    }

    loadRestaurants()

    return () => {
      active = false
    }
  }, [])

  const handleRemoveFavorite = async (restaurantId) => {
    if (token) {
      await toggleFavorite(restaurantId, token);
    } else {
      toggleFavoriteLocal(restaurantId);
    }
  }

  if (loading) return <Loading />;

  const favoriteRestaurants = (favorites || []).map(id => {
    return restaurants.find(r => Number(r.id) === Number(id)) || null
  }).filter(Boolean)

  return (
    <main className="favorites-page-container bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white text-xl">❤️</span>
          {t('favorites.title') || 'Mis Favoritos'}
        </h1>

        {error && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-wifi text-amber-600 dark:text-amber-400 text-sm" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Sin conexión al servidor</p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">Asegúrate de que tu servidor XAMPP esté corriendo y recarga la página.</p>
            </div>
          </div>
        )}

        {favoriteRestaurants.length > 0 ? (
          <div className="favorites-item-grid">
            {favoriteRestaurants.map((restaurant) => (
              <FavoriteRestaurantCard 
                key={restaurant.id}
                restaurant={restaurant}
                navigate={navigate}
                t={t}
                handleRemoveFavorite={handleRemoveFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-16 text-center">
            <div className="text-7xl mb-4">💔</div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {t('favorites.empty') || 'Aún no tienes favoritos'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-8">Explora restaurantes y guarda tus favoritos aquí.</p>
            <button 
              onClick={() => navigate('/restaurants')} 
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-black py-3 px-10 rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-red-500/30"
            >
              {t('favorites.discover') || 'Descubrir Restaurantes'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}