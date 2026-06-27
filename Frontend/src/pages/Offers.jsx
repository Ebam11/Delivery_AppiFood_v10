/**
 * Archivo: src/pages/Offers.jsx
 * Página de ofertas y platos con descuento de AppiFood.
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchJson } from '../api/fetchJson';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import Footer from '../components/Footer';
import { getPlaceholderImage, detectFoodCategory } from '../api/images';

function getProductImage(name, image) {
  if (image) return image;
  return getPlaceholderImage(detectFoodCategory(name));
}

function OfferCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-pulse">
      <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full w-1/3" />
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full w-1/2" />
      </div>
    </div>
  );
}

export default function OffersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { fetchFavorites, toggleFavorite, isFavorite } = useFavoritesStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (token) fetchFavorites(token);
  }, [token, fetchFavorites]);

  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      try {
        const data = await fetchJson('/products?has_discount=true&paginate=false');
        const items = Array.isArray(data) ? data : data.data || [];

        if (items.length > 0) {
          const offersList = items
            .filter(p => p.discount_price && p.discount_price < p.price)
            .map(p => ({
              ...p,
              oldPrice: p.price,
              price: p.discount_price,
              pct: Math.round((1 - p.discount_price / p.price) * 100),
              image: getProductImage(p.name, p.image),
            }));
          setProducts(offersList);
        } else {
          const resData = await fetchJson('/restaurants?paginate=false');
          const restaurants = Array.isArray(resData) ? resData : resData.data || [];
          const offersList = [];
          restaurants.forEach(res => {
            if (res.products) {
              res.products
                .filter(p => p.discount_price && p.discount_price < p.price)
                .forEach(p => {
                  offersList.push({
                    ...p,
                    restaurantId: res.id,
                    restaurantName: res.name,
                    oldPrice: p.price,
                    price: p.discount_price,
                    pct: Math.round((1 - p.discount_price / p.price) * 100),
                    image: getProductImage(p.name, p.image),
                  });
                });
            }
          });
          if (offersList.length === 0) {
            restaurants.forEach(res => {
              if (res.products) {
                res.products
                  .filter(p => p.is_featured)
                  .slice(0, 2)
                  .forEach(p => {
                    offersList.push({
                      ...p,
                      restaurantId: res.id,
                      restaurantName: res.name,
                      oldPrice: Math.round(p.price * 1.25),
                      pct: 20,
                      image: getProductImage(p.name, p.image),
                    });
                  });
              }
            });
          }
          setProducts(offersList);
        }
      } catch (err) {
        console.error('Error loading offers:', err);
        try {
          const resData = await fetchJson('/restaurants?paginate=false');
          const restaurants = Array.isArray(resData) ? resData : resData.data || [];
          const offersList = [];
          restaurants.forEach(res => {
            if (res.products) {
              res.products
                .filter(p => p.is_featured)
                .slice(0, 2)
                .forEach(p => {
                  offersList.push({
                    ...p,
                    restaurantId: res.id,
                    restaurantName: res.name,
                    oldPrice: Math.round(p.price * 1.25),
                    pct: 20,
                    image: getProductImage(p.name, p.image),
                  });
                });
            }
          });
          setProducts(offersList);
        } catch (e) {
          console.error('Fallback also failed:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    loadOffers();
  }, []);

  const fmt = (n) => `$${Number(n).toLocaleString('es-CO')}`;

  const handleFavoriteToggle = async (id, e) => {
    e.stopPropagation();
    if (!token) return navigate('/login');
    await toggleFavorite(id, token);
  };

  const filters = [
    { key: 'all',    icon: '🍽️', label: t('offers.all') || 'Todas' },
    { key: 'burger', icon: '🍔', label: t('offers.burgers') || 'Hamburguesas' },
    { key: 'pizza',  icon: '🍕', label: t('offers.pizzas') || 'Pizzas' },
    { key: 'sushi',  icon: '🍣', label: t('offers.sushi') || 'Sushi' },
    { key: 'pollo',  icon: '🍗', label: t('offers.chicken') || 'Pollo' },
  ];

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => (p.name || '').toLowerCase().includes(activeFilter));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Banner de Cabecera */}
        <section className="mb-10 rounded-3xl overflow-hidden relative bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 p-8 sm:p-12 text-white shadow-xl shadow-red-500/20">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/10 -mr-20 -mt-20" />
          <div className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-white/10 mb-0 -mb-10" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-bold border border-white/30 mb-4">
              <i className="fas fa-fire-alt" /> {t('home.specialDiscounts') || 'Descuentos especiales del día'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              <i className="fas fa-gift mr-1"></i> {t('home.offersTitle') || 'Ofertas del Día'}
            </h1>
            <p className="mt-3 text-white/80 max-w-xl font-medium text-lg">
              {t('home.offersSubtitle') || 'Los mejores platos con descuentos exclusivos para ti.'}
            </p>
            <div className="flex items-center gap-6 mt-6">
              <div className="text-center">
                <p className="text-3xl font-black">{products.length}+</p>
                <p className="text-white/70 text-sm">{t('offers.dishes_on_offer') || 'Platos en oferta'}</p>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <p className="text-3xl font-black">25%</p>
                <p className="text-white/70 text-sm">{t('offers.max_discount') || 'Descuento máx.'}</p>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <p className="text-3xl font-black">⏰</p>
                <p className="text-white/70 text-sm">{t('offers.today_only') || 'Solo hoy'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeFilter === f.key
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-red-300'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <OfferCardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p, idx) => (
              <div
                key={`${p.id}-${idx}`}
                onClick={() => setSelectedProduct(p)}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-gray-100 dark:border-slate-800 flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => { e.target.src = getPlaceholderImage('burger'); }}
                  />
                  {p.pct > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg animate-pulse">
                      -{p.pct}% OFF
                    </div>
                  )}
                  <button
                    onClick={(e) => handleFavoriteToggle(p.restaurantId || p.restaurant_id, e)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-sm
                      ${isFavorite(p.restaurantId || p.restaurant_id)
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-white/90 dark:bg-slate-900/90 text-gray-400 hover:text-red-500'}`}
                  >
                    <i className={`${isFavorite(p.restaurantId || p.restaurant_id) ? 'fas' : 'far'} fa-heart text-sm`} />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  {p.restaurantName && (
                    <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest mb-1">
                      🏪 {p.restaurantName}
                    </p>
                  )}
                  <h3 className="font-black text-gray-900 dark:text-white text-lg mb-1 leading-tight line-clamp-2" title={p.name}>
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="text-gray-500 dark:text-slate-400 text-sm line-clamp-2 mb-3">{p.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-800">
                    <div>
                      <span className="block text-xl font-black text-gray-900 dark:text-white">{fmt(p.price)}</span>
                      {p.oldPrice && p.oldPrice > p.price && (
                        <span className="text-gray-400 dark:text-slate-500 text-xs line-through">{fmt(p.oldPrice)}</span>
                      )}
                    </div>
                    <button className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-red-500/30">
                      <i className="fas fa-plus" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
            <div className="text-7xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              {t('offers.no_offers') || 'No hay ofertas disponibles'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">{t('offers.no_offers_hint') || 'Vuelve más tarde para ver promociones increíbles.'}</p>
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-red-500 text-white font-bold px-8 py-3 rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
            >
              {t('offers.view_restaurants') || 'Ver Restaurantes'}
            </button>
          </div>
        )}
      </main>

      <Footer />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}