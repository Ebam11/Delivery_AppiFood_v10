// Archivo: src/components/Header.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import { useCart } from '../context/useCart'
import { api } from '../api/client'

const DEFAULT_LOCATION = { lat: 2.4448, lng: -76.6147 }

export default function Header({ isAuth, user, onLogout, isLoading }) {
  const { t } = useTranslation()
  
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState(() => localStorage.getItem('selected_delivery_address') || 'Popayán, Cauca')
  const [tempAddress, setTempAddress] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState('')
  const [addressSaving, setAddressSaving] = useState(false)
  const [search, setSearch] = useState('')
  const { count, setIsOpen } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const userRef = useRef(null)
  
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()
  const effectiveUser = user || storedUser

  const isGmailUserMissingInfo = isAuth && 
    effectiveUser && 
    (effectiveUser.email || '').toLowerCase().endsWith('@gmail.com') && 
    (!effectiveUser.phone || !effectiveUser.id_number || !effectiveUser.birth_date);

  const getUserName = () => {
    if (!effectiveUser) return t('header.defaultUser')
    return effectiveUser.name || effectiveUser.nombre || effectiveUser.displayName || effectiveUser.username || t('header.defaultUser')
  }

  const getUserEmail = () => {
    if (!effectiveUser) return ''
    return effectiveUser.email || effectiveUser.correo || effectiveUser.mail || ''
  }

  const getUserInitial = () => {
    const name = getUserName()
    return name ? name.charAt(0).toUpperCase() : 'U'
  }

  const isPremium = Boolean(effectiveUser?.is_premium)
  const userRole = String(effectiveUser?.role ?? 'customer').toLowerCase()
  const isAdmin = userRole === 'admin'

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { setDrawerOpen(false); setUserMenuOpen(false) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = (drawerOpen || addressModalOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen, addressModalOpen])

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

  const goHomeTop = (event) => {
    if (location.pathname === '/') {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setDrawerOpen(false)
  }

  const openAddressModal = () => {
    setTempAddress(deliveryAddress)
    setEditingAddressId(null)
    setAddressesError('')
    setAddressModalOpen(true)
  }

  const closeAddressModal = () => {
    setAddressModalOpen(false)
  }

  const fetchSavedAddresses = async () => {
    if (!isAuth) return
    try {
      setAddressesLoading(true)
      const response = await api.get('/addresses')
      const list = Array.isArray(response.data?.data) ? response.data.data : []
      setSavedAddresses(list)
      const selected = list.find((address) => address.is_default) || list[0] || null
      if (selected) {
        setSelectedAddressId(selected.id)
        setTempAddress(selected.address)
      }
    } catch {
      setAddressesError(t('header.address.errorLoad') || 'No se pudieron cargar las direcciones')
    } finally {
      setAddressesLoading(false)
    }
  }

  useEffect(() => {
    if (addressModalOpen) fetchSavedAddresses()
  }, [addressModalOpen])

  const saveAddress = async () => {
    const nextAddress = tempAddress.trim() || deliveryAddress
    if (!nextAddress) return

    const storeLocation = (coords, label) => {
      localStorage.setItem('selected_delivery_coords', JSON.stringify({
        lat: Number(coords?.lat ?? DEFAULT_LOCATION.lat),
        lng: Number(coords?.lng ?? DEFAULT_LOCATION.lng),
        label: label || nextAddress,
      }))
    }

    const geocodeAddress = async (address) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`,
          { headers: { Accept: 'application/json' } }
        )
        const results = await response.json()
        const first = Array.isArray(results) ? results[0] : null
        if (first?.lat && first?.lon) {
          return { lat: Number(first.lat), lng: Number(first.lon) }
        }
      } catch { /* fallback */ }
      return DEFAULT_LOCATION
    }

    try {
      setAddressSaving(true)
      setAddressesError('')

      if (isAuth) {
        let targetAddressId = selectedAddressId
        if (editingAddressId) {
          await api.put(`/addresses/${editingAddressId}`, {
            name: 'Dirección', address: nextAddress, lat: null, lng: null,
          })
          targetAddressId = editingAddressId
        } else {
          const selected = savedAddresses.find((a) => a.id === selectedAddressId)
          const isSameSelected = selected && selected.address === nextAddress
          if (!isSameSelected) {
            const created = await api.post('/addresses', {
              name: 'Dirección', address: nextAddress, lat: null, lng: null,
            })
            targetAddressId = created.data?.data?.id || null
          }
        }
        if (targetAddressId) {
          await api.patch(`/addresses/${targetAddressId}/default`)
          setSelectedAddressId(targetAddressId)
        }
        await fetchSavedAddresses()
      }

      setEditingAddressId(null)
      setDeliveryAddress(nextAddress)
      localStorage.setItem('selected_delivery_address', nextAddress)

      if (/ubicaci[oó]n actual/i.test(nextAddress)) {
        const match = nextAddress.match(/\(([-\d.]+),\s*([-\d.]+)\)/)
        if (match) storeLocation({ lat: match[1], lng: match[2] }, nextAddress)
        else storeLocation(DEFAULT_LOCATION, nextAddress)
      } else {
        const coords = await geocodeAddress(nextAddress)
        storeLocation(coords, nextAddress)
      }

      window.dispatchEvent(new Event('delivery-address-updated'))
      setAddressModalOpen(false)
    } catch {
      setAddressesError(t('header.address.errorSave') || 'No se pudo guardar la dirección')
    } finally {
      setAddressSaving(false)
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextAddress = `${t('header.address.currentLocation') || 'Ubicación actual'} (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`
        setTempAddress(nextAddress)
      },
      () => {}
    )
  }

  const selectAddress = (address) => {
    setSelectedAddressId(address.id)
    setTempAddress(address.address)
    setEditingAddressId(null)
  }

  const startEditAddress = (address) => {
    setEditingAddressId(address.id)
    setSelectedAddressId(address.id)
    setTempAddress(address.address)
  }

  const removeAddress = async (addressId) => {
    try {
      setAddressesError('')
      await api.delete(`/addresses/${addressId}`)
      const nextList = savedAddresses.filter((a) => a.id !== addressId)
      setSavedAddresses(nextList)
      if (selectedAddressId === addressId) {
        const fallback = nextList[0] || null
        setSelectedAddressId(fallback?.id || null)
        setTempAddress(fallback?.address || '')
      }
    } catch {
      setAddressesError(t('header.address.errorDelete') || 'No se pudo eliminar la dirección')
    }
  }

  const NAV_LINKS = [
    { section: isAuth ? (t('header.nav.sectionDiscover') || 'DESCUBRIR') : 'DESCUBRE EL SABOR' },
    { to:'/',            icon:'fa-home',          label: t('header.nav.home') || 'Inicio' },
    { to:'/restaurants', icon:'fa-store',         label: t('header.nav.restaurants') || 'Restaurantes' },
    ...(isAuth ? [
      { section: t('header.nav.sectionAccount') || 'MI CUENTA' },
      ...(isAdmin ? [{ to:'/admin', icon:'fa-shield-alt', label: t('header.nav.adminPanel') || 'Panel Admin', promo:true }] : []),
      { to:'/user/orders',    icon:'fa-box',            label: t('header.nav.myOrders') || 'Mis pedidos' },
      { to:'/user/favorites', icon:'fa-heart',          label: t('header.nav.myFavorites') || 'Mis favoritos' },
      { to:'/user/profile',   icon:'fa-user-cog',       label: t('header.nav.myProfile') || 'Mi perfil' },
      { to:'/user/gamification', icon:'fa-trophy',      label: t('header.nav.clubLoyalty') || 'Club de Fidelidad', promo:true },
    ] : []),
    { section: isAuth ? (t('header.nav.sectionSubscriptions') || 'SUSCRIPCIONES') : 'MÁS BENEFICIOS' },
    { to:'/subscription', icon:'fa-crown',        label: t('header.nav.subscriptionPlans') || 'Planes de Suscripción', promo:true },
    { section: t('header.nav.sectionOffers') || 'OFERTAS' },
    { to:'/offers', icon:'fa-fire',           label: t('header.nav.dailyPromos') || 'Ofertas del Día', promo:true },
    { to:'/coupons', icon:'fa-tag',           label: t('header.nav.coupons') || 'Cupones disponibles', promo:true },
    { section: isAuth ? (t('header.nav.sectionHelp') || 'AYUDA') : 'MÁS INFORMACIÓN' },
    { to:'/help-center', icon:'fa-question-circle', label: t('header.nav.howItWorks') || 'Centro de ayuda', promo:true },
    { to:'/support', icon:'fa-headset',         label: t('header.nav.supportChat') || 'Chat de soporte', promo:true },
    { href:'#',      icon:'fa-mobile-alt',      label: t('header.nav.downloadApp') || 'Descarga la app' },
    { to:'/register-restaurant',icon:'fa-utensils',        label: t('header.nav.registerRestaurant') || 'Registra tu restaurante', promo:true },
  ]

  const linkClasses = (promo) => 
    `flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all duration-200 text-left w-full hover:bg-gray-50 dark:hover:bg-slate-700 hover:pl-6 ${promo ? 'text-[#FF4B3E]' : 'text-gray-700 dark:text-gray-300 hover:text-[#FF4B3E]'}`;

  if (isLoading) {
    return (
      <>
        <header className="component-header fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 shadow-sm z-50 border-b border-gray-100 dark:border-slate-800">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
            </div>
            <div className="hidden sm:flex flex-1 max-w-lg">
              <div className="w-full h-10 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-full" />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-20 h-8 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-full" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 animate-pulse rounded-lg" />
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
      <header className="component-header fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 shadow-sm z-50 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-4">
          
          {/* IZQUIERDA: Hamburguesa + Logo */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-[#FF4B3E] transition flex-shrink-0"
              aria-label="Abrir menú">
              <i className="fas fa-bars text-lg font-bold" />
            </button>

            <Link to="/" onClick={goHomeTop} className="font-['Satisfy'] text-2xl sm:text-3xl font-bold text-[#FF4B3E] hover:text-[#e03a2d] transition whitespace-nowrap flex-shrink-0">
              AppiFood
            </Link>

            <button
              onClick={openAddressModal}
              className="hidden lg:flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap border border-gray-200 dark:border-slate-700 rounded-full px-3 py-1.5 hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition ml-1"
            >
              <i className="fas fa-map-marker-alt text-[#FF4B3E] text-xs" />
              <span className="max-w-[200px] truncate">{deliveryAddress}</span>
              <i className="fas fa-caret-down text-[10px] text-[#FF4B3E]" />
            </button>
          </div>

          {/* CENTRO: Buscador */}
          <div className="hidden md:flex flex-1 justify-center min-w-0 mx-2">
            <div className="w-full max-w-xl">
              <div className="w-full flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-2 border-2 border-transparent hover:border-[#FF4B3E] transition">
                <input
                  type="search"
                  placeholder={t('header.searchPlaceholder') || "¿Deseas algo en especial?"}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && doSearch()}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500"
                />
                <button onClick={doSearch}
                  className="w-8 h-8 rounded-full bg-[#FF4B3E] hover:bg-[#e03a2d] text-white flex items-center justify-center transition flex-shrink-0">
                  <i className="fas fa-search text-xs" />
                </button>
              </div>
            </div>
          </div>

          {/* DERECHA: Controles */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
            {!isAuth ? (
              <Link to="/login" className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#FF4B3E] text-white font-bold text-xs sm:text-sm shadow-md hover:bg-[#e03a2d] hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap">
                {t('header.login') || "Ingresar"}
              </Link>
            ) : (
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${isPremium ? 'bg-yellow-400 text-gray-900 shadow-sm' : 'bg-[#FF4B3E] text-white'}`}>
                    {getUserInitial()}
                  </div>
                  <i className={`fas fa-chevron-down text-xs text-gray-500 dark:text-gray-400 transition hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-[100]">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <span>{getUserName()}</span>
                        {isPremium && <i className="fas fa-crown text-yellow-500 text-xs" aria-hidden="true" />}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getUserEmail()}</p>
                    </div>
                    {[
                      ...(isAdmin ? [{ to:'/admin', icon:'fa-shield-alt', label: t('header.menu.adminPanel') || 'Panel Admin' }] : []),
                      { to:'/user/profile',   icon:'fa-user',           label: t('header.menu.profile') || 'Mi perfil' },
                      { to:'/user/orders',    icon:'fa-box',            label: t('header.menu.orders') || 'Mis pedidos' },
                      { to:'/user/favorites', icon:'fa-heart',          label: t('header.menu.favorites') || 'Favoritos' },
                      { to:'/user/gamification', icon:'fa-trophy',      label: t('header.menu.clubLoyalty') || 'Club de Fidelidad' },
                    ].map(({ to, icon, label }) => (
                      <Link key={label} to={to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                        <i className={`fas ${icon} text-gray-400 dark:text-gray-500 w-4`} /> {label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 dark:border-slate-700 my-2" />
                    <button onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[#FF4B3E] transition text-left">
                      <i className="fas fa-sign-out-alt w-4" /> {t('header.logout') || "Cerrar sesión"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setIsOpen(true)}
              className="relative w-10 h-10 rounded-lg bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-[#FF4B3E] flex items-center justify-center transition">
              <i className="fas fa-shopping-cart text-lg" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FF4B3E] text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── OVERLAY DRAWER ── */}
      <div 
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 bg-black/55 z-[60] transition-all duration-300 ${drawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      />

      {/* ── DRAWER ── */}
      <nav className={`fixed top-16 left-0 w-[300px] h-[calc(100vh-64px)] bg-white dark:bg-slate-900 z-[61] flex flex-col overflow-y-auto transform transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <span className="font-satisfy text-2xl text-[#FF4B3E] font-bold">AppiFood</span>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[#FF4B3E] transition"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {isAuth && effectiveUser && (
          <div className="flex flex-col items-center gap-2 p-6 bg-[#fff5f4] dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-[#FF4B3E] text-white font-black text-2xl flex items-center justify-center flex-shrink-0 mb-2">
              {getUserInitial()}
            </div>
            <div className="text-center">
              <span className="block font-bold text-base text-gray-900 dark:text-gray-100 mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <span>{getUserName()}</span>
                  {isPremium && <i className="fas fa-crown text-yellow-500 text-xs" aria-hidden="true" />}
                </span>
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {getUserEmail()}
              </span>
            </div>
          </div>
        )}

        <div className="p-4 border-b border-gray-100 dark:border-slate-800 md:hidden space-y-3">
          <div className="w-full flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-2 border border-transparent focus-within:border-[#FF4B3E] transition">
            <input
              type="search"
              placeholder={t('header.searchPlaceholder') || "¿Deseas algo en especial?"}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              className="flex-1 bg-transparent outline-none text-xs text-gray-700 dark:text-gray-200 placeholder-gray-500"
            />
            <button onClick={doSearch}
              className="w-7 h-7 rounded-full bg-[#FF4B3E] hover:bg-[#e03a2d] text-white flex items-center justify-center transition flex-shrink-0">
              <i className="fas fa-search text-[10px]" />
            </button>
          </div>

          <button
            onClick={() => { setDrawerOpen(false); openAddressModal(); }}
            className="w-full flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <i className="fas fa-map-marker-alt text-[#FF4B3E]" />
              <span className="truncate max-w-[180px]">{deliveryAddress}</span>
            </div>
            <i className="fas fa-chevron-right text-[10px] text-gray-400" />
          </button>
        </div>

        <div className="flex-1">
          {NAV_LINKS.map((item, i) => {
            if (item.section) return (
              <div key={i} className={`px-5 pt-4 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 ${i > 0 ? 'border-t border-gray-100 dark:border-slate-800 mt-2' : ''}`}>
                {item.section}
              </div>
            )
            const classes = linkClasses(item.promo)
            if (item.to) return (
              <Link key={item.label} to={item.to} className={classes}
                onClick={item.to === '/' ? goHomeTop : () => setDrawerOpen(false)}>
                <i className={`fas ${item.icon} w-[18px] text-center text-gray-400 dark:text-gray-500 text-sm`} />
                {item.label}
              </Link>
            )
            return (
              <a key={item.label} href={item.href} className={classes}
                onClick={() => setDrawerOpen(false)}>
                <i className={`fas ${item.icon} w-[18px] text-center text-gray-400 dark:text-gray-500 text-sm`} />
                {item.label}
              </a>
            )
          })}
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2.5">
          {!isAuth ? (
            <Link 
              to="/login" 
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-center gap-2 py-3 bg-[#FF4B3E] hover:bg-[#e03a2d] text-white rounded-full font-bold text-sm transition-all shadow-md"
            >
              <i className="fas fa-sign-in-alt" /> {t('header.login') || "Ingresar"}
            </Link>
          ) : (
            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 dark:border-slate-700 hover:border-red-100 dark:hover:border-red-800 hover:bg-red-50/50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-[#FF4B3E] rounded-full text-sm font-semibold transition"
            >
              <i className="fas fa-sign-out-alt" /> {t('header.logout') || "Cerrar sesión"}
            </button>
          )}
        </div>
      </nav>

      {/* ── ADDRESS MODAL ── */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-[90] bg-black/35 flex items-start justify-center pt-10 px-4" onClick={closeAddressModal}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
              <button onClick={closeAddressModal} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300">
                <i className="fas fa-arrow-left" />
              </button>
              <input
                value={tempAddress}
                onChange={e => setTempAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveAddress()}
                placeholder={t('header.address.placeholder') || "Escribe la dirección de entrega"}
                className="flex-1 border-2 border-blue-400 dark:border-blue-600 rounded-xl px-4 py-2.5 text-sm outline-none bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
              />
            </div>

            <div className="max-h-[420px] overflow-y-auto bg-gray-50 dark:bg-slate-800/50">
              {addressesLoading ? (
                <div className="p-5 text-center text-sm text-gray-500 dark:text-gray-400">{t('header.address.loading') || "Cargando direcciones..."}</div>
              ) : isAuth && savedAddresses.length > 0 ? (
                savedAddresses.map((address) => (
                  <div key={address.id} className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-start gap-3">
                    <button
                      onClick={() => selectAddress(address)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAddressId === address.id ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 dark:border-slate-600 text-transparent'}`}
                    >
                      <i className="fas fa-check text-xs" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{address.address}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{address.name || 'Popayán'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEditAddress(address)} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400">
                        <i className="fas fa-pen" />
                      </button>
                      <button onClick={() => removeAddress(address.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500">
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-sm text-gray-500 dark:text-gray-400">{t('header.address.empty') || "No tienes direcciones guardadas."}</div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 p-4">
              {addressesError && <p className="text-xs text-red-500 mb-2">{addressesError}</p>}
              <button onClick={useCurrentLocation} className="w-full text-emerald-500 font-bold py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
                <i className="fas fa-location-arrow mr-2" /> {t('header.address.currentLocation') || "Usar mi ubicación actual"}
              </button>
              <button onClick={saveAddress} disabled={addressSaving} className="mt-2 w-full bg-[#FF4B3E] hover:bg-[#e03a2d] text-white font-bold py-2.5 rounded-xl transition disabled:opacity-60">
                {addressSaving ? (t('header.address.saving') || 'Guardando...') : editingAddressId ? (t('header.address.update') || 'Actualizar dirección') : (t('header.address.save') || 'Guardar dirección')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isGmailUserMissingInfo && (
        <div className="fixed top-16 left-0 right-0 bg-amber-500 text-white font-bold text-xs sm:text-sm px-4 py-3 shadow-md flex items-center justify-between gap-4 animate-fade-in z-40 border-b border-amber-600">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-base animate-pulse flex-shrink-0" />
            <span className="leading-snug">{t('validation.gmail_missing_info_warning')}</span>
          </div>
          <Link 
            to="/user/profile" 
            className="flex-shrink-0 bg-white hover:bg-amber-50 text-amber-600 font-black px-4 py-2 rounded-xl transition shadow-sm uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap"
          >
            {t('validation.gmail_missing_info_button')}
          </Link>
        </div>
      )}

      <div style={{ height: isGmailUserMissingInfo ? 116 : 64 }} />
    </>
  )
}