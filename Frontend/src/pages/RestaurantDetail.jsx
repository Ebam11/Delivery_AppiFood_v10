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
import { getPlaceholderImage, detectFoodCategory } from '../api/images'

const restaurantIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: linear-gradient(135deg, #FF4B3E, #FF8A3D);
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 12px rgba(255,75,62,0.5);
    border: 3px solid white;
  "><i class="fas fa-utensils"></i></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

// Componente definido antes de ser usado
const ProductMenuItem = ({ product, onSelect, fmt }) => (
  <div
    onClick={() => onSelect(product)}
    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
  >
    <div className="h-40 bg-gray-100 dark:bg-slate-800 overflow-hidden">
      <img
        src={product.image || product.img || getPlaceholderImage(detectFoodCategory(product.name))}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={e => {
          e.target.src = getPlaceholderImage(detectFoodCategory(product.name));
        }}
      />
    </div>
    <div className="p-4">
      <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{product.name}</h4>
      <p className="text-xs text-gray-400 dark:text-slate-400 line-clamp-2 mb-3">{product.description || ''}</p>
      <span className="text-red-500 font-black text-base">${fmt(product.price)}</span>
    </div>
  </div>
)

export const RestaurantDetail = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token, user } = useAuthStore()
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

  const [rateableOrders, setRateableOrders] = useState([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [localReviews, setLocalReviews] = useState([])

  // Sincronizar opiniones locales para actualización reactiva al publicar
  useEffect(() => {
    if (reviews) {
      setLocalReviews(reviews)
    }
  }, [reviews])

  // Ocultar Header y Footer dinámicamente si es Modo Previsualización (por query o por rol de restaurante)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const isPreviewMode = queryParams.get('preview') === 'true' || user?.role === 'restaurant';

    if (isPreviewMode) {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
    }

    return () => {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, [location.search, user]);

  // Obtener pedidos del usuario para ver si puede dejar reseña
  useEffect(() => {
    if (token && restaurant?.id) {
      const fetchOrders = async () => {
        try {
          // fetchJson utiliza por debajo axios y resuelve la ruta relativa correctamente
          const res = await fetchJson('/orders')
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
          // Filtrar entregados de este restaurante y que no tengan ya una reseña asignada
          const filtered = list.filter(o => {
            const isDelivered = o.status === 'delivered';
            const isThisRestaurant = String(o.restaurant_id) === String(restaurant.id) || String(o.restaurant?.id) === String(restaurant.id);
            const hasReview = o.review !== null && o.review !== undefined;
            return isDelivered && isThisRestaurant && !hasReview;
          });
          setRateableOrders(filtered)
          if (filtered.length > 0 && !selectedOrderId) {
            setSelectedOrderId(String(filtered[0].id))
          }
        } catch (e) {
          console.error("Error cargando pedidos para reseñas:", e)
        }
      }
      fetchOrders()
    }
  }, [token, restaurant, localReviews])

  const submitReview = async (e) => {
    e.preventDefault()
    if (!selectedOrderId) return

    // Filtro de moderación de contenido en el cliente
    const badWords = [
      'puta', 'puto', 'mierda', 'pendejo', 'pendeja', 'idiota', 'estupido', 'estúpido', 'estupida', 'estúpida',
      'imbecil', 'imbécil', 'cabron', 'cabrón', 'maricon', 'maricón', 'malparido', 'gonorrea', 'hijueputa',
      'pirobo', 'carechimba', 'perra', 'zorra', 'bastardo', 'culero', 'chinga', 'verga', 'pene', 'culo',
      'matar', 'muerte', 'amenaza', 'golpear', 'sangre', 'asqueroso', 'basura', 'groseria', 'grosería'
    ];

    const textToCheck = reviewComment.toLowerCase();
    const containsBadWords = badWords.some(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'i');
      return regex.test(textToCheck);
    });

    if (containsBadWords) {
      setReviewError('Tu comentario contiene palabras que no cumplen con nuestras normas de convivencia. Por favor, sé respetuoso con los establecimientos y sus trabajadores.');
      return;
    }

    try {
      setSubmittingReview(true)
      setReviewError('')
      const res = await fetchJson('/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: Number(selectedOrderId),
          rating: Number(reviewRating),
          comment: reviewComment
        })
      })

      if (res && (res.data || res.id)) {
        const newReview = res.data || res
        setLocalReviews(prev => [newReview, ...prev])
        setReviewComment('')
        setRateableOrders(prev => prev.filter(o => String(o.id) !== String(selectedOrderId)))
        setSelectedOrderId('')
        alert('¡Gracias por tu opinión! Tu reseña ha sido publicada con éxito.')
      } else {
        setReviewError(res?.message || 'No se pudo publicar la reseña.')
      }
    } catch (err) {
      setReviewError(err?.message || 'Error al intentar publicar la reseña.')
    } finally {
      setSubmittingReview(false)
    }
  }

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
    <div className="bg-white dark:bg-slate-950 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header / Banner */}
      <div className="relative h-[400px] overflow-hidden bg-gradient-to-r from-slate-950 via-red-950 to-slate-950 flex items-center">
        {resolvedBanner && (
          <img 
            src={resolvedBanner} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt={restaurant.name} 
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            {/* Botón Volver Inteligente para Previsualización */}
            {(() => {
              const queryParams = new URLSearchParams(location.search);
              const isPreviewMode = queryParams.get('preview') === 'true' || user?.role === 'restaurant';
              
              const handleClose = () => {
                if (isPreviewMode) {
                  window.close();
                  // Fallback si la pestaña no se abrió con target_blank y el navegador bloquea window.close()
                  setTimeout(() => {
                    navigate('/restaurant/dashboard');
                  }, 100);
                } else {
                  navigate('/restaurants');
                }
              };

              return (
                <button 
                  onClick={handleClose}
                  className={`mb-6 text-white flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl transition ${isPreviewMode ? 'bg-[#FF4B3E] hover:bg-red-600 shadow-lg hover:shadow-red-500/20' : 'bg-white/10 backdrop-blur-md hover:bg-white/20'}`}
                >
                  <i className={isPreviewMode ? "fas fa-times-circle" : "fas fa-arrow-left"} /> 
                  {isPreviewMode ? 'Cerrar Previsualización' : 'Volver'}
                </button>
              );
            })()}
            
            <div className="max-w-2xl text-white flex flex-col md:flex-row items-start md:items-center gap-6 mt-4">
              {/* Logo circular flotante (Imagen o Fallback de Iniciales con Gradiente Premium) */}
              <div className="flex-shrink-0">
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo}
                    alt={`Logo ${restaurant.name}`}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white/90 shadow-2xl bg-white"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center border-4 border-white/90 shadow-2xl text-4xl font-black text-white uppercase select-none">
                    {restaurant.name?.charAt(0) || 'R'}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${isCurrentlyOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isCurrentlyOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                    <i className="fas fa-star mr-1"></i> {restaurant.rating || '4.5'}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{restaurant.name}</h1>
                <p className="text-white/80 text-sm md:text-base mt-2 line-clamp-2 max-w-xl">{restaurant.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Menú */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8 pb-4 border-b dark:border-slate-800">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">{t('restaurant_detail.menu_title') || 'Nuestro Menú'}</h2>
              <span className="text-gray-400 dark:text-slate-500 font-bold">{products.length} platos</span>
            </div>

            {/* Products grouped by category */}
            {Object.keys(categoriesGrouped).map(catName => (
              <div key={catName} className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-4 capitalize flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                  {catName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoriesGrouped[catName].map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="bg-white dark:bg-slate-950 border border-gray-105 dark:border-slate-800 rounded-3xl p-4 flex gap-4 hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-800">
                        <img
                          src={p.image || getPlaceholderImage(detectFoodCategory(p.name))}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          alt={p.name}
                          onError={e => { e.target.src = heroImage }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{p.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-2">{p.description}</p>
                        <span className="font-black text-red-500">${fmt(p.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Reseñas Section */}
            <div className="mt-16 pt-8 border-t border-gray-100 dark:border-slate-800">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Opiniones de clientes</h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200"><i className="fas fa-star mr-1"></i> {restaurant.rating || '4.5'}</span>
                <span className="text-sm text-gray-400">({localReviews.length} calificaciones)</span>
              </div>
              
              {/* Formulario de Reseña (Solo para usuarios con pedidos entregados elegibles) */}
              {token && rateableOrders.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl mb-8 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¡Tu opinión nos importa!</h3>
                  <p className="text-xs text-gray-500 mb-4">Tienes pedidos completados de este restaurante disponibles para reseñar. Por favor, deja tu calificación:</p>
                  
                  <form onSubmit={submitReview} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Selecciona el Pedido *</label>
                        <select 
                          value={selectedOrderId}
                          onChange={e => setSelectedOrderId(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-2.5 rounded-xl text-xs outline-none"
                          required
                        >
                          {rateableOrders.map(o => (
                            <option key={o.id} value={o.id}>
                              Pedido #{o.id} - {new Date(o.created_at || Date.now()).toLocaleDateString()} (${Number(o.total || 0).toLocaleString('es-CO')})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Calificación *</label>
                        <div className="flex gap-1 text-2xl text-yellow-400 py-1 cursor-pointer">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i 
                              key={i} 
                              onClick={() => setReviewRating(i + 1)}
                              className={`${i < reviewRating ? 'fas' : 'far'} fa-star hover:scale-110 transition-transform`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Comentario (Ayúdanos a mejorar) *</label>
                      <textarea
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Comparte tu experiencia... (Sé respetuoso, evita palabras groseras o ataques personales)"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-xl text-xs outline-none focus:border-red-500 min-h-[80px]"
                        maxLength={500}
                        required
                      />
                    </div>

                    {reviewError && (
                      <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                        {reviewError}
                      </p>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
                      >
                        {submittingReview ? 'Enviando...' : 'Publicar Reseña'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {isReviewsLoading ? (
                <div className="py-10 text-center text-sm text-gray-400">Cargando opiniones...</div>
              ) : localReviews.length > 0 ? (
                <div className="space-y-6">
                  {localReviews.map(r => (
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
                        {/* Sidebar Info */}
          <aside className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xl font-black mb-6 text-gray-950 dark:text-white">Información</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-red-500 shadow-sm border dark:border-slate-700">
                    <i className="fas fa-map-marker-alt" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dirección</p>
                    <p className="font-bold text-gray-700 dark:text-slate-300">{restaurant.address || 'Popayán, Cauca'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-red-500 shadow-sm border dark:border-slate-700">
                    <i className="fas fa-phone" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teléfono</p>
                    <p className="font-bold text-gray-700 dark:text-slate-300">{restaurant.phone || 'No disponible'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horario - siempre visible, lunes a domingo */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-gray-950 dark:text-white">
                <i className="fas fa-clock text-red-500" /> Horario
              </h3>ck text-red-500" /> Horario
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
                    const day = Array.isArray(restaurant.schedules)
                      ? restaurant.schedules.find(s => s.day?.toLowerCase() === key)
                      : null
                    const isToday = key === todayKey
                    const closed = !day || day.is_closed || (!day.opening_time && !day.closing_time)
                    return (
                      <div
                        key={key}
                        className={`flex justify-between items-center text-sm px-3 py-2 rounded-xl transition-colors ${
                          isToday ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 font-bold' : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className={`flex items-center gap-1.5 ${isToday ? 'text-red-500 font-bold' : 'text-gray-650 dark:text-slate-350 font-medium'}`}>
                          {isToday && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />}
                          {label}
                        </span>
                        <span className={`font-black text-xs ${
                          closed ? 'text-red-500/70' : isToday ? 'text-red-500' : 'text-gray-700 dark:text-slate-300'
                        }`}>
                          {closed ? 'Cerrado' : `${day.opening_time.slice(0, 5)} – ${day.closing_time.slice(0, 5)}`}
                        </span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Mapa de ubicación */}
            <div className="bg-gray-100 dark:bg-slate-900 rounded-3xl h-64 overflow-hidden border border-gray-250 dark:border-slate-850 shadow-inner relative z-10">
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
          <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative border dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <i className="fas fa-times" />
            </button>
            <div className="h-64 bg-gray-100 dark:bg-slate-800">
              <img src={selectedProduct.image || getPlaceholderImage(detectFoodCategory(selectedProduct.name))} className="w-full h-full object-cover" alt={selectedProduct.name} />
            </div>
            <div className="p-10">
              <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">{selectedProduct.name}</h3>
                  <span className="text-2xl font-black text-red-500">${fmt(selectedProduct.price)}</span>
              </div>
              <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-8">{selectedProduct.description || 'Producto fresco preparado al momento.'}</p>
              
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