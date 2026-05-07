// Archivo: src/pages/Profile.jsx | Comentario: logica principal del modulo.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchJson } from '../api/fetchJson'
import SubscriptionTab from '../components/SubscriptionTab'
import NotificationsTab from '../components/NotificationsTab'
import PaymentMethodsTab from '../components/PaymentMethodsTab'
import './Profile.css'

const C = {
  red:    '#FF4B3E',
  redDk:  '#e03a2d',
  green:  '#00922b',
  border: '#dedbdb',
  bg:     '#fafaf8',
  white:  '#ffffff',
  text:   '#2c2c2c',
  muted:  '#9aa0a6',
  shadow: '0 4px 16px rgba(0,0,0,0.10)',
}

export default function UserProfilePage({ user, onLogout, onUpdateProfile }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState('info')
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [form, setForm] = useState({
    first_name:  user?.name?.split(' ')[0]  ?? 'Camilo',
    last_name:   user?.name?.split(' ')[1]  ?? 'Acosta',
    email:       user?.email                ?? 'ejemplo@gmail.com',
    phone:       user?.phone                ?? '3123456789',
    id_type:     user?.id_type              ?? 'cc',
    id_number:   user?.id_number            ?? '',
    birth_date:  user?.birth_date           ?? '',
    gender:      user?.gender               ?? 'male',
  })

  const SIDEBAR_ITEMS = [
    { key: 'info',          label: t('profile.account_info') },
    { key: 'subscription',  label: t('profile.my_subscription') },
    { key: 'payments',      label: t('profile.payments') },
    { key: 'notifications', label: t('profile.notifications') },
    { key: 'orders',        label: t('profile.last_orders') },
    { key: 'help',          label: t('profile.help') },
    { key: 'delete',        label: t('profile.delete_account'), danger: true },
  ]

  const change = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const body = {
        name:       `${form.first_name} ${form.last_name}`.trim(),
        email:      form.email,
        phone:      form.phone,
        id_type:    form.id_type,
        id_number:  form.id_number,
        birth_date: form.birth_date,
        gender:     form.gender,
      }
      const data = await fetchJson('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      onUpdateProfile?.(data.data || data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetchJson('/api/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      localStorage.removeItem('token')
      onLogout?.()
      navigate('/')
    } catch {
      setError(t('profile.error_delete') || 'Error al eliminar la cuenta.')
    }
  }

  const initials = (form.first_name?.[0] ?? 'U').toUpperCase()
  const fullName  = `${form.first_name} ${form.last_name}`.trim()

  const inputStyle = {
    border: 'none',
    borderBottom: `1.5px solid ${C.border}`,
    padding: '10px 0',
    fontSize: 15,
    color: '#444',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontFamily: 'Nunito, sans-serif',
    transition: 'border-color 0.2s',
  }

  return (
    <div className="page-profile profile-page">
      <main className="profile-main">

        {/* ─── SIDEBAR ─── */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar-header">
            <div className="profile-avatar">
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: C.muted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {t('profile.my_profile')}
              </p>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fullName}
              </h2>
              <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.email}
              </p>
            </div>
          </div>

          <nav className="profile-nav">
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.key}
                onClick={() => item.key === 'delete' ? setShowDeleteModal(true) : setActiveTab(item.key)}
                className="profile-nav-btn" style={{ background: activeTab === item.key ? "#fff5f4" : "none", borderLeft: activeTab === item.key ? "4px solid #FF4B3E" : "4px solid transparent", color: item.danger ? "#FF4B3E" : activeTab === item.key ? "#FF4B3E" : "#2c2c2c" }}
                onMouseEnter={e => { if (activeTab !== item.key) e.currentTarget.style.background = '#f5f5f5' }}
                onMouseLeave={e => { if (activeTab !== item.key) e.currentTarget.style.background = 'none' }}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="profile-logout-wrap">
            <button onClick={onLogout}
              className="profile-logout-btn">
              <i className="fas fa-sign-out-alt" style={{ fontSize: 13 }} />
              {t('profile.logout')}
            </button>
          </div>
        </aside>

        {/* ─── CONTENIDO PRINCIPAL ─── */}
        <section className="profile-content">

          {activeTab === 'info' && (
            <>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, color: '#000', marginBottom: 28 }}>
                {t('profile.account_info')}
              </h2>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                  <i className="fas fa-exclamation-circle" />{error}
                </div>
              )}
              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#16a34a', fontSize: 14 }}>
                  <i className="fas fa-check-circle" />{t('profile.saved')}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* Fila 1: Nombre y Apellido */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  {[
                    { label: t('profile.first_name'), name: 'first_name', type: 'text', placeholder: t('profile.placeholder_first_name') || 'Tu nombre' },
                    { label: t('profile.last_name'),  name: 'last_name',  type: 'text', placeholder: t('profile.placeholder_last_name') || 'Tu apellido' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{label}</label>
                      <input type={type} name={name} value={form[name]} onChange={change} placeholder={placeholder} className="profile-input" />
                    </div>
                  ))}
                </div>

                {/* Fila 2: Email y Teléfono */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  {[
                    { label: t('profile.email'), name: 'email', type: 'email', placeholder: t('profile.placeholder_email') || 'correo@ejemplo.com' },
                    { label: t('profile.phone'), name: 'phone', type: 'tel',   placeholder: t('profile.placeholder_phone') || '3001234567' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{label}</label>
                      <input type={type} name={name} value={form[name]} onChange={change} placeholder={placeholder} className="profile-input" />
                    </div>
                  ))}
                </div>

                {/* Fila 3: Tipo y Número de documento */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{t('profile.doc_type')}</label>
                    <select name="id_type" value={form.id_type} onChange={change} className="profile-input">
                      <option value="cc">{t('profile.id_cc') || 'Cédula de Ciudadanía'}</option>
                      <option value="ti">{t('profile.id_ti') || 'Tarjeta de Identidad'}</option>
                      <option value="ce">{t('profile.id_ce') || 'Cédula de Extranjería'}</option>
                      <option value="pp">{t('profile.id_pp') || 'Pasaporte'}</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{t('profile.doc_number')}</label>
                    <input type="text" name="id_number" value={form.id_number} onChange={change} placeholder={t('profile.placeholder_id') || "1234567890"} className="profile-input" />
                  </div>
                </div>

                {/* Fila 4: Fecha de nacimiento */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{t('profile.birth_date')}</label>
                    <input type="date" name="birth_date" value={form.birth_date} onChange={change} className="profile-input" />
                  </div>
                </div>

                {/* Género */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, display: 'block', fontFamily: 'Nunito, sans-serif' }}>{t('profile.gender')}</label>
                  <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                    {[
                      ['male',   t('profile.male')],
                      ['female', t('profile.female')],
                      ['other',  t('profile.other')],
                    ].map(([val, lbl]) => (
                      <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                        <input type="radio" name="gender" value={val} checked={form.gender === val} onChange={change}
                          style={{ accentColor: C.red, width: 16, height: 16 }} />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  <button type="submit" disabled={loading}
                    className="profile-btn-save"
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.green; e.currentTarget.style.color = 'white' } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = C.green }}>
                    {loading
                      ? <><i className="fas fa-spinner fa-spin" /> {t('profile.saving')}</>
                      : <><i className="fas fa-save" /> {t('profile.save')}</>}
                  </button>

                  <button type="button" onClick={() => setShowDeleteModal(true)}
                    className="profile-btn-delete"
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = C.red }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(255,75,62,0.4)' }}>
                    <i className="fas fa-trash-alt" /> {t('profile.delete_account')}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>{t('profile.last_orders')}</h2>
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
                <span style={{ fontSize: 48 }}>📦</span>
                <p style={{ marginTop: 12, fontWeight: 600 }}>{t('profile.no_orders')}</p>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 24px', background: C.red, color: 'white', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                  <i className="fas fa-utensils" /> {t('profile.order_now')}
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, color: '#000', marginBottom: 28 }}>
                {t('profile.my_subscription')}
              </h2>
              <SubscriptionTab user={user} />
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, color: '#000', marginBottom: 28 }}>
                {t('profile.payments')}
              </h2>
              <PaymentMethodsTab />
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab />
          )}

          {activeTab === 'help' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>{t('profile.help')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '📞', title: t('profile.call_us'),   desc: t('profile.call_hours') || 'Lunes a Viernes 8am - 6pm' },
                  { icon: '📧', title: t('profile.email_us'),  desc: t('profile.email_address') || 'AppiFood@gmail.com' },
                  { icon: '💬', title: t('profile.live_chat'), desc: t('profile.live_chat_desc') || 'Chat en vivo' },
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

        {showDeleteModal && (
          <div className="profile-modal-overlay"
            onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="profile-modal">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>⚠️</span>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '12px 0 8px' }}>{t('profile.delete_title')}</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{t('profile.delete_desc')}</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '12px', border: `1.5px solid ${C.border}`, borderRadius: 8, background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                {t('profile.cancel')}
              </button>
              <button onClick={handleDelete}
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 8, background: C.red, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                {t('profile.confirm_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}