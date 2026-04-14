import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchJson } from '../api/fetchJson'
import SubscriptionTab from '../components/SubscriptionTab'
import { useOrderStore } from '../store/orderStore'

const C = {
  red: '#FF4B3E',
  redDk: '#e03a2d',
  green: '#00922b',
  border: '#dedbdb',
  bg: '#fafaf8',
  white: '#ffffff',
  text: '#2c2c2c',
  muted: '#9aa0a6',
  shadow: '0 4px 16px rgba(0,0,0,0.10)',
}

const SIDEBAR_ITEMS = [
  { key: 'info', label: 'Información de tu cuenta' },
  { key: 'subscription', label: 'Suscripción' },
  { key: 'payments', label: 'Pagos' },
  { key: 'notifications', label: 'Centro de notificaciones' },
  { key: 'orders', label: 'Últimas Órdenes' },
  { key: 'help', label: 'Centro de ayuda' },
  { key: 'delete', label: 'Eliminar Cuenta', danger: true },
]

const PAYMENT_PROVIDERS = [
  { value: 'visa', label: 'Visa', accent: 'VISA', description: 'Tarjeta internacional' },
  { value: 'mastercard', label: 'Mastercard', accent: 'MC', description: 'Tarjeta de crédito o débito' },
  { value: 'paypal', label: 'PayPal', accent: 'PP', description: 'Cuenta y tarjeta asociada' },
]

const INPUT_STYLE = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  background: '#fff',
  color: C.text,
  padding: '12px 14px',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'U'
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('') || 'U'
}

