// Archivo: src/pages/Favorites.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchJson } from '../api/fetchJson';
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
      // server toggle
      const ok = await toggleFavorite(restaurantId, token)
      if (!ok) {
        // set error in store already
      }
    } else {
      // local fallback
      toggleFavoriteLocal(restaurantId)
    }
  }

  if (loading) return <Loading />;

  const favoriteRestaurants = (favorites || []).map(id => {
    return restaurants.find(r => Number(r.id) === Number(id)) || null
  }).filter(Boolean)

  return (
    <main className="favorites-page-container">
      <div className="container">
        <h1 className="mb-6">{t('favorites.title')}</h1>

        {error && <ErrorMessage message={error} />}

        {favoriteRestaurants.length > 0 ? (
          <div className="favorites-item-grid">
            {favoriteRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="favorite-item">
                {restaurant.image && (
                  <img src={restaurant.image} alt={restaurant.name} className="favorite-img" />
                )}
                <div className="favorite-info">
                  <h3>{restaurant.name}</h3>
                  <p className="description">{(restaurant.description || '').substring(0, 100)}</p>
                  <div className="favorite-rating">
                    <span className="rating">{restaurant.rating ? `⭐ ${restaurant.rating}` : ''}</span>
                  </div>
                </div>
                <div className="favorite-actions">
                  <button onClick={() => navigate(`/restaurants/${restaurant.id}`)} className="button-primary text-sm px-4 py-2">{t('favorites.view')}</button>
                  <button onClick={() => handleRemoveFavorite(restaurant.id)} className="button-outline text-red-500 border-red-500 hover:bg-red-500 text-sm px-4 py-2" title="Quitar favorito">
                    <i className="fas fa-heart-break"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-heart text-4xl text-[#FF4B3E]"></i>
            <p className="mt-3">{t('favorites.empty')}</p>
            <button onClick={() => navigate('/restaurants')} className="button-primary mt-4">{t('favorites.discover')}</button>
          </div>
        )}
      </div>
    </main>
  )
}