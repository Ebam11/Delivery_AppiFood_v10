/**
 * Archivo: src/pages/Offers.jsx
 * Página de ofertas y platos con descuento de AppiFood.
 * Carga dinámicamente los platos en promoción de todos los restaurantes.
 */
import React, { useState, useEffect } from 'react';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { fetchJson } from '../api/fetchJson';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/layout/LoadingScreen';
import ProductModal from '../components/ProductModal';
import Footer from '../components/Footer';

export default function OffersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { fetchFavorites, toggleFavorite, isFavorite } = useFavoritesStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (token) fetchFavorites(token);
  }, [token, fetchFavorites]);

  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      try {
        const data = await fetchJson('/restaurants');
        const items = Array.isArray(data) ? data : data.data || [];
        
        const offersList = [];
        items.forEach(res => {
          if (res.products && res.products.length > 0) {
            res.products.forEach(p => {
              // Todos los productos tienen un descuento simulado del 20%
              offersList.push({
                ...p,
                restaurantId: res.id,
                restaurantName: res.name,
                oldPrice: p.price * 1.25,
                pct: 20
              });
            });
          }
        });
        setProducts(offersList);
      } catch (err) {
        console.error('Error loading offers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOffers();
  }, []);

  const fmt = (n) => Number(n).toLocaleString('es-CO');

  const handleFavoriteToggle = async (id, e) => {
    e.stopPropagation();
    if (!token) return navigate('/login');
    await toggleFavorite(id, token);
  };

  if (loading) {
    return <LoadingScreen message={t('home.loading_offers', { defaultValue: 'Cargando ofertas del día...' })} />;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Banner de Cabecera */}
        <section className="mb-12 rounded-3xl border border-red-100 dark:border-slate-800 bg-gradient-to-r from-[#fff3ef] dark:from-slate-900/40 to-[#fffaf8] dark:to-slate-900/10 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full -mr-16 -mt-16" />
          <span className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-[#FF4B3E] border border-red-100 dark:border-slate-800">
            <i className="fas fa-tag" /> {t('home.specialDiscounts') || 'Descuentos especiales'}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
            {t('home.offersTitle') || 'Ofertas del Día'}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-slate-400 max-w-2xl font-medium">
            {t('home.offersSubtitle') || 'Los mejores platos con descuentos exclusivos para ti.'}
          </p>
        </section>

        {/* Listado de Platos en Oferta */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, idx) => (
              <div 
                key={`${p.id}-${idx}`}
                onClick={() => setSelectedProduct(p)}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-transparent dark:border-slate-800 flex flex-col h-full"
              >
                {/* Imagen del Producto */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={p.image || '/images/placeholder.png'} 
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop' }}
                  />
                  
                  {/* Badge de Descuento */}
                  {p.pct && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg">
                      -{p.pct}%
                    </div>
                  )}

                  {/* Botón Favorito */}
                  <button 
                    onClick={(e) => handleFavoriteToggle(p.restaurantId, e)}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md
                      ${isFavorite(p.restaurantId) ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <i className={`${isFavorite(p.restaurantId) ? 'fas' : 'far'} fa-heart`} />
                  </button>
                </div>

                {/* Info del Producto */}
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-red-500 font-bold text-[10px] uppercase tracking-wider mb-1">
                    {p.restaurantName}
                  </p>
                  <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2 truncate" title={p.name}>
                    {p.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div>
                      <span className="block text-xl font-black text-gray-900 dark:text-white">${fmt(p.price)}</span>
                      {p.oldPrice && (
                        <span className="text-gray-400 dark:text-slate-500 text-xs line-through">${fmt(p.oldPrice)}</span>
                      )}
                    </div>
                    
                    <button className="w-10 h-10 rounded-2xl bg-gray-900 dark:bg-slate-800 text-white flex items-center justify-center hover:bg-red-500 dark:hover:bg-red-500 transition-colors shadow-lg">
                      <i className="fas fa-plus" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('home.no_offers') || 'No hay ofertas disponibles en este momento'}</h3>
            <p className="text-gray-500 dark:text-slate-400">{t('home.no_offers_hint') || 'Vuelve más tarde para ver promociones.'}</p>
          </div>
        )}
      </main>

      <Footer />

      {/* Modal del Producto */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
