// Archivo: src/pages/Home.jsx | Comentario: logica principal del modulo.
// src/pages/HomePage.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductModal from '../components/ProductModal'
import RestaurantCard from '../components/RestaurantCard'
import Footer from '../components/Footer'
import { useFavoritesStore } from '../store/favoritesStore'
import { useAuthStore } from '../store/authStore'
import { fetchJson } from '../api/fetchJson'
import { MOCK_RESTAURANTS } from '../data/mockRestaurants'

const STATIC_RESTAURANTS = []

const normalizeRestaurant = (restaurant, index = 0) => {
  const fallback = MOCK_RESTAURANTS[index % MOCK_RESTAURANTS.length] || {}
  const categories = Array.isArray(restaurant.categories) ? restaurant.categories : []
  const menuCategories = Array.isArray(restaurant.menu_categories) ? restaurant.menu_categories : []
  const products = Array.isArray(restaurant.products) ? restaurant.products : []
  
  const formatDeliveryTime = () => {
    if (restaurant.delivery_time_min && restaurant.delivery_time_max) {
      return `${restaurant.delivery_time_min}-${restaurant.delivery_time_max}`
    }
    if (restaurant.delivery_time_min) {
      return `${restaurant.delivery_time_min}`
    }
    if (restaurant.time) {
      return restaurant.time
    }
    return fallback.time || '-- min'
  }

  return {
    ...restaurant,
    img: restaurant.banner || restaurant.logo || restaurant.image || fallback.img || '',
    rating: Number((Number(restaurant.average_rating ?? restaurant.rating ?? fallback.rating ?? 4.5)).toFixed(1)),
    time: formatDeliveryTime(),
    delivery: Number(restaurant.delivery_cost ?? restaurant.delivery ?? fallback.delivery ?? 3500),
    products,
    menu_categories: menuCategories,
  }
}

const STATIC_PRODUCTS = []  // Será reemplazado con datos reales de la API

const CATEGORIES = [
  { key:'all', label:'Todos' },
  { key:'burger', label:'Burger' },
  { key:'chicken', label:'Chicken' },
  { key:'pizza', label:'Pizza' },
  { key:'pasta', label:'Pasta' },
]

const fmt = n => Number(n).toLocaleString('es-CO')

const S = {
  /* ── colores ── */
  red:    '#FF4B3E',
  redDk:  '#e03a2d',
  dark:   '#1a1a1a',

  /* ── secciones ── */
  section: { padding: '0', width: '100%' },
  wrap:    { width: '100%', paddingLeft: 'clamp(1rem, 5vw, 2rem)', paddingRight: 'clamp(1rem, 5vw, 2rem)' },

  /* ── héroe ── */
  hero: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg,#1a1a1a 0%,#2d1515 50%,#3d1a00 100%)',
  },
  heroBg: {
    position:'absolute', inset:0,
    backgroundImage: 'url(/images/hero-bg.jpg)',
    backgroundSize:'cover', backgroundPosition:'center',
    opacity: 0.15,
  },

  /* ── botones ── */
  btnRed: {
    display:'inline-flex', alignItems:'center', gap:8,
    padding:'12px 24px', background:'#FF4B3E', color:'white',
    borderRadius:999, fontWeight:700, border:'none', cursor:'pointer',
    textDecoration:'none', fontSize:14, transition:'background 0.2s',
  },
  btnOutline: {
    display:'inline-flex', alignItems:'center', gap:8,
    padding:'10px 22px', background:'transparent', color:'white',
    border:'2px solid white', borderRadius:999,
    fontWeight:700, cursor:'pointer', textDecoration:'none',
    fontSize:14, transition:'all 0.2s',
  },

  /* ── pills de categoría ── */
  pillActive: {
    padding:'6px 16px', borderRadius:999,
    background:'#FF4B3E', color:'white',
    fontWeight:700, fontSize:13, border:'none', cursor:'pointer',
  },
  pillInactive: {
    padding:'6px 16px', borderRadius:999,
    background:'white', color:'#555',
    fontWeight:600, fontSize:13,
    border:'1.5px solid #e5e5e5', cursor:'pointer',
  },
}

