// Archivo: src/pages/RestaurantDetail.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantStore } from '../store/restaurantStore';
import { useAuthStore } from '../store/authStore';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { AddToCartButton } from '../components/AddToCartButton';
import Footer from '../components/Footer';
import { MOCK_RESTAURANTS } from '../data/mockRestaurants';
import heroImage from '../assets/hero.png';

const formatMenuSectionTitle = (value = '') => {
  const normalized = String(value).replace(/[_-]+/g, ' ').trim()
  if (!normalized) return 'Sección'

  const specialLabels = {
    burgers: 'Burgers',
    burger: 'Burgers',
    pizza: 'Pizzas',
    sushi: 'Sushi',
    tacos: 'Tacos',
    asian: 'Asiática',
    vegan: 'Saludable',
    seafood: 'Mariscos',
    chicken: 'Pollo',
    coffee: 'Café y desayunos',
    bebidas: 'Bebidas',
    postres: 'Postres',
    entradas: 'Entradas',
    combos: 'Combos',
    ofertas: 'Ofertas',
    otros: 'Otros',
  }

  const lower = normalized.toLowerCase()
  return specialLabels[lower] || normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const {
    selectedRestaurant,
    isLoading,
    error,
    fetchRestaurantById,
    clearError,
  } = useRestaurantStore();

  const fallbackRestaurant = useMemo(() => {
    const fromState = location.state?.restaurant;
    if (fromState?.id) return fromState;

    const fromMock = MOCK_RESTAURANTS.find((restaurant) => String(restaurant.id) === String(id));
    return fromMock || null;
  }, [id, location.state]);

  useEffect(() => {
    if (fallbackRestaurant && fallbackRestaurant.id) {
      return;
    }

    fetchRestaurantById(id).catch(() => {});
  }, [id, fallbackRestaurant, fetchRestaurantById]);

  if (isLoading) return <Loading />;

  const restaurant = selectedRestaurant?.data || selectedRestaurant || fallbackRestaurant;
  if (!restaurant) {
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

  const coverImage = restaurant.banner || restaurant.image || restaurant.logo || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop';
  const menuCategories = Array.isArray(restaurant.menu_categories) ? restaurant.menu_categories : [];
  const products = Array.isArray(restaurant.products) ? restaurant.products : [];
  const todaySchedule = restaurant.today_schedule || null;
  const authToken = token || localStorage.getItem('token');
  const locationQuery = encodeURIComponent(
    restaurant.address
      || restaurant.location
      || `${restaurant.name}, Popayán, Cauca`,
  );
  const mapUrl = `https://www.google.com/maps?q=${locationQuery}&output=embed`;
  const deliveryTimeLabel = restaurant.delivery_time_min && restaurant.delivery_time_max
    ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max} min`
    : restaurant.delivery_time_min
      ? `${restaurant.delivery_time_min} min`
      : restaurant.delivery_time || 'No disponible';

  const localDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const localTodayName = localDays[new Date().getDay()];
  const allSchedules = Array.isArray(restaurant.schedules) ? restaurant.schedules : [];
  const localTodaySchedule = allSchedules.find(s => s.day === localTodayName) || todaySchedule;
  const backendOpenFlag = (() => {
    if (typeof restaurant?.isOpen === 'boolean') return restaurant.isOpen
    if (restaurant?.isOpen === 1) return true
    if (restaurant?.isOpen === 0) return false
    if (typeof restaurant?.is_open === 'boolean') return restaurant.is_open
    if (restaurant?.is_open === 1) return true
    if (restaurant?.is_open === 0) return false
    return undefined
  })()

  let isCurrentlyOpen = restaurant.isOpen !== false;
  if (backendOpenFlag !== undefined) {
    isCurrentlyOpen = backendOpenFlag
  } else if (localTodaySchedule) {
    if (localTodaySchedule.is_closed) {
      isCurrentlyOpen = false;
    } else {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const openTime = localTodaySchedule.opening_time?.slice(0, 5) || '00:00';
      const closeTime = localTodaySchedule.closing_time?.slice(0, 5) || '23:59';
      isCurrentlyOpen = currentTime >= openTime && currentTime <= closeTime;
    }
  } else {
    // Si no hay horario local definido, usamos is_active como base
    isCurrentlyOpen = restaurant.is_active !== false;
  }

  const dayTranslations = {
    monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
    thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
  };

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProduct]);

  return (
    <div className="page-restaurant-detail min-h-screen bg-gradient-to-b from-[#fff7f4] to-white">
      <div className="relative h-[320px] md:h-[420px] overflow-hidden">
        <img
          src={coverImage}
          alt={restaurant.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-between px-4 py-5 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4 text-white">
            <button
              onClick={() => navigate('/restaurants')}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25 transition"
            >
              {t('restaurant_detail.back')}
            </button>

            {localTodaySchedule ? (
              <div className={`rounded-full px-4 py-2 text-sm font-bold shadow-lg ${isCurrentlyOpen ? 'bg-emerald-500/90' : 'bg-red-500/90'}`}>
                {isCurrentlyOpen ? 'Abierto ahora' : 'Cerrado ahora'}
              </div>
            ) : null}
          </div>

          <div className="max-w-3xl text-white">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#FF4B3E] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                Restaurante
              </span>
              {restaurant.rating ? (
                <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                  ⭐ {restaurant.rating} · {restaurant.total_reviews || 0} {t('restaurant_detail.reviews')}
                </span>
              ) : null}
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">{restaurant.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
              {restaurant.description || 'Información del restaurante no disponible todavía.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={t('restaurant_detail.error_loading')} onDismiss={clearError} />
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(360px,0.9fr)]">
          <div className="space-y-8">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                <div className="rounded-2xl bg-[#fff5f3] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF4B3E]">Tiempo estimado</p>
                  <p className="mt-2 text-lg font-black text-gray-900">{deliveryTimeLabel}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Costo de envío</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">${Number(restaurant.delivery_cost || 0).toLocaleString('es-CO')}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Pedido mínimo</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">${Number(restaurant.minimum_order || 0).toLocaleString('es-CO')}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Estado</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{restaurant.isOpen === false ? 'Cerrado' : 'Disponible'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-gray-900">{t('restaurant_detail.menu_title')}</h2>
                <span className="text-sm text-gray-500">{products.length} productos</span>
              </div>

              {products.length > 0 ? (() => {
                const grouped = products.reduce((acc, p) => {
                  const cat = (p.category || 'otros').toString().toLowerCase()
                  if (!acc[cat]) acc[cat] = []
                  acc[cat].push(p)
                  return acc
                }, {})

                const preferred = ['ofertas', 'combos', 'entradas', 'burger', 'pizza', 'sushi', 'tacos', 'asian', 'vegan', 'seafood', 'chicken', 'coffee', 'bebidas', 'postres', 'otros']
                const orderedCats = [
                  ...preferred.filter(c => grouped[c]),
                  ...Object.keys(grouped).filter(c => !preferred.includes(c))
                ]

                return (
                  <div className="space-y-6">
                    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                      {orderedCats.map(cat => (
                        <button key={cat} onClick={() => document.getElementById(`section-${cat}`)?.scrollIntoView({ behavior:'smooth', block:'start' })}
                          className="rounded-full border border-[#ffd5cf] bg-white px-4 py-2 text-xs font-bold text-[#FF4B3E] shadow-sm transition hover:bg-[#fff5f3]">
                          {formatMenuSectionTitle(cat)}
                        </button>
                      ))}
                    </div>

                    {orderedCats.map(cat => (
                      <section key={cat} id={`section-${cat}`} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#fff7f5] to-white px-5 py-4">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF4B3E]">Sección</p>
                            <h3 className="mt-1 text-lg font-black text-gray-900">{formatMenuSectionTitle(cat)}</h3>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm ring-1 ring-gray-100">
                            {grouped[cat].length} items
                          </span>
                        </div>
                        <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                          {grouped[cat].map(product => (
                            <button key={product.id} type="button" onClick={() => setSelectedProduct(product)}
                              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                              <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
                                <img src={product.image || heroImage} alt={product.name}
                                  onError={(e)=>{ e.currentTarget.src = heroImage }} className="h-full w-full object-cover" />
                              </div>
                              <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                                <div className="flex items-start justify-between gap-3">
                                  <h3 className="text-base font-bold leading-snug text-gray-900">{product.name}</h3>
                                  <span className="whitespace-nowrap text-base font-black text-[#FF4B3E]">${Number(product.price || 0).toLocaleString('es-CO')}</span>
                                </div>
                                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{product.available !== false ? t('restaurant_detail.available') : 'No disponible'}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )
              })() : (
                <div className="rounded-2xl bg-gray-50 p-8 text-center">
                  <p className="text-lg text-gray-600">{t('restaurant_detail.no_products')}</p>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 self-start">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-7">
              <h2 className="text-xl font-black text-gray-900">Información</h2>
              <div className="mt-5 space-y-4 text-sm text-gray-700">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Dirección</p>
                  <p className="mt-1 font-medium">{restaurant.address || 'Sin dirección registrada'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Teléfono</p>
                  <p className="mt-1 font-medium">{restaurant.phone || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Correo</p>
                  <p className="mt-1 font-medium">{restaurant.email || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Portada</p>
                  <p className="mt-1 font-medium">{restaurant.banner || restaurant.logo ? 'Disponible' : 'Sin imagen de portada'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-gray-900">Ubicación</h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${locationQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold uppercase tracking-widest text-[#FF4B3E] hover:underline"
                >
                  Abrir en Maps
                </a>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100">
                <div className="aspect-[4/3] w-full">
                  <iframe
                    title={`Mapa de ${restaurant.name}`}
                    src={mapUrl}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {restaurant.address || `${restaurant.name}, Popayán, Cauca`}
              </p>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-7">
              <h2 className="text-xl font-black text-gray-900">Horarios de Apertura y Cierre</h2>
              {allSchedules.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((dayKey) => {
                    const daySchedule = allSchedules.find(s => s.day === dayKey);
                    if (!daySchedule || daySchedule.is_closed) return null;
                    
                    const isToday = dayKey === localTodayName;

                    return (
                      <div key={dayKey} className="flex justify-between items-center text-[14px]">
                        <span className={`capitalize ${isToday ? 'font-bold text-[#FF4B3E]' : 'text-gray-600'}`}>
                          {dayTranslations[dayKey] || dayKey}
                          {isToday && " (Hoy)"}
                        </span>
                        <span className={`font-medium ${isToday ? 'text-gray-900' : 'text-gray-800'}`}>
                          {daySchedule.opening_time?.slice(0, 5)} - {daySchedule.closing_time?.slice(0, 5)}
                        </span>
                      </div>
                    );
                  })}
                  
                  <div className="pt-4 mt-2 border-t border-gray-100">
                    <p className={`text-sm font-semibold ${isCurrentlyOpen ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isCurrentlyOpen ? 'Abierto en este momento' : 'Cerrado en este momento'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No hay horario configurado aún.</p>
              )}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-7">
              <h2 className="text-xl font-black text-gray-900">Categorías</h2>
              {menuCategories.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {menuCategories.map((category) => (
                    <span key={category.id || category.name} className="rounded-full bg-[#fff5f3] px-3 py-2 text-xs font-bold text-[#FF4B3E]">
                      {category.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No hay categorías visibles aún.</p>
              )}
            </section>
          </aside>
        </div>
      </div>

      {selectedProduct ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct.name}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
            >
              ✕
            </button>

            <div className="aspect-[16/9] w-full bg-gray-100">
              <img
                src={selectedProduct.image || heroImage}
                alt={selectedProduct.name}
                onError={(event) => {
                  event.currentTarget.src = heroImage;
                }}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF4B3E]">Producto</p>
                  <h3 className="mt-2 text-2xl font-black text-gray-900">{selectedProduct.name}</h3>
                </div>
                <span className="whitespace-nowrap text-2xl font-black text-[#FF4B3E]">
                  ${Number(selectedProduct.price || 0).toLocaleString('es-CO')}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
                {selectedProduct.description || 'Producto disponible del menú del restaurante.'}
              </p>

              <div className="mt-6 rounded-2xl bg-gray-50 p-4 md:p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Incluye</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {selectedProduct.description || 'Puedes revisar los detalles del producto antes de agregarlo al carrito.'}
                </p>
              </div>

              <div className="mt-6">
                {authToken ? (
                  <AddToCartButton restaurantId={restaurant.id} product={selectedProduct} compact />
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full rounded-xl bg-[#FF4B3E] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e03a2d]"
                  >
                    {t('restaurant_detail.login_to_buy')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Footer restaurants={MOCK_RESTAURANTS} />
    </div>
  );
};