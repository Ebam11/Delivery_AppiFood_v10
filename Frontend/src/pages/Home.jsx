// Archivo: src/pages/Home.jsx | Comentario: logica principal del modulo.
// src/pages/HomePage.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductModal from '../components/ProductModal'
import ProductCard from '../components/ProductCard'
import RestaurantCard from '../components/RestaurantCard'
import Footer from '../components/Footer'

const STATIC_RESTAURANTS = [
  { id:1, name:'Burger House',    badge:'Verificado ✓', badgeType:'default', rating:4.5, time:'25–40', delivery:3500, img:'/images/group-2-6-91.png' },
  { id:2, name:'Pizza Nostra',    badge:'Verificado ✓', badgeType:'default', rating:4.8, time:'35–50', delivery:4000, img:'/images/group-3-6-92.png' },
  { id:3, name:'Sushi Zen',       badge:'Nuevo',        badgeType:'green',   rating:4.7, time:'40–55', delivery:5000, img:'/images/group-4-6-93.png' },
  { id:4, name:'El Rincón Paisa', badge:'Oferta',       badgeType:'yellow',  rating:4.3, time:'30–45', delivery:2500, img:'/images/group-5-6-94.png' },
]

const STATIC_PRODUCTS = [
  { id:1, name:'Delicious Burger',    category:'burger',  price:35000, oldPrice:55000, pct:25, img:'/images/delicious-burger-png-106.png' },
  { id:2, name:'Grilled Chicken',     category:'chicken', price:39000, oldPrice:42000, pct:7,  img:'/images/grilled-2-png-121.png' },
  { id:3, name:'Ruti With Chicken',   category:'chicken', price:26000, oldPrice:29000, pct:10, img:'/images/ruti-png-136.png' },
  { id:4, name:'Fast Food Combo',     category:'burger',  price:28000, oldPrice:34000, pct:18, img:'/images/main-food-2-png-151.png' },
  { id:5, name:'Chicago Deep Pizza',  category:'pizza',   price:22000, oldPrice:28000, pct:21, img:'/images/pizza-3-png-166.png' },
  { id:6, name:'Chinese Pasta',       category:'pasta',   price:34000, oldPrice:40000, pct:15, img:'/images/pasta-2-png-181.png' },
  { id:7, name:'Whopper Burger King', category:'burger',  price:26000, oldPrice:30000, pct:13, img:'/images/burger-2-1-png-196.png' },
  { id:8, name:'Ruti With Beef',      category:'chicken', price:28520, oldPrice:30520, pct:7,  img:'/images/beef-ruti-png-211.png' },
]

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

export default function HomePage({ isAuth, data = {} }) {
  const {
    popularRestaurants = STATIC_RESTAURANTS,
    featuredProducts   = STATIC_PRODUCTS,
    stats = { restaurants:'3+', avg_delivery:'25 min', avg_rating:'4.8 ⭐' },
  } = data

  const navigate = useNavigate()
  
  // Carrusel de hero
  const heroSlides = [
    {
      title: 'HOT SPICY\nCHICKEN BURGER',
      subtitle: '🔥 Crujiente, cada bocado sabe',
      price: 30000,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop',
    },
    {
      title: 'CHICAGO DEEP\nPIZZA',
      subtitle: '🍕 Clásica y deliciosa',
      price: 22000,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&h=600&fit=crop',
    },
    {
      title: 'SUSHI PREMIUM\nSET',
      subtitle: '🍣 Fresco del día',
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
  const [activeCat, setActiveCat] = useState('all')
  const [favs, setFavs]           = useState(new Set())
  const [carIdx, setCarIdx]       = useState(0)
  const [copied, setCopied]       = useState(false)
  const trackRef = useRef(null)

  const filtered = activeCat === 'all'
    ? featuredProducts
    : featuredProducts.filter(p => p.category === activeCat)

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

  const toggleFav = (id, e) => {
    e.stopPropagation()
    if (!isAuth) { window.location.href = '/login'; return }
    setFavs(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
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
    <div style={{ minHeight:'100vh', background:'white' }}>

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
      <section id="popular" style={{ ...S.section, padding:'24px 0 32px' }}>
        <div style={S.wrap}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:32 }}>
            <div>
              <p style={{ color:'#16a34a', fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
                🌟 Destacados
              </p>
              <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:900, color:'#111', margin:0 }}>
                Restaurantes Populares
              </h2>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {[[-1,'←'],[1,'→']].map(([dir, lbl]) => (
                <button key={dir} onClick={() => slide(dir)}
                  style={{
                    width:40, height:40, borderRadius:'50%', border:'2px solid #e5e5e5',
                    background: dir===1 ? S.red : 'white',
                    color: dir===1 ? 'white' : '#555',
                    fontWeight:700, fontSize:16, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflow:'hidden' }}>
            <div ref={trackRef} style={{ display:'flex', gap:24, transition:'transform 0.5s ease' }}>
              {popularRestaurants.map(r => (
                <div key={r.id} className="rc"
                  style={{
                    flexShrink:0, width:'calc(25% - 18px)', minWidth:220,
                  }}>
                  <RestaurantCard 
                    restaurant={r}
                    onSelect={rest => navigate(`/restaurants/${rest.id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FAST FOODS ══════════ */}
      <section id="fastfoods" style={{ ...S.section, background:'#f9fafb', padding:'24px 0 32px' }}>
        <div style={S.wrap}>
          <p style={{ color:'#16a34a', fontWeight:700, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
            🔥 Crujiente, Cada Bocado Sabe
          </p>
          <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:900, color:'#111', margin:'0 0 24px' }}>
            Popular Fast Foods
          </h2>

          {/* Filtros */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:32 }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setActiveCat(c.key)}
                style={activeCat===c.key ? S.pillActive : S.pillInactive}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
            gap:20,
          }}>
            {filtered.map(p => (
              <ProductCard 
                key={p.id}
                product={p}
                onFav={toggleFav}
                isFav={favs.has(p.id)}
                onSelect={prod => setModal({ id:prod.id, name:prod.name, price:prod.price, img:prod.img })}
              />
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:40 }}>
            <Link to="/restaurants" style={S.btnRed}>
              <i className="fas fa-utensils" /> Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ CÓMO FUNCIONA ══════════ */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#FF4B3E] font-bold text-xs uppercase tracking-widest mb-2">
              📱 Simple y rápido
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
                  🎟️ Oferta especial
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