export default function HomePage({ isAuth }) {
  const {
    stats = { restaurants:'6+', avg_delivery:'25 min', avg_rating:'4.8' },
  } = {}

  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { fetchFavorites, toggleFavorite, isFavorite } = useFavoritesStore()
  
  // Estado para restaurantes y productos
  const [popularRestaurants, setPopularRestaurants] = useState(() =>
    MOCK_RESTAURANTS.slice(0, 8).map((restaurant, idx) => normalizeRestaurant(restaurant, idx))
  )
  const [loadingRestaurants, setLoadingRestaurants] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState(() => {
    const items = []
    MOCK_RESTAURANTS.forEach((restaurant) => {
      if (Array.isArray(restaurant.products)) {
        restaurant.products.slice(0, 2).forEach((product) => {
          items.push({
            ...product,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            oldPrice: product.price * 1.3,
            pct: 15,
          })
        })
      }
    })
    return items.slice(0, 12)
  })
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Cargar restaurantes y productos del servidor
  useEffect(() => {
    if (!token) return

    const loadRestaurants = async () => {
      try {
        const data = await fetchJson('/restaurants')
        const restaurantsArray = Array.isArray(data) ? data : data.data || data.restaurants || []
        
        if (restaurantsArray.length > 0) {
          const enriched = restaurantsArray.slice(0, 8).map((restaurant, idx) =>
            normalizeRestaurant(restaurant, idx)
          )
          setPopularRestaurants(enriched)
        } else {
          setPopularRestaurants(MOCK_RESTAURANTS.slice(0, 4))
        }
      } catch (err) {
        console.error('Error cargando restaurantes:', err)
        setPopularRestaurants(MOCK_RESTAURANTS.slice(0, 4))
      }
    }
    
    loadRestaurants()
  }, [token])

  // Cargar productos destacados desde los restaurantes
  useEffect(() => {
    if (!token) return

    const loadProducts = async () => {
      try {
        const data = await fetchJson('/restaurants')
        const restaurantsArray = Array.isArray(data) ? data : data.data || data.restaurants || []
        
        if (restaurantsArray.length > 0) {
          // Extraer productos de todos los restaurantes
          const allProducts = []
          restaurantsArray.forEach((restaurant) => {
            if (Array.isArray(restaurant.products) && restaurant.products.length > 0) {
              restaurant.products.slice(0, 3).forEach((product) => {
                allProducts.push({
                  ...product,
                  restaurantId: restaurant.id,
                  restaurantName: restaurant.name,
                  // Calcular descuento ficticio para algunos
                  oldPrice: product.price * 1.3,
                  pct: 15,
                })
              })
            }
          })
          
          // Limitar a 12 productos destacados
          setFeaturedProducts(allProducts.slice(0, 12))
        }
      } catch (err) {
        console.error('Error cargando productos:', err)
      }
    }
    
    loadProducts()
  }, [token])
  
  // Cargar favoritos al montar
  useEffect(() => {
    if (token) {
      fetchFavorites(token)
    }
  }, [token, fetchFavorites])
  
  const handleRestaurantSelect = (restaurant) => {
    navigate(`/restaurants/${restaurant.id}`)
  }
  
  const handleFavoriteToggle = async (restaurantId) => {
    if (!token) {
      navigate('/login')
      return
    }
    await toggleFavorite(restaurantId, token)
  }
  
  // Carrusel de hero
  const heroSlides = [
    {
      title: 'HOT SPICY\nCHICKEN BURGER',
      subtitle: 'Crujiente, cada bocado sabe',
      price: 30000,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop',
    },
    {
      title: 'CHICAGO DEEP\nPIZZA',
      subtitle: 'Clasica y deliciosa',
      price: 22000,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&h=600&fit=crop',
    },
    {
      title: 'SUSHI PREMIUM\nSET',
      subtitle: 'Fresco del dia',
      price: 45000,
      discount: 15,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    },
  ]

  const [heroIdx, setHeroIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % heroSlides.length)
    }, 5000) // Cambia cada 5 segundos
    return () => clearInterval(interval)
  }, [])

  const [modal, setModal]       = useState(null)
  const [carIdx, setCarIdx]       = useState(0)
  const [copied, setCopied]       = useState(false)
  const trackRef = useRef(null)

  const slide = dir => {
    const track = trackRef.current
    if (!track) return
    const cards = track.querySelectorAll('.rc')
    if (!cards.length) return
    const vis = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4
    const max = Math.max(0, cards.length - vis)
    const next = Math.max(0, Math.min(carIdx + dir, max))
    setCarIdx(next)
    track.style.transform = `translateX(-${next * (cards[0].offsetWidth + 24)}px)`
  }

  const toggleFav = async (restaurantId, e) => {
    e.stopPropagation()
    if (!token) {
      navigate('/login')
      return
    }
    await toggleFavorite(restaurantId, token)
  }

  const badgeStyle = type => ({
    position:'absolute', top:12, left:12,
    padding:'3px 10px', borderRadius:999,
    fontSize:11, fontWeight:700,
    background: type==='green' ? '#22c55e' : type==='yellow' ? '#facc15' : 'white',
    color: type==='yellow' ? '#111' : type==='green' ? 'white' : '#333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  })

  return (
    <div className="page-home" style={{ minHeight:'100vh', background:'white' }}>

      {/* ══════════ HERO CARRUSEL ══════════ */}
      <section style={{ 
        minHeight: 'calc(100vh - 64px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Fondo dinámico con transición */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${heroSlides[heroIdx].image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1,
          transition: 'opacity 0.8s ease, background-image 0.8s ease',
          zIndex: 0,
        }} />
        
        {/* Overlay oscuro limpio */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 1,
        }} />

        {/* Contenido */}
        <div style={{
          ...S.wrap,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          paddingTop: 96,
          paddingBottom: 96,
          height: '100%',
          minHeight: 'calc(100vh - 64px)',
        }}>
          {/* Contenido Slide */}
          <div style={{ maxWidth: 600, textAlign: 'center' }}>
            <p style={{ color:S.red, fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12, animation: 'fadeInDown 0.6s ease' }}>
              {heroSlides[heroIdx].subtitle}
            </p>
            <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.5rem)', fontWeight:900, color:'white', lineHeight:1.1, marginBottom:16, whiteSpace:'pre-line', animation: 'fadeInDown 0.8s ease 0.1s backwards' }}>
              {heroSlides[heroIdx].title}
            </h1>
            
            {/* Badge Descuento */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24, animation: 'fadeInUp 0.6s ease 0.2s backwards' }}>
              <span style={{
                background: S.red,
                color: 'white',
                padding: '10px 18px',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 16,
                boxShadow: '0 4px 15px rgba(255,75,62,0.4)',
              }}>
                -{heroSlides[heroIdx].discount}%
              </span>
              <p style={{ color:'#ccc', fontSize:16, margin: 0 }}>
                Oferta limitada — solo <strong style={{ color:'white', fontSize: 18 }}>${fmt(heroSlides[heroIdx].price)}</strong>
              </p>
            </div>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent: 'center', marginBottom:40, animation: 'fadeInUp 0.6s ease 0.3s backwards' }}>
              <a href="#fastfoods" style={S.btnRed}>
                <i className="fas fa-utensils" /> Ordenar ahora
              </a>
              <a href="#popular" style={S.btnOutline}>
                <i className="fas fa-store" /> Ver restaurantes
              </a>
            </div>

            {/* Indicadores de slides mejorados - CLICKEABLES */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
              {heroSlides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIdx(i)}
                  style={{
                    width: heroIdx === i ? 32 : 10,
                    height: 10,
                    borderRadius: 999,
                    border: 'none',
                    background: heroIdx === i ? S.red : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    boxShadow: heroIdx === i ? `0 0 20px ${S.red}80` : 'none',
                    padding: 0,
                  }}
                  title={`Ir a oferta ${i + 1}`}
                />
              ))}
            </div>

            <div style={{ display:'flex', gap:32, justifyContent: 'center', animation: 'fadeInUp 0.6s ease 0.4s backwards' }}>
              {[
                [stats.restaurants, 'Restaurantes'],
                [stats.avg_delivery, 'Entrega prom.'],
                [stats.avg_rating, 'Calificación'],
              ].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <strong style={{ display:'block', color:'white', fontSize:22, fontWeight:900 }}>{v}</strong>
                  <span style={{ color:'#aaa', fontSize:13 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ══════════ RESTAURANTES POPULARES ══════════ */}
      <section id="popular" style={{ ...S.section, padding:'48px 0 64px', background:'white' }}>
        <div style={S.wrap}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:40 }}>
            <div style={{ animation: 'fadeInDown 0.6s ease' }}>
              <p style={{ color:S.red, fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
                Destacados
              </p>
              <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, color:'#111', margin:0 }}>
                Restaurantes Populares
              </h2>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              {[[-1,'←'],[1,'→']].map(([dir, lbl]) => (
                <button key={dir} onClick={() => slide(dir)}
                  style={{
                    width:44, height:44, borderRadius:'50%', border:`2px solid ${dir===1 ? S.red : '#e5e5e5'}`,
                    background: dir===1 ? S.red : 'white',
                    color: dir===1 ? 'white' : '#555',
                    fontWeight:700, fontSize:16, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)'
                    if (dir === -1) {
                      e.target.style.background = S.red
                      e.target.style.borderColor = S.red
                      e.target.style.color = 'white'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)'
                    if (dir === -1) {
                      e.target.style.background = 'white'
                      e.target.style.borderColor = '#e5e5e5'
                      e.target.style.color = '#555'
                    }
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflow:'hidden' }}>
            {loadingRestaurants ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{
                    width:50, height:50,
                    border:'4px solid ' + S.red,
                    borderTop: '4px solid transparent',
                    borderRadius:'50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ color:'#666', fontWeight:500 }}>Cargando restaurantes...</p>
                </div>
              </div>
            ) : popularRestaurants.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', background:'#f9fafb', borderRadius:20 }}>
                <p style={{ fontSize:48, marginBottom:16 }}>🏪</p>
                <p style={{ color:'#666', fontSize:16 }}>No hay restaurantes disponibles en este momento</p>
              </div>
            ) : (
              <div ref={trackRef} style={{ display:'flex', gap:24, transition:'transform 0.5s ease' }}>
                {popularRestaurants.map((r, idx) => (
                  <div key={r.id} className="rc"
                    style={{
                      flexShrink:0, 
                      width:'calc(25% - 18px)', 
                      minWidth:240,
                      animation: `fadeInUp 0.6s ease ${0.1 * idx}s backwards`,
                    }}>
                    <RestaurantCard 
                      restaurant={r}
                      onSelect={handleRestaurantSelect}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ OFERTAS ══════════ */}
      <section id="ofertas" style={{ ...S.section, background:'linear-gradient(135deg, #fafbfc 0%, #fff9f0 100%)', padding:'48px 0 64px' }}>
        <div style={S.wrap}>
          <p style={{ color:'#FF4B3E', fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8, animation: 'fadeInDown 0.6s ease' }}>
            <i className="fas fa-tag"></i> Descuentos especiales
          </p>
          <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, color:'#111', margin:'0 0 8px', animation: 'fadeInDown 0.7s ease 0.1s backwards' }}>
            Ofertas
          </h2>
          <p style={{ color:'#666', fontSize:16, marginBottom:32, animation: 'fadeInUp 0.6s ease 0.2s backwards' }}>
            Platos con descuentos especiales
          </p>

          {loadingProducts ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'80px 0' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width:50, height:50,
                  border:'4px solid #FF4B3E',
                  borderTop: '4px solid transparent',
                  borderRadius:'50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color:'#666', fontWeight:500 }}>Cargando ofertas...</p>
              </div>
            </div>
          ) : (
            <>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
              gap:24,
              marginBottom:40,
            }}>
              {(featuredProducts && Array.isArray(featuredProducts) && featuredProducts.length > 0 ? featuredProducts : []).map((p, idx) => (
                  <div 
                    key={`${p.id}-${idx}`}
                    onClick={() => setModal({ id:p.id, name:p.name, price:p.price, img:p.image || '/images/placeholder.png', isMock: false, restaurantId: p.restaurantId })}
                    style={{
                      position: 'relative',
                      borderRadius: 20,
                      overflow: 'hidden',
                      background: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      animation: `fadeInUp 0.6s ease ${0.05 * (idx % 4)}s backwards`,
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    {/* Imagen */}
                    <div style={{
                      width: '100%',
                      height: 180,
                      background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <img 
                        src={p.image || '/images/placeholder.png'} 
                        alt={p.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      
                      {/* Badge descuento */}
                      {p.pct && (
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: S.red,
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: 12,
                          fontWeight: 900,
                          fontSize: 12,
                          boxShadow: '0 4px 12px rgba(255, 75, 62, 0.3)',
                        }}>
                          -{p.pct}%
                        </div>
                      )}
                      
                      {/* Botón corazón */}
                      <button
                        onClick={(e) => {
                          toggleFav(p.restaurantId, e)
                        }}
                        aria-label={isFavorite(p.restaurantId) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        style={{
                          position: 'absolute',
                          bottom: 12,
                          right: 12,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          color: isFavorite(p.restaurantId) ? '#FF4B3E' : '#d1d5db',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isFavorite(p.restaurantId)) {
                            e.currentTarget.style.color = '#FF4B3E'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isFavorite(p.restaurantId)) {
                            e.currentTarget.style.color = '#d1d5db'
                          }
                        }}
                      >
                        <i className={`fas fa-heart ${isFavorite(p.restaurantId) ? 'text-[#FF4B3E]' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Contenido */}
                    <div style={{ padding: '16px' }}>
                      {/* Restaurant */}
                      <p style={{
                        color: '#FF4B3E',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: '0 0 6px',
                      }}>
                        {p.restaurantName}
                      </p>
                      
                      {/* Nombre */}
                      <h3 style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: '#111',
                        margin: '0 0 8px',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {p.name}
                      </h3>
                      
                      {/* Descripción */}
                      {p.description && (
                        <p style={{
                          fontSize: 12,
                          color: '#888',
                          margin: '0 0 12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {p.description}
                        </p>
                      )}
                      
                      {/* Precio */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 12,
                      }}>
                        <span style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: '#111',
                        }}>
                          ${fmt(p.price)}
                        </span>
                        {p.oldPrice && (
                          <span style={{
                            fontSize: 13,
                            color: '#999',
                            textDecoration: 'line-through',
                            fontWeight: 600,
                          }}>
                            ${fmt(p.oldPrice)}
                          </span>
                        )}
                      </div>
                      
                      {/* Botón añadir */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setModal({ id:p.id, name:p.name, price:p.price, img:p.image || '/images/placeholder.png', isMock: false, restaurantId: p.restaurantId })
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: S.red,
                          color: 'white',
                          border: 'none',
                          borderRadius: 12,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                        onMouseEnter={(e) => e.target.style.background = S.redDk}
                        onMouseLeave={(e) => e.target.style.background = S.red}
                      >
                        <i className="fas fa-plus" /> Agregar
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Call to action */}
            <div style={{ textAlign:'center', marginTop:40, animation: 'fadeInUp 0.6s ease 0.5s backwards' }}>
              <Link to="/restaurants" style={S.btnRed}>
                <i className="fas fa-utensils" /> Ver más ofertas
              </Link>
            </div>
            </>
          )}
        </div>
      </section>

      {/* ══════════ RESTAURANTES CERCANOS ══════════ */}
      <section style={{ ...S.section, background:'white', padding:'48px 0 64px' }}>
        <div style={S.wrap}>
          <p style={{ color:'#FF4B3E', fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8, animation: 'fadeInDown 0.6s ease' }}>
            <i className="fas fa-map-marker-alt"></i> Para ti
          </p>
          <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, color:'#111', margin:'0 0 8px', animation: 'fadeInDown 0.7s ease 0.1s backwards' }}>
            Restaurantes Cercanos
          </h2>
          <p style={{ color:'#666', fontSize:16, marginBottom:32, animation: 'fadeInUp 0.6s ease 0.2s backwards' }}>
            Descubre los mejores restaurantes en tu zona
          </p>
          
          {loadingRestaurants ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'80px 0' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width:50, height:50,
                  border:'4px solid #FF4B3E',
                  borderTop: '4px solid transparent',
                  borderRadius:'50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color:'#666', fontWeight:500 }}>Cargando restaurantes...</p>
              </div>
            </div>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
              gap:16,
              marginBottom:40,
            }}>
              {popularRestaurants.map((restaurant, idx) => (
                <div
                  key={restaurant.id || idx}
                  onClick={() => handleRestaurantSelect(restaurant)}
                  style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    animation: `fadeInUp 0.6s ease ${0.05 * (idx % 4)}s backwards`,
                    transform: 'translateY(0)',
                    border: '1px solid #f0f0f0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* Imagen */}
                  <div style={{
                    width: '100%',
                    height: 110,
                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <img
                      src={restaurant.img || '/images/placeholder.png'}
                      alt={restaurant.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    
                    {/* Rating badge */}
                    {restaurant.rating && (
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: '#facc15',
                        color: '#111',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}>
                        <i className="fas fa-star" style={{ fontSize: 9 }} /> {restaurant.rating}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: 12 }}>
                    <h3 style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#111',
                      margin: '0 0 6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {restaurant.name}
                    </h3>

                    {/* Stats */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 10,
                      color: '#666',
                      flexWrap: 'wrap',
                    }}>
                      <span>
                        <i className="fas fa-clock" style={{ marginRight: 3 }} />
                        {restaurant.time} min
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════ RESTAURANTES FAVORITOS ══════════ */}
      {isAuth && popularRestaurants.filter(r => isFavorite(r.id)).length > 0 && (
        <section style={{ ...S.section, background:'white', padding:'48px 0 64px' }}>
          <div style={S.wrap}>
            <p style={{ color:'#FF4B3E', fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8, animation: 'fadeInDown 0.6s ease' }}>
              <i className="fas fa-heart"></i> Tus favoritos
            </p>
            <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, color:'#111', margin:'0 0 8px', animation: 'fadeInDown 0.7s ease 0.1s backwards' }}>
              Restaurantes Favoritos
            </h2>
            <p style={{ color:'#666', fontSize:16, marginBottom:32, animation: 'fadeInUp 0.6s ease 0.2s backwards' }}>
              Tus restaurantes guardados
            </p>
            
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
              gap:16,
              marginBottom:40,
            }}>
              {popularRestaurants.filter(r => isFavorite(r.id)).map((restaurant, idx) => (
                <div
                  key={restaurant.id || idx}
                  onClick={() => handleRestaurantSelect(restaurant)}
                  style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    animation: `fadeInUp 0.6s ease ${0.05 * (idx % 4)}s backwards`,
                    transform: 'translateY(0)',
                    border: '1px solid #f0f0f0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* Imagen */}
                  <div style={{
                    width: '100%',
                    height: 110,
                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <img
                      src={restaurant.img || '/images/placeholder.png'}
                      alt={restaurant.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    
                    {/* Favorito badge */}
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#FF4B3E',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      boxShadow: '0 2px 8px rgba(255, 75, 62, 0.3)',
                    }}>
                      <i className="fas fa-heart"></i>
                    </div>
                    
                    {/* Rating badge */}
                    {restaurant.rating && (
                      <div style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        background: '#facc15',
                        color: '#111',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}>
                        <i className="fas fa-star" style={{ fontSize: 9 }} /> {restaurant.rating}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: 12 }}>
                    <h3 style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#111',
                      margin: '0 0 6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {restaurant.name}
                    </h3>

                    {/* Stats */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 10,
                      color: '#666',
                      flexWrap: 'wrap',
                    }}>
                      <span>
                        <i className="fas fa-clock" style={{ marginRight: 3 }} />
                        {restaurant.time} min
                      </span>
                      <span>
                        <i className="fas fa-motorcycle" style={{ marginRight: 3 }} />
                        ${fmt(restaurant.delivery)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ CÓMO FUNCIONA ══════════ */}
      <section id="how" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#FF4B3E] font-bold text-xs uppercase tracking-widest mb-2">
              Simple y rapido
            </p>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900">
              ¿Cómo funciona AppiFood?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { n:1, icon:'📍', title:'Elige tu ubicación',  desc:'Ingresa tu dirección y encontramos los mejores restaurantes cerca de ti.' },
              { n:2, icon:'🍽️', title:'Selecciona tu comida', desc:'Explora el menú, personaliza tu pedido y agrégalo al carrito.' },
              { n:3, icon:'💳', title:'Paga fácilmente',      desc:'Efectivo, tarjeta, Nequi o Daviplata.' },
              { n:4, icon:'🛵', title:'Recibe en casa',       desc:'Rastrea tu pedido en tiempo real hasta que llegue a tu puerta.' },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#FF4B3E] text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                  {n}
                </div>
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BANNER CUPÓN ══════════ */}
      {!isAuth && (
        <section style={{ paddingBottom:64 }}>
          <div style={S.wrap}>
            <div style={{
              borderRadius:24, padding:'48px 40px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              gap:32, flexWrap:'wrap',
              background:'linear-gradient(135deg,#1a1a1a,#3d1a00)',
            }}>
              <div>
                <p style={{ color:'#facc15', fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>
                  Oferta especial
                </p>
                <h2 style={{ color:'white', fontWeight:900, fontSize:'clamp(1.5rem,3vw,2rem)', margin:'0 0 8px' }}>
                  ¡15% de descuento<br />en tu primer pedido!
                </h2>
                <p style={{ color:'#ccc', marginBottom:20, fontSize:15 }}>
                  Regístrate gratis y usa este cupón en tu primera orden.
                </p>
                <button onClick={() => { navigator.clipboard?.writeText('BIENVENIDO'); setCopied(true); setTimeout(()=>setCopied(false),2500) }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:12,
                    background:'#facc15', color:'#111',
                    border:'none', borderRadius:16,
                    padding:'12px 20px', fontWeight:700, cursor:'pointer',
                    fontSize:14, marginBottom:20,
                  }}>
                  <i className="fas fa-ticket-alt" />
                  <span>BIENVENIDO</span>
                  <small style={{ fontWeight:400 }}>{copied ? '✅ Copiado!' : 'Clic para copiar'}</small>
                </button>
                <br />
                <Link to="/register" style={S.btnRed}>
                  <i className="fas fa-user-plus" /> Crear cuenta gratis
                </Link>
              </div>
              <div style={{ fontSize:100, userSelect:'none' }}>🍔</div>
            </div>
          </div>
        </section>
      )}

      {modal && <ProductModal product={modal} onClose={() => setModal(null)} />}
      <Footer restaurants={STATIC_RESTAURANTS} />
    </div>
  )
}