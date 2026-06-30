// Archivo: src/pages/Favorites.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

function FavoriteRestaurantCard({ restaurant, navigate, t, handleRemoveFavorite }) {
  const { image, loading } = useRestaurantImage(restaurant?.name, restaurant?.image);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 group">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-650" />
        ) : (
          <img src={image || restaurant.image} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <div className="absolute top-3 left-3 bg-red-500/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-black text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1.5 z-10">
          <i className="fas fa-store text-xs" /> {t('restaurantCard.restaurant') || 'Restaurante'}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-gray-900 dark:text-white text-xl leading-tight hover:text-red-500 cursor-pointer transition-colors" onClick={() => navigate(`/restaurants/${restaurant.id}`)}>
            {restaurant.name}
          </h3>
          {restaurant.rating ? (
            <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-500 font-bold px-2 py-1 rounded-xl text-xs flex-shrink-0">
              <i className="fas fa-star" />
              {restaurant.rating}
            </span>
          ) : null}
        </div>
        
        <p className="text-gray-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
          {restaurant.description || t('restaurantCard.no_desc') || 'Las mejores preparaciones a tu puerta.'}
        </p>
      </div>

      <div className="flex justify-between items-center gap-3 p-6 pt-0">
        <button 
          onClick={() => navigate(`/restaurants/${restaurant.id}`)} 
          className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:scale-[1.02] active:scale-[0.98] text-white font-black py-3 px-4 rounded-2xl text-sm transition-all text-center shadow-lg shadow-red-500/20"
        >
          {t('favorites.view') || 'Ver menú'}
        </button>
        <button 
          onClick={() => handleRemoveFavorite(restaurant.id)} 
          className="w-11 h-11 flex items-center justify-center bg-rose-50 dark:bg-rose-950/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-200 shadow-sm border border-red-100 dark:border-red-950/30" 
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { favorites, toggleFavorite, toggleFavoriteLocal, fetchFavorites } = useFavoritesStore();

  const loadFavoritesDetails = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchJson('/favorites');
      const items = Array.isArray(data) ? data : data.data || [];
      setRestaurants(items.map(normalizeRestaurant));
      setError(null);
    } catch (err) {
      console.error('Error al cargar detalles de favoritos:', err);
      setError(t('favorites.error_load') || 'Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFavorites(token);
      loadFavoritesDetails();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleRemoveFavorite = async (restaurantId) => {
    if (token) {
      await toggleFavorite(restaurantId, token);
      // Actualizar lista local de inmediato para feedback instantáneo
      setRestaurants(prev => prev.filter(r => Number(r.id) !== Number(restaurantId)));
    } else {
      toggleFavoriteLocal(restaurantId);
    }
  }

  if (loading) return <Loading />;

  const favoriteRestaurants = restaurants;

  return (
    <main className="favorites-page-container bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 text-xl">❤️</span>
          {t('favorites.title') || 'Mis Favoritos'}
        </h1>

        {error && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-wifi text-amber-600 dark:text-amber-400 text-sm" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">{t('favorites.error_load') || 'Error al cargar favoritos'}</p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">{t('favorites.error_hint') || 'Asegúrate de que tu servidor esté corriendo y recarga la página.'}</p>
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
            <p className="text-gray-500 dark:text-slate-400 mb-8">{t('favorites.empty_hint') || 'Explora restaurantes y guarda tus favoritos aquí.'}</p>
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