/**
 * Archivo: src/pages/RestaurantDetail.jsx
 * Detalle de un restaurante específico, incluyendo menú y horarios.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore'
import { useRestaurantDetail } from '../hooks/useRestaurantDetail'
import { Loading } from '../components/Loading'
import { AddToCartButton } from '../components/AddToCartButton'
import Footer from '../components/Footer'
import heroImage from '../assets/hero.png'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRestaurantImage } from '../hooks/useImages'

const restaurantIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: linear-gradient(135deg, #FF4B3E, #FF8A3D);
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 12px rgba(255,75,62,0.5);
    border: 3px solid white;
  ">🍽️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

// ✅ Componente definido antes de ser usado
const ProductMenuItem = ({ product, onSelect, fmt }) => (
  <div
    onClick={() => onSelect(product)}
    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
  >
    <div className="h-40 bg-gray-100 overflow-hidden">
      <img
        src={product.image || heroImage}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-4">
      <h4 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h4>
      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description || ''}</p>
      <span className="text-red-500 font-black text-base">${fmt(product.price)}</span>
    </div>
  </div>
)

export const RestaurantDetail = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = useAuthStore()
  const {
    restaurant,
    isLoading,
    error,
    clearError,
    selectedProduct,
    setSelectedProduct,
    isCurrentlyOpen,
    reviews = [],
    isReviewsLoading = false
  } = useRestaurantDetail()

  // Resolver imagen dinámica del banner superior del restaurante
  const { image: resolvedBanner } = useRestaurantImage(restaurant?.name, restaurant?.banner || restaurant?.image);

  if (isLoading) return <Loading />
  if (!restaurant) return <div className="p-20 text-center">Restaurante no encontrado</div>

  const products = Array.isArray(restaurant.products) ? restaurant.products : []
  const fmt = n => Number(n).toLocaleString('es-CO')

  // Group products by category
  const categoriesGrouped = products.reduce((acc, p) => {
    const catName = p.category_name || t('restaurant.uncategorized') || 'General';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(p);
    return acc;
  }, {});

  const lat = Number(restaurant.lat || 2.4448)
  const lng = Number(restaurant.lng || -76.6147)

  return (
    <div className="bg-white min-h-screen">
      {/* Header / Banner */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src={resolvedBanner || heroImage} 
          className="w-full h-full object-cover" 
          alt={restaurant.name} 
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <button 
              onClick={() => navigate('/restaurants')}
              className="mb-8 text-white/80 hover:text-white flex items-center gap-2 font-bold"
            >
              <i className="fas fa-arrow-left" /> Volver
            </button>
            
            <div className="max-w-2xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${isCurrentlyOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isCurrentlyOpen ? 'Abierto' : 'Cerrado'}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ {restaurant.rating || '4.5'}
                </span>
              </div>
              
              <h1 className="text-5xl font-black mb-4">{restaurant.name}</h1>

              {/* Logo circular debajo del nombre */}
              {restaurant.logo && (
                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={restaurant.logo}
                    alt={`Logo ${restaurant.name}`}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/80 shadow-lg"
                  />
                </div>
              )}

              <p className="text-lg text-white/90 mt-3">{restaurant.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Menú */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <h2 className="text-3xl font-black text-gray-900">{t('restaurant_detail.menu_title') || 'Nuestro Menú'}</h2>
              <span className="text-gray-400 font-bold">{products.length} platos</span>
            </div>

            {/* Products grouped by category */}
            {Object.keys(categoriesGrouped).map(catName => (
              <div key={catName} className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                  {catName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoriesGrouped[catName].map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="bg-white border border-gray-100 rounded-3xl p-4 flex gap-4 hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                        <img
                          src={p.image || heroImage}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          alt={p.name}
                          onError={e => { e.target.src = heroImage }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.description}</p>
                        <span className="font-black text-red-500">${fmt(p.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Reseñas Section */}
            <div className="mt-16 pt-8 border-t border-gray-100">
              <h2 className="text-3xl font-black text-gray-900 mb-2 dark:text-white">Opiniones de clientes</h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">⭐ {restaurant.rating || '4.5'}</span>
                <span className="text-sm text-gray-400">({reviews.length} calificaciones)</span>
              </div>
              
              {isReviewsLoading ? (
                <div className="py-10 text-center text-sm text-gray-400">Cargando opiniones...</div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FF4B3E]/10 flex items-center justify-center font-bold text-[#FF4B3E] text-sm">
                            {r.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm">{r.user?.name || 'Usuario'}</p>
                            <p className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-yellow-400 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={`${i < r.rating ? 'fas' : 'far'} fa-star`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment || 'Sin comentario.'}</p>
                      {r.reply && (
                        <div className="mt-3 pl-4 border-l-2 border-[#FF4B3E]/30 bg-white dark:bg-slate-950 rounded-xl p-3">
                          <p className="text-[10px] font-black text-[#FF4B3E] uppercase tracking-wider mb-1">Respuesta del restaurante</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{r.reply}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-gray-400 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                  Aún no hay opiniones para este restaurante. ¡Sé el primero en pedir y dejar una reseña!
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <aside className="space-y-8">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <h3 className="text-xl font-black mb-6">Información</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                    <i className="fas fa-map-marker-alt" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dirección</p>
                    <p className="font-bold text-gray-700">{restaurant.address || 'Popayán, Cauca'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                    <i className="fas fa-phone" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teléfono</p>
                    <p className="font-bold text-gray-700">{restaurant.phone || 'No disponible'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horario - siempre visible, lunes a domingo */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <i className="fas fa-clock text-red-500" /> Horario
              </h3>
              <div className="space-y-1">
                {(() => {
                  const days = [
                    { key: 'monday',    label: 'Lunes' },
                    { key: 'tuesday',   label: 'Martes' },
                    { key: 'wednesday', label: 'Miércoles' },
                    { key: 'thursday',  label: 'Jueves' },
                    { key: 'friday',    label: 'Viernes' },
                    { key: 'saturday',  label: 'Sábado' },
                    { key: 'sunday',    label: 'Domingo' },
                  ]
                  const jsDay = new Date().getDay()
                  const todayKey = days[jsDay === 0 ? 6 : jsDay - 1].key
                  return days.map(({ key, label }) => {
                    const day = restaurant.schedule?.[key]
                    const isToday = key === todayKey
                    const closed = !day || day.closed || (!day.open && !day.close)
                    return (
                      <div
                        key={key}
                        className={`flex justify-between items-center text-sm px-3 py-2 rounded-xl transition-colors ${
                          isToday ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className={`font-bold flex items-center gap-1.5 ${isToday ? 'text-red-500' : 'text-gray-600'}`}>
                          {isToday && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />}
                          {label}
                        </span>
                        <span className={`font-semibold text-xs ${
                          closed ? 'text-gray-300' : isToday ? 'text-red-500' : 'text-gray-700'
                        }`}>
                          {closed ? 'Cerrado' : `${day.open} – ${day.close}`}
                        </span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Mapa de ubicación */}
            <div className="bg-gray-100 rounded-3xl h-64 overflow-hidden border border-gray-200 shadow-inner relative z-10">
              {restaurant.lat && restaurant.lng ? (
                <MapContainer
                  center={[lat, lng]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                  />
                  <Marker position={[lat, lng]} icon={restaurantIcon}>
                    <Popup>{restaurant.name}</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-sm text-center px-4">
                  Este restaurante aún no ha configurado su ubicación en el mapa.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de Producto */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <i className="fas fa-times" />
            </button>
            <div className="h-64 bg-gray-100">
              <img src={selectedProduct.image || heroImage} className="w-full h-full object-cover" alt={selectedProduct.name} />
            </div>
            <div className="p-10">
              <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-black text-gray-900">{selectedProduct.name}</h3>
                  <span className="text-2xl font-black text-red-500">${fmt(selectedProduct.price)}</span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">{selectedProduct.description || 'Producto fresco preparado al momento.'}</p>
              
              {token ? (
                <AddToCartButton restaurantId={restaurant.id} product={selectedProduct} compact />
              ) : (
                <button onClick={() => navigate('/login')} className="w-full bg-red-500 text-white font-black py-4 rounded-2xl hover:bg-red-600 transition-colors">
                    Inicia sesión para pedir
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}