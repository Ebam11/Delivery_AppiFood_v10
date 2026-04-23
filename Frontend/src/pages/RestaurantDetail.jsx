// Archivo: src/pages/RestaurantDetail.jsx | Comentario: logica principal del modulo.
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantStore } from '../store/restaurantStore';
import { useAuthStore } from '../store/authStore';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { AddToCartButton } from '../components/AddToCartButton';

export const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const {
    selectedRestaurant,
    isLoading,
    error,
    fetchRestaurantById,
    clearError,
  } = useRestaurantStore();

  useEffect(() => {
    fetchRestaurantById(id);
  }, [id]);

  if (isLoading) return <Loading />;

  if (!selectedRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 text-xl">{t('restaurant_detail.not_found')}</p>
          <button
            onClick={() => navigate('/restaurants')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            {t('restaurant_detail.back_to_restaurants')}
          </button>
        </div>
      </div>
    );
  }

  const restaurant = selectedRestaurant.data || selectedRestaurant;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/restaurants')}
          className="mb-6 text-blue-500 hover:text-blue-700 font-semibold"
        >
          {t('restaurant_detail.back')}
        </button>

        {error && (
          <ErrorMessage message={t('restaurant_detail.error_loading')} onDismiss={clearError} />
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {restaurant.image && (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-80 object-cover"
            />
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {restaurant.name}
            </h1>

            <p className="text-gray-600 text-lg mb-6">
              {restaurant.description}
            </p>

            {restaurant.rating && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl">⭐ {restaurant.rating}</span>
                <span className="text-gray-600">
                  ({restaurant.reviews_count || 0} {t('restaurant_detail.reviews')})
                </span>
              </div>
            )}

            {restaurant.delivery_time && (
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  {t('restaurant_detail.delivery_time', { time: restaurant.delivery_time })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Productos */}
        {restaurant.products && restaurant.products.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('restaurant_detail.menu_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurant.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-2xl font-bold text-blue-600">
                        ${product.price}
                      </p>
                      {product.available !== false && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {t('restaurant_detail.available')}
                        </span>
                      )}
                    </div>

                    {token ? (
                      <AddToCartButton
                        restaurantId={restaurant.id}
                        product={product}
                      />
                    ) : (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        {t('restaurant_detail.login_to_buy')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!restaurant.products || restaurant.products.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">
              {t('restaurant_detail.no_products')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};