function formatCardNumber(value) {
  const digits = String(value || '').replace(/\D+/g, '').slice(0, 16)
  if (!digits) return '•••• •••• •••• ••••'
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function getProviderTheme(provider) {
  if (provider === 'mastercard') {
    return {
      background: 'linear-gradient(135deg, #ffb347 0%, #ff7a18 52%, #d84315 100%)',
      foreground: '#ffffff',
      accent: '#111111',
      accent2: '#f7f7f7',
    }
  }

  if (provider === 'paypal') {
    return {
      background: 'linear-gradient(135deg, #e8f2ff 0%, #d9e9ff 45%, #bcd3ff 100%)',
      foreground: '#113a78',
      accent: '#003087',
      accent2: '#009cde',
    }
  }

  return {
    background: 'linear-gradient(135deg, #243fb4 0%, #172b86 46%, #2f61d3 100%)',
    foreground: 'white',
    accent: 'VISA',
    accent2: 'Tarjeta internacional',
  }
}

export default function UserProfilePage({ user, onLogout, onUpdateProfile }) {
  const navigate = useNavigate()
  const {
    orders,
    isLoading: ordersLoading,
    error: ordersError,
    fetchOrders,
    clearError: clearOrdersError,
  } = useOrderStore()

  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    provider: 'visa',
    holder_name: '',
    card_number: '',
    exp_month: '',
    exp_year: '',
    cvv: '',
    is_default: false,
  })

  const [form, setForm] = useState({
    first_name: user?.name?.split(' ')[0] ?? 'Camilo',
    last_name: user?.name?.split(' ')[1] ?? 'Acosta',
    email: user?.email ?? 'ejemplo@gmail.com',
    phone: user?.phone ?? '3123456789',
    id_type: user?.id_type ?? 'cc',
    id_number: user?.id_number ?? '',
    birth_date: user?.birth_date ?? '',
    gender: user?.gender ?? 'male',
  })

  const initials = useMemo(() => getInitials(user?.name || `${form.first_name} ${form.last_name}`), [user?.name, form.first_name, form.last_name])
  const fullName = useMemo(() => `${form.first_name || ''} ${form.last_name || ''}`.trim() || user?.name || 'Usuario', [form.first_name, form.last_name, user?.name])

  const change = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        id_type: form.id_type,
        id_number: form.id_number,
        birth_date: form.birth_date,
        gender: form.gender,
      }

      const updated = await fetchJson('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (typeof onUpdateProfile === 'function') {
        onUpdateProfile(updated)
      }

      setSuccess(true)
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetchJson('/api/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowDeleteModal(false)
      if (typeof onLogout === 'function') onLogout()
      navigate('/')
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar la cuenta')
    }
  }

  const openAddPaymentForm = () => {
    setPaymentError(null)
    setPaymentForm({
      provider: 'visa',
      holder_name: '',
      card_number: '',
      exp_month: '',
      exp_year: '',
      cvv: '',
      is_default: false,
    })
    setShowPaymentForm(true)
  }

  const handlePaymentFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setPaymentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const submitPaymentForm = async (e) => {
    e.preventDefault()
    setPaymentSaving(true)
    setPaymentError(null)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        type: 'card',
        provider: paymentForm.provider,
        holder_name: paymentForm.holder_name,
        card_number: paymentForm.card_number,
        exp_month: paymentForm.exp_month,
        exp_year: paymentForm.exp_year,
        cvv: paymentForm.cvv,
        is_default: paymentForm.is_default,
      }

      await fetchJson('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      setShowPaymentForm(false)
    } catch (err) {
      setPaymentError(err?.message || 'No se pudo guardar la tarjeta')
    } finally {
      setPaymentSaving(false)
    }
  }

  const providerTheme = getProviderTheme(paymentForm.provider)
  const providerMeta = PAYMENT_PROVIDERS.find(item => item.value === paymentForm.provider) || PAYMENT_PROVIDERS[0]
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : []

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders().catch(() => {})
    }
  }, [activeTab, fetchOrders])

  const formatOrderDate = (value) => {
    if (!value) return 'Fecha no disponible'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getOrderStatusLabel = (status) => {
    const map = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      on_the_way: 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    }
    return map[status] || status || 'Sin estado'
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
        <aside style={{ background: C.white, borderRadius: 12, boxShadow: C.shadow, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.red, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, flexShrink: 0, boxShadow: '0 4px 12px rgba(255,75,62,0.3)' }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: C.muted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Mi perfil</p>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</h2>
              <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.email}</p>
            </div>
          </div>

          <nav style={{ padding: '12px 8px' }}>
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => item.key === 'delete' ? setShowDeleteModal(true) : setActiveTab(item.key)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 16px',
                  background: activeTab === item.key ? '#fff5f4' : 'none',
                  border: 'none',
                  borderLeft: activeTab === item.key ? `4px solid ${C.red}` : '4px solid transparent',
                  borderRadius: 8,
                  marginBottom: 4,
                  fontSize: 14,
                  fontWeight: 600,
                  color: item.danger ? C.red : activeTab === item.key ? C.red : C.text,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (activeTab !== item.key) e.currentTarget.style.background = '#f5f5f5' }}
                onMouseLeave={e => { if (activeTab !== item.key) e.currentTarget.style.background = 'none' }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '8px 16px 20px' }}>
            <button
              type="button"
              onClick={onLogout}
              style={{ width: '100%', padding: '10px', border: `1.5px solid ${C.border}`, borderRadius: 8, background: 'white', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <i className="fas fa-sign-out-alt" style={{ fontSize: 13 }} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <section style={{ background: C.white, borderRadius: 12, boxShadow: C.shadow, padding: '2.5rem' }}>
          {activeTab === 'info' && (
            <>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, color: '#000', marginBottom: 28 }}>Información de tu cuenta</h2>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                  <i className="fas fa-exclamation-circle" />
                  {error}
                </div>
              )}

              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#16a34a', fontSize: 14 }}>
                  <i className="fas fa-check-circle" />
                  ¡Cambios guardados correctamente!
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  {[
                    { label: 'Nombre(s)', name: 'first_name', type: 'text', placeholder: 'Tu nombre' },
                    { label: 'Apellido(s)', name: 'last_name', type: 'text', placeholder: 'Tu apellido' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{label}</label>
                      <input type={type} name={name} value={form[name]} onChange={change} placeholder={placeholder} style={INPUT_STYLE} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  {[
                    { label: 'Correo Electrónico', name: 'email', type: 'email', placeholder: 'correo@ejemplo.com' },
                    { label: 'Celular', name: 'phone', type: 'tel', placeholder: '3001234567' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{label}</label>
                      <input type={type} name={name} value={form[name]} onChange={change} placeholder={placeholder} style={INPUT_STYLE} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>Tipo de documento</label>
                    <select name="id_type" value={form.id_type} onChange={change} style={INPUT_STYLE}>
                      <option value="cc">Cédula de Ciudadanía</option>
                      <option value="ti">Tarjeta de Identidad</option>
                      <option value="ce">Cédula de Extranjería</option>
                      <option value="pp">Pasaporte</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>Número de documento</label>
                    <input type="text" name="id_number" value={form.id_number} onChange={change} placeholder="1234567890" style={INPUT_STYLE} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>Fecha de nacimiento</label>
                    <input type="date" name="birth_date" value={form.birth_date} onChange={change} style={INPUT_STYLE} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, display: 'block', fontFamily: 'Nunito, sans-serif' }}>Género</label>
                  <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                    {[['male', 'Masculino'], ['female', 'Femenino'], ['other', 'Prefiero no decir']].map(([val, lbl]) => (
                      <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                        <input type="radio" name="gender" value={val} checked={form.gender === val} onChange={change} style={{ accentColor: C.red, width: 16, height: 16 }} />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '10px 24px', border: `1.5px solid ${C.green}`, background: 'white', color: C.green, borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.green; e.currentTarget.style.color = 'white' } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = C.green }}
                  >
                    {loading ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : <><i className="fas fa-save" /> Guardar cambios</>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ padding: '10px 20px', border: '1.5px solid rgba(255,75,62,0.4)', background: 'white', color: C.red, borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = C.red }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(255,75,62,0.4)' }}
                  >
                    <i className="fas fa-trash-alt" /> Eliminar Cuenta
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Últimas Órdenes</h2>

              {ordersError && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                  <span>{ordersError}</span>
                  <button type="button" onClick={clearOrdersError} style={{ border: 'none', background: 'transparent', color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                </div>
              )}

              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted }}>
                  <span style={{ display: 'inline-block', width: 34, height: 34, borderRadius: '50%', border: '3px solid #ffd8d4', borderTopColor: C.red, animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ marginTop: 12, fontWeight: 600 }}>Cargando órdenes...</p>
                </div>
              ) : recentOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => navigate(`/user/orders/${order.id}`)}
                      style={{ width: '100%', textAlign: 'left', border: `1px solid ${C.border}`, borderRadius: 12, background: '#fff', padding: '14px 16px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, color: C.text }}>Pedido #{order.id}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>{order.restaurant_name || order.restaurant?.name || 'Restaurante'}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>{formatOrderDate(order.created_at)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>{getOrderStatusLabel(order.status)}</p>
                          <p style={{ margin: '6px 0 0', fontWeight: 800, color: C.red }}>${Number(order.total || 0).toLocaleString('es-CO')}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => navigate('/user/orders')}
                    style={{ marginTop: 6, border: 'none', background: '#fff0ed', color: C.red, borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Ver todas mis órdenes
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
                  <span style={{ fontSize: 48 }}>📦</span>
                  <p style={{ marginTop: 12, fontWeight: 600 }}>No tienes órdenes recientes</p>
                  <Link to="/restaurants" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 24px', background: C.red, color: 'white', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                    <i className="fas fa-store" /> Ir a restaurantes
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscription' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, color: '#000', marginBottom: 28 }}>Mi Suscripción</h2>
              <SubscriptionTab user={user} />
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, fontWeight: 800, margin: '0 0 6px' }}>Métodos de pago</p>
                  <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 26, fontWeight: 900, margin: 0, color: C.text }}>Pagos</h2>
                  <p style={{ margin: '8px 0 0', color: C.muted, fontSize: 14 }}>Añade una tarjeta y completa los datos que normalmente pide el banco o la pasarela.</p>
                </div>

                <button
                  type="button"
                  onClick={openAddPaymentForm}
                  style={{
                    border: 'none',
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${C.red} 0%, ${C.redDk} 100%)`,
                    color: 'white',
                    padding: '14px 18px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 12px 24px rgba(255,75,62,0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <i className="fas fa-credit-card" />
                  Agregar tarjeta
                </button>
              </div>

              <div style={{ border: `1px dashed ${C.border}`, borderRadius: 18, background: '#fff', padding: '28px', textAlign: 'center', color: C.muted }}>
                <div style={{ fontSize: 42, marginBottom: 10 }}>💳</div>
                <p style={{ margin: 0, fontWeight: 700 }}>No se muestran tarjetas guardadas en esta vista.</p>
                <p style={{ margin: '6px 0 0', fontSize: 14 }}>Usa el botón de arriba para registrar una nueva tarjeta.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Centro de notificaciones</h2>
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
                <span style={{ fontSize: 48 }}>🔔</span>
                <p style={{ marginTop: 12, fontWeight: 600 }}>No tienes notificaciones nuevas</p>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Centro de ayuda</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '📞', title: 'Llámanos', desc: '+57 300 123 4567 · Lun–Dom 8am–10pm' },
                  { icon: '📧', title: 'Escríbenos', desc: 'AppiFood@gmail.com' },
                  { icon: '💬', title: 'Chat en vivo', desc: 'Disponible en la app' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#fafafa', borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 28 }}>{icon}</span>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>{title}</p>
                      <p style={{ color: C.muted, fontSize: 13, margin: '2px 0 0' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {showPaymentForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.58)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}
          onClick={e => e.target === e.currentTarget && setShowPaymentForm(false)}
        >
          <div style={{ width: '100%', maxWidth: 760, borderRadius: 22, background: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 800, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Método de pago</p>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text }}>Agregar tarjeta</h3>
              </div>
              <button type="button" onClick={() => setShowPaymentForm(false)} style={{ border: 'none', background: 'transparent', fontSize: 18, fontWeight: 900, color: C.muted, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: 22, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 18 }}>
              <div style={{ borderRadius: 18, padding: 18, background: providerTheme.background, color: providerTheme.foreground, minHeight: 230, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.9 }}>{providerMeta.label}</div>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', fontWeight: 900 }}>+</div>
                </div>
                <div>
                  <div style={{ fontSize: 46, fontWeight: 900, fontStyle: 'italic', lineHeight: 1, letterSpacing: '-0.08em' }}>{providerMeta.accent}</div>
                  <p style={{ margin: '12px 0 0', opacity: 0.92 }}>{providerMeta.description}. Completa los datos para guardar la tarjeta y usarla más rápido al pagar.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.08em' }}>{formatCardNumber(paymentForm.card_number)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, fontWeight: 700, opacity: 0.95 }}>
                    <span>{paymentForm.holder_name || 'NOMBRE DEL TITULAR'}</span>
                    <span>{paymentForm.exp_month || 'MM'}/{paymentForm.exp_year || 'AA'}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={submitPaymentForm} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {paymentError && (
                  <div style={{ padding: '10px 12px', borderRadius: 10, background: '#fff5f5', color: '#dc2626', border: '1px solid #fca5a5', fontSize: 13, fontWeight: 600 }}>
                    {paymentError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>Proveedor</label>
                  <select name="provider" value={paymentForm.provider} onChange={handlePaymentFormChange} style={INPUT_STYLE}>
                    {PAYMENT_PROVIDERS.map(provider => (
                      <option key={provider.value} value={provider.value}>{provider.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>Titular</label>
                  <input name="holder_name" value={paymentForm.holder_name} onChange={handlePaymentFormChange} placeholder="Nombre del titular" style={INPUT_STYLE} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>Número de tarjeta</label>
                  <input name="card_number" value={paymentForm.card_number} onChange={handlePaymentFormChange} placeholder="4111111111111111" style={INPUT_STYLE} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>Mes</label>
                    <input name="exp_month" value={paymentForm.exp_month} onChange={handlePaymentFormChange} placeholder="MM" maxLength={2} inputMode="numeric" style={INPUT_STYLE} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>Año</label>
                    <input name="exp_year" value={paymentForm.exp_year} onChange={handlePaymentFormChange} placeholder="YY" maxLength={2} inputMode="numeric" style={INPUT_STYLE} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>CVV</label>
                    <input name="cvv" value={paymentForm.cvv} onChange={handlePaymentFormChange} placeholder="123" maxLength={4} inputMode="numeric" style={INPUT_STYLE} />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text, cursor: 'pointer', marginTop: 4 }}>
                  <input type="checkbox" name="is_default" checked={paymentForm.is_default} onChange={handlePaymentFormChange} />
                  Establecer como principal
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowPaymentForm(false)} style={{ border: `1px solid ${C.border}`, borderRadius: 14, background: '#fff', padding: '12px 16px', fontWeight: 800, cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" disabled={paymentSaving} style={{ border: 'none', borderRadius: 14, background: `linear-gradient(135deg, ${C.red} 0%, ${C.redDk} 100%)`, color: '#fff', padding: '12px 18px', fontWeight: 900, cursor: paymentSaving ? 'not-allowed' : 'pointer', opacity: paymentSaving ? 0.7 : 1, boxShadow: '0 12px 24px rgba(255,75,62,0.25)' }}>
                    {paymentSaving ? 'Guardando...' : 'Guardar tarjeta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>⚠️</span>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '12px 0 8px' }}>¿Eliminar tu cuenta?</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>Esta acción es irreversible. Se eliminarán todos tus datos, historial de pedidos y favoritos.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', border: `1.5px solid ${C.border}`, borderRadius: 8, background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 8, background: C.red, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
