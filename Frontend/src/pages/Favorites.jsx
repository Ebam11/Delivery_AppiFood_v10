// Archivo: src/pages/Favorites.jsx | Comentario: logica principal del modulo.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los favoritos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId) => {
    try {
      await api.post(`/api/favorites/toggle`, { restaurant_id: restaurantId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favorites.filter(f => f.restaurant_id !== restaurantId));
    } catch (err) {
      setError('Error al remover favorito');
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="page-favorites">
      <div className="container">
        <h1>Mis Restaurantes Favoritos</h1>

        {error && <ErrorMessage message={error} />}

        {favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map(item => (
              <div key={item.id} className="favorite-card">
                {item.restaurant?.cover_image && (
                  <img
                    src={item.restaurant.cover_image}
                    alt={item.restaurant.name}
                    className="favorite-img"
                  />
                )}
                <div className="favorite-info">
                  <h3>{item.restaurant?.name}</h3>
                  <p className="description">{item.restaurant?.description?.substring(0, 100)}</p>
                  <div className="favorite-rating">
                    {item.restaurant?.reviews_avg_rating && (
                      <span className="rating">
                        <i className="fas fa-star"></i> {item.restaurant.reviews_avg_rating}
                      </span>
                    )}
                  </div>
                </div>
                <div className="favorite-actions">
                  <button
                    onClick={() => navigate(`/restaurants/${item.restaurant?.id}`)}
                    className="btn btn-sm btn-primary"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(item.restaurant_id)}
                    className="btn btn-sm btn-danger"
                  >
                    <i className="fas fa-heart-break"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-heart"></i>
            <p>No tienes restaurantes favoritos aún</p>
            <button
              onClick={() => navigate('/restaurants')}
              className="btn btn-primary"
            >
              Descubrir Restaurantes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
