// Archivo: src/components/Header.jsx | Comentario: logica principal del modulo.
// src/components/Header.jsx - Versión completa corregida
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/useCart'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const RED = '#FF4B3E'
const RED_DK = '#e03a2d'

export default function Header({ isAuth, user, onLogout, isLoading }) {
  console.log('🎯 Header received:', { 
    isAuth, 
    isLoading,
    user: user ? JSON.stringify(user) : 'null' 
  })
  
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [search, setSearch]             = useState('')
  const { count, setIsOpen }            = useCart()
  const navigate  = useNavigate()
  const location  = useLocation()
  const userRef   = useRef(null)

  const getUserName = () => {
    if (!user) return t('header.defaultUser')
    const result = user.name || user.nombre || user.displayName || user.username || t('header.defaultUser')
    return result
  }

  const getUserEmail = () => {
    if (!user) return ''
    return user.email || user.correo || user.mail || ''
  }

  const getUserInitial = () => {
    const name = getUserName()
    return name ? name.charAt(0).toUpperCase() : 'U'
  }

  const isAdmin = String(user?.role ?? user?.rol ?? 'customer').toLowerCase() === 'admin'

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { setDrawerOpen(false); setUserMenuOpen(false) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  useEffect(() => {
    const fn = e => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  const doSearch = () => {
    if (!search.trim()) return
    navigate(`/restaurants?q=${encodeURIComponent(search.trim())}`)
  }

  const NAV_LINKS = [
    { section: t('header.nav.sectionDiscover') },
    { to:'/',            icon:'fa-home',          label: t('header.nav.home') },
    { to:'/restaurants', icon:'fa-store',         label: t('header.nav.restaurants') },
    { href:'#fastfoods', icon:'fa-fire',           label: t('header.nav.fastfoods') },
    { href:'#popular',   icon:'fa-star',           label: t('header.nav.topRated') },
    ...(isAuth ? [
      { section: t('header.nav.sectionAccount') },
      ...(isAdmin ? [{ to:'/admin', icon:'fa-shield-alt', label: t('header.nav.adminPanel'), promo:true }] : []),
      { to:'/user/orders',    icon:'fa-box',            label: t('header.nav.myOrders') },
      { to:'/user/favorites', icon:'fa-heart',          label: t('header.nav.myFavorites') },
      { to:'/user/addresses', icon:'fa-map-marker-alt', label: t('header.nav.myAddresses') },
      { to:'/user/profile',   icon:'fa-user-cog',       label: t('header.nav.myProfile') },
    ] : []),
    { section: t('header.nav.sectionSubscriptions') },
    { to:'/subscription', icon:'fa-crown',        label: t('header.nav.subscriptionPlans'), promo:true },
    { section: t('header.nav.sectionOffers') },
    { href:'#promo', icon:'fa-tag',           label: t('header.nav.coupons'), promo:true },
    { href:'#',      icon:'fa-percent',       label: t('header.nav.dailyPromos') },
    { section: t('header.nav.sectionHelp') },
    { href:'#how',   icon:'fa-question-circle', label: t('header.nav.howItWorks') },
    { href:'#',      icon:'fa-headset',         label: t('header.nav.supportChat') },
    { href:'#',      icon:'fa-mobile-alt',      label: t('header.nav.downloadApp') },
    { to:'/register-restaurant', icon:'fa-utensils', label: t('header.nav.registerRestaurant'), promo:true },
  ]

  const linkStyle = (promo) => ({
    display:'flex', alignItems:'center', gap:12,
    padding:'11px 20px', fontSize:14, fontWeight:500,
    color: promo ? RED : '#333',
    textDecoration:'none', cursor:'pointer',
    border:'none', background:'none', width:'100%', textAlign:'left',
    fontFamily:'inherit', transition:'padding-left 0.15s, background 0.15s',
  })

  if (isLoading) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 border-b border-gray-100">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="hidden sm:flex flex-1 max-w-lg">
              <div className="w-full h-10 bg-gray-200 animate-pulse rounded-full" />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-full" />
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full" />
              <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg" />
            </div>
          </div>
        </header>
        <div style={{ height:64 }} />
      </>
    )
  }

  return (
    <>
      {/* ── TOPBAR ── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 border-b border-gray-100">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* IZQUIERDA: Hamburguesa + Logo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button onClick={() => setDrawerOpen(true)}
              className="block w-10 h-10 rounded-lg hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#FF4B3E] transition flex-shrink-0">
              <i className="fas fa-bars text-lg font-bold" />
            </button>

            <Link to="/" className="font-['Satisfy'] text-3xl font-bold text-[#FF4B3E] hover:text-[#e03a2d] transition whitespace-nowrap">
              AppiFood
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
              <i className="fas fa-map-marker-alt text-[#FF4B3E] text-xs" />
              <span>{isAuth && user?.city ? user.city : 'Popayán'}</span>
            </div>
          </div>

          {/* CENTRO: Buscador */}
          <div className="hidden sm:flex flex-1 max-w-lg">
            <div className="w-full flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border-2 border-transparent hover:border-[#FF4B3E] transition">
              <input
                type="search"
                placeholder={t('header.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key==='Enter' && doSearch()}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
              />
              <button onClick={doSearch}
                className="w-8 h-8 rounded-full bg-[#FF4B3E] hover:bg-[#e03a2d] text-white flex items-center justify-center transition flex-shrink-0">
                <i className="fas fa-search text-xs" />
              </button>
            </div>
          </div>

          {/* DERECHA: Usuario + Carrito */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {!isAuth ? (
              <>
                <Link to="/login" className="hidden sm:inline-block px-4 py-2 rounded-full border-2 border-[#FF4B3E] text-[#FF4B3E] font-bold text-xs hover:bg-red-50 transition">
                  {t('header.login')}
                </Link>
                {location.pathname === '/register-restaurant' ? (
                  <Link to="/restaurant/login" className="px-4 py-2 rounded-full bg-[#FF4B3E] text-white font-bold text-xs hover:bg-[#e03a2d] transition">
                    {t('header.restaurantLogin')}
                  </Link>
                ) : (
                  <Link to="/register" className="px-4 py-2 rounded-full bg-[#FF4B3E] text-white font-bold text-xs hover:bg-[#e03a2d] transition">
                    {t('header.register')}
                  </Link>
                )}
              </>
            ) : (
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-full transition">
                  <div className="w-8 h-8 rounded-full bg-[#FF4B3E] text-white font-bold text-xs flex items-center justify-center">
                    {getUserInitial()}
                  </div>
                  <i className={`fas fa-chevron-down text-xs text-gray-500 transition ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-sm text-gray-800">{getUserName()}</p>
                      <p className="text-xs text-gray-500 mt-1">{getUserEmail()}</p>
                    </div>
                    {[
                      ...(isAdmin ? [{ to:'/admin', icon:'fa-shield-alt', label: t('header.menu.adminPanel') }] : []),
                      { to:'/user/profile',   icon:'fa-user',           label: t('header.menu.profile') },
                      { to:'/user/orders',    icon:'fa-box',            label: t('header.menu.orders') },
                      { to:'/user/favorites', icon:'fa-heart',          label: t('header.menu.favorites') },
                      { to:'/user/addresses', icon:'fa-map-marker-alt', label: t('header.menu.addresses') },
                    ].map(({ to, icon, label }) => (
                      <Link key={label} to={to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                        <i className={`fas ${icon} text-gray-400 w-4`} /> {label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 my-2" />
                    <button onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-[#FF4B3E] transition text-left">
                      <i className="fas fa-sign-out-alt w-4" /> {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Selector de idioma */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Carrito */}
            <button onClick={() => setIsOpen(true)}
              className="relative w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-[#FF4B3E] bg-white text-gray-600 hover:text-[#FF4B3E] flex items-center justify-center transition">
              <i className="fas fa-shopping-cart text-lg" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FF4B3E] text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── OVERLAY DRAWER ── */}
      <div onClick={() => setDrawerOpen(false)}
        style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.55)',
          zIndex:60,
          opacity: drawerOpen ? 1 : 0,
          visibility: drawerOpen ? 'visible' : 'hidden',
          transition:'opacity 0.3s, visibility 0.3s',
        }} />

      {/* ── DRAWER ── */}
      <nav style={{
        position:'fixed', top:0, left:0,
        width:300, height:'100%',
        background:'white', zIndex:61,
        display:'flex', flexDirection:'column',
        boxShadow:'4px 0 30px rgba(0,0,0,0.18)',
        overflowY:'auto',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Header drawer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #f0f0f0', position:'sticky', top:0, background:'white', zIndex:1 }}>
          <span style={{ fontFamily:'Satisfy, cursive', fontSize:24, color:RED }}>AppiFood</span>
          <button onClick={() => setDrawerOpen(false)}
            style={{ width:34, height:34, borderRadius:'50%', background:'#f5f5f5', border:'none', cursor:'pointer', fontSize:15, color:'#555', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Perfil auth */}
        {isAuth && user && (
          <div style={{ 
            display:'flex', flexDirection:'column', alignItems:'center', 
            gap:8, padding:'24px 20px', 
            background:'#fff5f4', borderBottom:'1px solid #f0f0f0'
          }}>
            <div style={{ 
              width:64, height:64, borderRadius:'50%', 
              background:RED, color:'white', fontWeight:800, fontSize:24, 
              display:'flex', alignItems:'center', justifyContent:'center', 
              flexShrink:0, marginBottom:8
            }}>
              {getUserInitial()}
            </div>
            <div style={{ textAlign:'center' }}>
              <span style={{ display:'block', fontWeight:700, fontSize:16, color:'#111', marginBottom:4 }}>
                {getUserName()}
              </span>
              <span style={{ display:'block', fontSize:13, color:'#666' }}>
                {getUserEmail()}
              </span>
            </div>
          </div>
        )}

        {/* Links */}
        <div style={{ flex:1 }}>
          {NAV_LINKS.map((item, i) => {
            if (item.section) return (
              <div key={i} style={{ 
                padding:'16px 20px 8px', fontSize:12, fontWeight:700, 
                textTransform:'uppercase', letterSpacing:'0.05em', color:'#999',
                borderTop: i > 0 ? '1px solid #f0f0f0' : 'none',
                marginTop: i > 0 ? 8 : 0
              }}>
                {item.section}
              </div>
            )
            const style = linkStyle(item.promo)
            if (item.to) return (
              <Link key={item.label} to={item.to} style={style}
                onMouseEnter={e => { e.currentTarget.style.background='#fafafa'; e.currentTarget.style.paddingLeft='24px'; if(!item.promo) e.currentTarget.style.color=RED }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.paddingLeft='20px'; if(!item.promo) e.currentTarget.style.color='#333' }}>
                <i className={`fas ${item.icon}`} style={{ width:18, textAlign:'center', color:'#bbb', fontSize:14 }} />
                {item.label}
              </Link>
            )
            return (
              <a key={item.label} href={item.href} style={style}
                onClick={() => setDrawerOpen(false)}
                onMouseEnter={e => { e.currentTarget.style.background='#fafafa'; e.currentTarget.style.paddingLeft='24px'; if(!item.promo) e.currentTarget.style.color=RED }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.paddingLeft='20px'; if(!item.promo) e.currentTarget.style.color='#333' }}>
                <i className={`fas ${item.icon}`} style={{ width:18, textAlign:'center', color: item.promo ? RED : '#bbb', fontSize:14 }} />
                {item.label}
              </a>
            )
          })}
        </div>

        {/* Footer drawer */}
        <div style={{ padding:'16px 20px 24px', borderTop:'1px solid #f0f0f0', display:'flex', flexDirection:'column', gap:10 }}>
          <div className="flex justify-center py-1">
            <LanguageSwitcher />
          </div>
          {!isAuth ? (
            <>
              <Link to="/register" onClick={() => setDrawerOpen(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:RED, color:'white', borderRadius:999, fontWeight:700, fontSize:14, textDecoration:'none' }}>
                <i className="fas fa-user-plus" /> {t('header.registerFree')}
              </Link>
              <Link to="/login" onClick={() => setDrawerOpen(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'12px', border:`2px solid ${RED}`, color:RED, borderRadius:999, fontWeight:700, fontSize:14, textDecoration:'none' }}>
                {t('header.login')}
              </Link>
            </>
          ) : (
            <button onClick={onLogout}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px', background:'none', border:'1.5px solid #e5e5e5', borderRadius:999, fontSize:14, fontWeight:600, color:'#888', cursor:'pointer', fontFamily:'inherit' }}>
              <i className="fas fa-sign-out-alt" /> {t('header.logout')}
            </button>
          )}
        </div>
      </nav>

      {/* Espacio para header fijo */}
      <div style={{ height:64 }} />
    </>
  )
}