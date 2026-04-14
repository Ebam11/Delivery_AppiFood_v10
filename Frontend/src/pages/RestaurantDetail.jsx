// Archivo: src/pages/RestaurantDetail.jsx | Comentario: logica principal del modulo.
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRestaurantStore } from '../store/restaurantStore';
import { useAuthStore } from '../store/authStore';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { AddToCartButton } from '../components/AddToCartButton';

const dayLabels = {
  sunday: 'Domingo',
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
}

const productFallbackImages = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=80',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=900&q=80',
  'https://images.unsplash.com/photo-1604382355121-1d2b7d9f0e2a?w=900&q=80',
]

function formatMoney(value) {
  return Number(value || 0).toLocaleString('es-CO')
}

function formatRating(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric.toFixed(1) : 'N/A'
}

function getProductImage(product, index) {
  return product.image || productFallbackImages[index % productFallbackImages.length]
}

function formatTime(value) {
  if (!value) return '--:--'
  const match = String(value).match(/^(\d{2}):(\d{2})/)
  if (!match) return String(value)
  const [, hours, minutes] = match
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
}

function buildMapUrl(lat, lng) {
  if (lat == null || lng == null) return null
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null
  const delta = 0.01
  const left = longitude - delta
  const bottom = latitude - delta
  const right = longitude + delta
  const top = latitude + delta
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`
}

export const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const {
    selectedRestaurant,
    isLoading,
    error,
    fetchRestaurantById,
    clearError,
  } = useRestaurantStore();
  const selectedData = selectedRestaurant?.data || selectedRestaurant || null;
  const restaurant = String(selectedData?.id ?? '') === String(id ?? '') ? selectedData : null;
  const fallbackUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();
  const currentRole = String(user?.role || fallbackUser?.role || '').toLowerCase();
  const canBuy = Boolean(token) && currentRole === 'user';

  useEffect(() => {
    fetchRestaurantById(id).catch(() => {});
  }, [id, fetchRestaurantById]);

  if (isLoading && !restaurant) return <Loading />;

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          {error && (
            <ErrorMessage message={error} onDismiss={clearError} />
          )}
          <p className="text-gray-600 text-xl">No pudimos cargar el restaurante</p>
          <button
            onClick={() => navigate('/restaurants')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Volver a restaurantes
          </button>
        </div>
      </div>
    );
  }

  const schedules = restaurant.schedules || [];
  const menuCategories = restaurant.menu_categories || [];
  const products = restaurant.products || [];
  const mapUrl = buildMapUrl(restaurant.lat, restaurant.lng);
  const googleMapsUrl = restaurant.lat && restaurant.lng
    ? `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`
    : restaurant.address
      ? `https://www.google.com/maps?q=${encodeURIComponent(restaurant.address)}`
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f6] to-white">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <button
          onClick={() => navigate('/restaurants')}
          className="mb-6 inline-flex items-center gap-2 text-[#FF4B3E] hover:text-[#e03a2d] font-semibold"
        >
          ← Volver
        </button>

        <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr] items-start mb-8">
          <div className="space-y-6 sticky top-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="relative">
              {(restaurant.banner || restaurant.image || restaurant.logo) ? (
                <img
                  src={restaurant.banner || restaurant.image || restaurant.logo}
                  alt={restaurant.name}
                    className="w-full h-56 sm:h-64 object-cover"
                />
              ) : (
                  <div className="w-full h-56 sm:h-64 bg-gradient-to-br from-[#FF4B3E] to-[#FF7A59]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {restaurant.is_verified !== false && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
                      <i className="fas fa-check-circle" /> Verificado
                    </span>
                  )}
                  {restaurant.isOpen !== null && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${restaurant.isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-white'}`}>
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      {restaurant.isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-2">
                  {restaurant.name}
                </h1>

                <p className="text-white/90 text-sm sm:text-base max-w-3xl line-clamp-2">
                  {restaurant.description}
                </p>
              </div>
            </div>

            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Valoración</p>
                  <p className="mt-2 text-xl font-black text-gray-900">{formatRating(restaurant.average_rating ?? restaurant.rating)}</p>
                  <p className="text-sm text-gray-500">{restaurant.total_reviews || restaurant.reviews_count || 0} reseñas</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Entrega</p>
                  <p className="mt-2 text-xl font-black text-gray-900">{restaurant.delivery_time_min || restaurant.delivery_time || '--'} min</p>
                  <p className="text-sm text-gray-500">Tiempo estimado</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Pedido mínimo</p>
                  <p className="mt-2 text-xl font-black text-gray-900">${formatMoney(restaurant.minimum_order)}</p>
                  <p className="text-sm text-gray-500">Valor mínimo</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Costo envío</p>
                  <p className="mt-2 text-xl font-black text-gray-900">${formatMoney(restaurant.delivery_cost)}</p>
                  <p className="text-sm text-gray-500">Tarifa base</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-[#fff8f6] p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-[#FF4B3E] mb-2">Información</p>
                  <div className="space-y-2.5 text-sm text-gray-700">
                    <p className="flex items-start gap-3"><i className="fas fa-map-marker-alt mt-1 text-[#FF4B3E]" /> <span>{restaurant.address || 'Dirección no disponible'}</span></p>
                    {restaurant.phone && <p className="flex items-start gap-3"><i className="fas fa-phone mt-1 text-[#FF4B3E]" /> <span>{restaurant.phone}</span></p>}
                    {restaurant.email && <p className="flex items-start gap-3"><i className="fas fa-envelope mt-1 text-[#FF4B3E]" /> <span>{restaurant.email}</span></p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-[#FF4B3E] mb-2">Horario de hoy</p>
                  {restaurant.today_schedule ? (
                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="font-bold text-gray-900">{dayLabels[restaurant.today_schedule.day] || restaurant.today_schedule.day}</p>
                      {restaurant.today_schedule.is_closed ? (
                        <p className="text-red-600 font-semibold">Cerrado hoy</p>
                      ) : (
                        <p>
                          Abre {formatTime(restaurant.today_schedule.opening_time)} y cierra {formatTime(restaurant.today_schedule.closing_time)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Horario no disponible</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-xl font-black text-gray-900">Horarios de atención</h2>
                  {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#FF4B3E] hover:text-[#e03a2d]">
                      Abrir en Maps
                    </a>
                  )}
                </div>

                {schedules.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {schedules.map((schedule) => (
                      <div key={`${schedule.day}-${schedule.opening_time}-${schedule.closing_time}`} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <p className="font-bold text-gray-900">{dayLabels[schedule.day] || schedule.day}</p>
                        {schedule.is_closed ? (
                          <p className="mt-1 text-sm text-red-600 font-semibold">Cerrado</p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-600">
                            {formatTime(schedule.opening_time)} - {formatTime(schedule.closing_time)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay horarios cargados para este restaurante.</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Ubicación</h2>
                    <p className="text-sm text-gray-500">Mapa y referencia del local</p>
                  </div>
                  {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#FF4B3E]">
                      Ir
                    </a>
                  )}
                </div>

                <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100 mb-3">
                  <p className="text-xs font-black uppercase tracking-wider text-[#FF4B3E] mb-2">Dirección</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{restaurant.address || 'Dirección no disponible'}</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 aspect-[4/3]">
                  {mapUrl ? (
                    <iframe
                      title={`Mapa de ${restaurant.name}`}
                      src={mapUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center px-6">
                      <div>
                        <i className="fas fa-map-marked-alt text-4xl text-[#FF4B3E] mb-3" />
                        <p className="font-semibold text-gray-700">No hay coordenadas disponibles para mostrar el mapa.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  <a
                    href={googleMapsUrl || '#'}
                    target={googleMapsUrl ? '_blank' : undefined}
                    rel={googleMapsUrl ? 'noreferrer' : undefined}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF4B3E] text-white px-4 py-3 font-bold hover:bg-[#e03a2d] transition"
                  >
                    <i className="fas fa-route" /> Cómo llegar
                  </a>
                  <button
                    onClick={() => navigate('/restaurants')}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-100 text-gray-800 px-4 py-3 font-bold hover:bg-gray-200 transition"
                  >
                    <i className="fas fa-store" /> Ver más locales
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6 sticky top-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#FF4B3E] mb-1">Menú</p>
                  <h2 className="text-xl font-black text-gray-900">Productos disponibles</h2>
                </div>
                {products.length > 0 && (
                  <span className="rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-bold text-[#FF4B3E]">
                    {products.length}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-8">
                {menuCategories.length > 0 ? (
                  <div className="space-y-8">
                    {menuCategories.map((category) => (
                      <div key={`${restaurant.id}-${category.id}`} className="space-y-4">
                        <h3 className="text-lg font-black text-gray-900">{category.name}</h3>
                        {category.products && category.products.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                            {category.products.map((product, productIndex) => (
                              <div
                                key={`${restaurant.id}-${category.id}-${product.id ?? productIndex}`}
                                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:-translate-y-0.5 hover:border-[#FF4B3E]/35 hover:shadow-lg transition-all duration-300"
                              >
                                <div className="relative">
                                  <img
                                    src={getProductImage(product, product.id)}
                                    alt={product.name}
                                    className="w-full h-36 object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                    onError={(event) => {
                                      event.currentTarget.src = productFallbackImages[product.id % productFallbackImages.length]
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                                  <div className="absolute top-3 left-3">
                                    <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-gray-800 backdrop-blur">
                                      {category.name}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-3.5">
                                  <div className="flex items-start justify-between gap-3 mb-1.5">
                                    <div className="min-w-0">
                                      <h4 className="font-black text-base text-gray-900 leading-tight truncate">{product.name}</h4>
                                      <p className="text-xs text-gray-500 mt-1">Disponible para pedido</p>
                                    </div>
                                    <p className="text-lg font-black text-[#FF4B3E] whitespace-nowrap">
                                      ${formatMoney(product.price)}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {product.description}
                                  </p>
                                  {token ? (
                                    canBuy ? (
                                      <AddToCartButton
                                        restaurantId={restaurant.id}
                                        product={{
                                          ...product,
                                          available: product.is_available,
                                        }}
                                      />
                                    ) : (
                                      <button
                                        onClick={() => navigate('/login')}
                                        className="w-full rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800"
                                      >
                                        Inicia con cuenta de cliente para comprar
                                      </button>
                                    )
                                  ) : (
                                    <button
                                      onClick={() => navigate('/login')}
                                      className="w-full rounded-xl bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] px-3 py-2 text-sm font-bold text-white transition"
                                    >
                                      Inicia sesión para comprar
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-gray-500">
                            Esta categoría aún no tiene productos publicados.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                    {products.map((product, productIndex) => (
                      <div
                        key={`${restaurant.id}-${product.id ?? productIndex}`}
                        className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:-translate-y-0.5 hover:border-[#FF4B3E]/35 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative">
                          <img
                            src={getProductImage(product, product.id)}
                            alt={product.name}
                            className="w-full h-36 object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            onError={(event) => {
                              event.currentTarget.src = productFallbackImages[product.id % productFallbackImages.length]
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                        </div>
                        <div className="p-3.5">
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <div className="min-w-0">
                              <h4 className="font-black text-base text-gray-900 leading-tight truncate">{product.name}</h4>
                              {product.category_name && <p className="text-xs text-gray-500 mt-1">{product.category_name}</p>}
                            </div>
                            <p className="text-lg font-black text-[#FF4B3E] whitespace-nowrap">
                              ${formatMoney(product.price)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          {token ? (
                            canBuy ? (
                              <AddToCartButton
                                restaurantId={restaurant.id}
                                product={{
                                  ...product,
                                  available: product.available,
                                }}
                              />
                            ) : (
                              <button
                                onClick={() => navigate('/login')}
                                className="w-full rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800"
                              >
                                Inicia con cuenta de cliente para comprar
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => navigate('/login')}
                              className="w-full rounded-xl bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] px-3 py-2 text-sm font-bold text-white transition"
                            >
                              Inicia sesión para comprar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-gray-500">
                    Este restaurante aún no tiene productos disponibles
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};
