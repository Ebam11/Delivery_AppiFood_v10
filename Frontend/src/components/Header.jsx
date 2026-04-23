// Archivo: src/components/Header.jsx | Comentario: logica principal del modulo.
// src/components/Header.jsx - Versión completa corregida
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { api } from '../api/client'

const RED = '#FF4B3E'
const RED_DK = '#e03a2d'

export default function Header({ isAuth, user, onLogout, isLoading }) {
  console.log('🎯 Header received:', { 
    isAuth, 
    isLoading,
    user: user ? JSON.stringify(user) : 'null' 
  })
  
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState(() => localStorage.getItem('selected_delivery_address') || 'Calle 15 # 17 - 418')
  const [tempAddress, setTempAddress] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState('')
  const [addressSaving, setAddressSaving] = useState(false)
  const [search, setSearch]             = useState('')
  const { count, setIsOpen }            = useCart()
  const navigate  = useNavigate()
  const location  = useLocation()
  const userRef   = useRef(null)

  // FUNCIONES AUXILIARES - DEFINIDAS AL PRINCIPIO
  const getUserName = () => {
    if (!user) {
      console.log('👤 getUserName: user is null/undefined')
      return 'Usuario'
    }
    console.log('👤 getUserName: user object:', user)
    console.log('👤 getUserName: user.name =', user.name)
    console.log('👤 getUserName: user.nombre =', user.nombre)
    console.log('👤 getUserName: all keys =', Object.keys(user))
    const result = user.name || user.nombre || user.displayName || user.username || 'Usuario'
    console.log('👤 getUserName returning:', result)
    return result
  }

  const getUserEmail = () => {
    if (!user) {
      console.log('📧 getUserEmail: user is null/undefined')
      return ''
    }
    console.log('📧 getUserEmail: checking user.email =', user.email)
    const result = user.email || user.correo || user.mail || ''
    console.log('📧 getUserEmail returning:', result)
    return result
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
    document.body.style.overflow = (drawerOpen || addressModalOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen, addressModalOpen])

  useEffect(() => {
    const fn = e => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Cerrar drawer al cambiar de ruta
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
    } catch (error) {
      setAddressesError('No se pudieron cargar las direcciones')
    } finally {
      setAddressesLoading(false)
    }
  }

  useEffect(() => {
    if (addressModalOpen) {
      fetchSavedAddresses()
    }
  }, [addressModalOpen])

  const saveAddress = async () => {
    const nextAddress = tempAddress.trim() || deliveryAddress
    if (!nextAddress) return

    try {
      setAddressSaving(true)
      setAddressesError('')

      if (isAuth) {
        let targetAddressId = selectedAddressId

        if (editingAddressId) {
          await api.put(`/addresses/${editingAddressId}`, {
            name: 'Dirección',
            address: nextAddress,
            lat: null,
            lng: null,
          })
          targetAddressId = editingAddressId
        } else {
          const selected = savedAddresses.find((address) => address.id === selectedAddressId)
          const isSameSelected = selected && selected.address === nextAddress

          if (!isSameSelected) {
            const created = await api.post('/addresses', {
              name: 'Dirección',
              address: nextAddress,
              lat: null,
              lng: null,
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
      setAddressModalOpen(false)
    } catch (error) {
      setAddressesError('No se pudo guardar la dirección')
    } finally {
      setAddressSaving(false)
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextAddress = `Ubicación actual (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`
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
      const nextList = savedAddresses.filter((address) => address.id !== addressId)
      setSavedAddresses(nextList)

      if (selectedAddressId === addressId) {
        const fallback = nextList[0] || null
        setSelectedAddressId(fallback?.id || null)
        setTempAddress(fallback?.address || '')
      }
    } catch (error) {
      setAddressesError('No se pudo eliminar la dirección')
    }
  }

  const NAV_LINKS = [
    { section:'DESCUBRIR' },
    { to:'/',            icon:'fa-home',          label:'Inicio' },
    { to:'/restaurants', icon:'fa-store',         label:'Restaurantes' },
    ...(isAuth ? [
      { section:'MI CUENTA' },
      ...(isAdmin ? [{ to:'/admin', icon:'fa-shield-alt', label:'Panel Admin', promo:true }] : []),
      { to:'/user/orders',    icon:'fa-box',            label:'Mis pedidos' },
      { to:'/user/favorites', icon:'fa-heart',          label:'Mis favoritos' },
      { to:'/user/profile',   icon:'fa-user-cog',       label:'Mi perfil' },
    ] : []),
    { section:'SUSCRIPCIONES' },
    { to:'/subscription', icon:'fa-crown',        label:'Planes de Suscripción', promo:true },
    { section:'OFERTAS' },
    { to:'/coupons', icon:'fa-tag',           label:'Cupones disponibles', promo:true },
    { section:'AYUDA' },
    { to:'/help-center', icon:'fa-question-circle', label:'Centro de ayuda', promo:true },
    { to:'/support', icon:'fa-headset',         label:'Chat de soporte', promo:true },
    { href:'#',      icon:'fa-mobile-alt',      label:'Descarga la app' },
    { to:'/register-restaurant',icon:'fa-utensils',        label:'Registra tu restaurante', promo:true },
  ]

  const linkStyle = (promo) => ({
    display:'flex', alignItems:'center', gap:12,
    padding:'11px 20px', fontSize:14, fontWeight:500,
    color: promo ? RED : '#333',
    textDecoration:'none', cursor:'pointer',
    border:'none', background:'none', width:'100%', textAlign:'left',
    fontFamily:'inherit', transition:'padding-left 0.15s, background 0.15s',
  })

  // Si está cargando, mostrar un header skeleton
  if (isLoading) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 border-b border-gray-100">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* IZQUIERDA: Hamburguesa + Logo skeleton */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded" />
            </div>

            {/* CENTRO: Buscador skeleton */}
            <div className="hidden sm:flex flex-1 max-w-lg">
              <div className="w-full h-10 bg-gray-200 animate-pulse rounded-full" />
            </div>

            {/* DERECHA: Usuario + Carrito skeleton */}
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
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          
          {/* IZQUIERDA: Hamburguesa + Logo */}
          <div className="flex items-center gap-4 flex-1 min-w-0 lg:max-w-[560px]">
          {/* Hamburguesa */}
            <button onClick={() => setDrawerOpen(true)}
              className="block w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 hover:text-[#FF4B3E] transition flex-shrink-0">
              <i className="fas fa-bars text-lg font-bold" />
            </button>

            {/* Logo */}
            <Link to="/" onClick={goHomeTop} className="font-['Satisfy'] text-3xl font-bold text-[#FF4B3E] hover:text-[#e03a2d] transition whitespace-nowrap flex-shrink-0">
              AppiFood
            </Link>

            {/* Dirección */}
            <button
              onClick={openAddressModal}
              className="hidden sm:flex items-center gap-2 text-xs text-gray-600 whitespace-nowrap border border-gray-200 rounded-full px-3 py-1.5 hover:border-[#FF4B3E] hover:text-[#FF4B3E] transition ml-1"
            >
              <i className="fas fa-map-marker-alt text-[#FF4B3E] text-xs" />
              <span className="max-w-[260px] truncate">{deliveryAddress}</span>
              <i className="fas fa-caret-down text-[10px] text-[#FF4B3E]" />
            </button>
          </div>

          {/* CENTRO: Buscador */}
          <div className="hidden sm:flex flex-[2] justify-center min-w-0">
            <div className="w-full max-w-3xl">
              <div className="w-full flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border-2 border-transparent hover:border-[#FF4B3E] transition">
              <input
                type="search"
                placeholder="¿Deseas algo en especial?"
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
          </div>

          {/* DERECHA: Usuario + Carrito */}
          <div className="flex items-center justify-end gap-3 flex-1 min-w-0 lg:max-w-[420px]">
            {!isAuth ? (
              <>
                <Link to="/login" className="hidden sm:inline-block px-4 py-2 rounded-full border-2 border-[#FF4B3E] text-[#FF4B3E] font-bold text-xs hover:bg-red-50 transition">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-[#FF4B3E] text-white font-bold text-xs hover:bg-[#e03a2d] transition">
                  Registrarse
                </Link>
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
                      ...(isAdmin ? [{ to:'/admin', icon:'fa-shield-alt', label:'Panel Admin' }] : []),
                      { to:'/user/profile',   icon:'fa-user',           label:'Mi perfil' },
                      { to:'/user/orders',    icon:'fa-box',            label:'Mis pedidos' },
                      { to:'/user/favorites', icon:'fa-heart',          label:'Favoritos' },
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
                      <i className="fas fa-sign-out-alt w-4" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Carrito */}
            <button onClick={() => setIsOpen(true)}
              className="relative w-10 h-10 rounded-lg bg-white text-gray-600 hover:text-[#FF4B3E] flex items-center justify-center transition">
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
        boxShadow:'none',
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

        {/* Perfil auth - SECCIÓN CORREGIDA */}
        {isAuth && user && (
          <div style={{ 
            display:'flex', 
            flexDirection:'column',
            alignItems:'center', 
            gap:8, 
            padding:'24px 20px', 
            background:'#fff5f4', 
            borderBottom:'1px solid #f0f0f0'
          }}>
            {console.log('🎨 DRAWER: Rendering user profile section')}
            {console.log('🎨 DRAWER: isAuth =', isAuth, ', user =', user)}
            <div style={{ 
              width:64, 
              height:64, 
              borderRadius:'50%', 
              background:RED, 
              color:'white', 
              fontWeight:800, 
              fontSize:24, 
              display:'flex', 
              alignItems:'center', 
              justifyContent:'center', 
              flexShrink:0,
              marginBottom:8
            }}>
              {getUserInitial()}
            </div>
            <div style={{ textAlign:'center' }}>
              <span style={{ 
                display:'block', 
                fontWeight:700, 
                fontSize:16, 
                color:'#111',
                marginBottom:4
              }}>
                {getUserName()} {/* ← Esto debe mostrar "Camilo Acosta" */}
              </span>
              <span style={{ 
                display:'block', 
                fontSize:13, 
                color:'#666'
              }}>
                {getUserEmail()} {/* ← Esto debe mostrar "ejemplo@gmail.com" */}
              </span>
            </div>
          </div>
        )}

        {/* Links */}
        <div style={{ flex:1 }}>
          {NAV_LINKS.map((item, i) => {
            if (item.section) return (
              <div key={i} style={{ 
                padding:'16px 20px 8px', 
                fontSize:12, 
                fontWeight:700, 
                textTransform:'uppercase', 
                letterSpacing:'0.05em', 
                color:'#999',
                borderTop: i > 0 ? '1px solid #f0f0f0' : 'none',
                marginTop: i > 0 ? 8 : 0
              }}>
                {item.section}
              </div>
            )
            const style = linkStyle(item.promo)
            if (item.to) return (
              <Link key={item.label} to={item.to} style={style}
                onClick={item.to === '/' ? goHomeTop : () => setDrawerOpen(false)}
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
          {!isAuth ? (
            <>
              <Link to="/register" onClick={() => setDrawerOpen(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:RED, color:'white', borderRadius:999, fontWeight:700, fontSize:14, textDecoration:'none' }}>
                <i className="fas fa-user-plus" /> Registrarse gratis
              </Link>
              <Link to="/login" onClick={() => setDrawerOpen(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'12px', border:`2px solid ${RED}`, color:RED, borderRadius:999, fontWeight:700, fontSize:14, textDecoration:'none' }}>
                Iniciar sesión
              </Link>
            </>
          ) : (
            <button onClick={onLogout}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px', background:'none', border:'1.5px solid #e5e5e5', borderRadius:999, fontSize:14, fontWeight:600, color:'#888', cursor:'pointer', fontFamily:'inherit' }}>
              <i className="fas fa-sign-out-alt" /> Cerrar sesión
            </button>
          )}
        </div>
      </nav>

      {addressModalOpen && (
        <div className="fixed inset-0 z-[90] bg-black/35 flex items-start justify-center pt-10 px-4" onClick={closeAddressModal}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <button onClick={closeAddressModal} className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-600">
                <i className="fas fa-arrow-left" />
              </button>
              <input
                value={tempAddress}
                onChange={e => setTempAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveAddress()}
                placeholder="Escribe la dirección de entrega"
                className="flex-1 border-2 border-blue-400 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>

            <div className="max-h-[420px] overflow-y-auto bg-gray-50">
              {addressesLoading ? (
                <div className="p-5 text-center text-sm text-gray-500">Cargando direcciones...</div>
              ) : isAuth && savedAddresses.length > 0 ? (
                savedAddresses.map((address) => (
                  <div key={address.id} className="px-4 py-3 border-b border-gray-200 bg-white flex items-start gap-3">
                    <button
                      onClick={() => selectAddress(address)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAddressId === address.id ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-transparent'}`}
                    >
                      <i className="fas fa-check text-xs" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{address.address}</p>
                      <p className="text-xs text-gray-500 truncate">{address.name || 'Popayán'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEditAddress(address)} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500">
                        <i className="fas fa-pen" />
                      </button>
                      <button onClick={() => removeAddress(address.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500">
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-sm text-gray-500">No tienes direcciones guardadas.</div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4">
              {addressesError && <p className="text-xs text-red-500 mb-2">{addressesError}</p>}
              <button onClick={useCurrentLocation} className="w-full text-emerald-500 font-bold py-2.5 rounded-xl hover:bg-emerald-50 transition">
                <i className="fas fa-location-arrow mr-2" /> Usar mi ubicación actual
              </button>
              <button onClick={saveAddress} disabled={addressSaving} className="mt-2 w-full bg-[#FF4B3E] hover:bg-[#e03a2d] text-white font-bold py-2.5 rounded-xl transition disabled:opacity-60">
                {addressSaving ? 'Guardando...' : editingAddressId ? 'Actualizar dirección' : 'Guardar dirección'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Espacio para header fijo */}
      <div style={{ height:64 }} />
    </>
  )
}