// Archivo: src/pages/Profile.jsx | Comentario: logica principal del modulo.
// src/pages/UserProfilePage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchJson } from '../api/fetchJson'
import SubscriptionTab from '../components/SubscriptionTab'

/* ─── colores del proyecto ─── */
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

/* ─── items del sidebar ─── */
const SIDEBAR_ITEMS = [
  { key: 'info',          label: 'Información de tu cuenta' },
  { key: 'subscription',  label: 'Suscripción' },
  { key: 'payments',      label: 'Pagos' },
  { key: 'notifications', label: 'Centro de notificaciones' },
  { key: 'orders',        label: 'Últimas Órdenes' },
  { key: 'help',          label: 'Centro de ayuda' },
  { key: 'delete',        label: 'Eliminar Cuenta', danger: true },
]

export default function UserProfilePage({ user, onLogout, onUpdateProfile }) {
  const navigate = useNavigate()

  /* ─── estado del formulario ─── */
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

  const change = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    // No reseteamos success/error en cada keystroke para evitar re-renders
  }

  /* ─── Guardar cambios → API ─── */
  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    console.log('🔄 Guardando cambios...')
    try {
      const token = localStorage.getItem('token')
      console.log('🔐 Token:', token ? 'EXISTS' : 'NO TOKEN')
      
      const body = {
        name:       `${form.first_name} ${form.last_name}`.trim(),
        email:      form.email,
        phone:      form.phone,
        id_type:    form.id_type,
        id_number:  form.id_number,
        birth_date: form.birth_date,
        gender:     form.gender,
      }
      console.log('📤 Body enviando:', JSON.stringify(body, null, 2))
      const data = await fetchJson('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      console.log('✅ Guardado exitoso')
      onUpdateProfile?.(data.data || data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('❌ Exception:', err.message)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  /* ─── Eliminar cuenta ─── */
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
      setError('Error al eliminar la cuenta.')
    }
  }

  /* ─── avatar inicial ─── */
  const initials = (form.first_name?.[0] ?? 'U').toUpperCase()
  const fullName = `${form.first_name} ${form.last_name}`.trim()

  /* ─── estilos base ─── */
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
  
  const inputStyleFocus = {
    ...inputStyle,
    borderBottom: `1.5px solid ${C.red}`,
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      {/* ══════════ MAIN ══════════ */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ─── SIDEBAR ─── */}
        <aside style={{ background: C.white, borderRadius: 12, boxShadow: C.shadow, overflow: 'hidden' }}>

          {/* Perfil del usuario */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            {/* Avatar */}
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: C.red, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 22, flexShrink: 0,
              boxShadow: '0 4px 12px rgba(255,75,62,0.3)',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: C.muted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Mi perfil
              </p>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fullName}
              </h2>
              <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.email}
              </p>
            </div>
          </div>

          {/* Navegación */}
          <nav style={{ padding: '12px 8px' }}>
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.key}
                onClick={() => item.key === 'delete' ? setShowDeleteModal(true) : setActiveTab(item.key)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '11px 16px',
                  background: activeTab === item.key ? '#fff5f4' : 'none',
                  border: 'none',
                  borderLeft: activeTab === item.key ? `4px solid ${C.red}` : '4px solid transparent',
                  borderRadius: 8,
                  marginBottom: 4,
                  fontSize: 14, fontWeight: 600,
                  color: item.danger ? C.red : activeTab === item.key ? C.red : C.text,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (activeTab !== item.key) e.currentTarget.style.background = '#f5f5f5' }}
                onMouseLeave={e => { if (activeTab !== item.key) e.currentTarget.style.background = 'none' }}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Botón cerrar sesión en sidebar */}
          <div style={{ padding: '8px 16px 20px' }}>
            <button onClick={onLogout}
              style={{
                width: '100%', padding: '10px', border: `1.5px solid ${C.border}`,
                borderRadius: 8, background: 'white',
                color: C.muted, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              <i className="fas fa-sign-out-alt" style={{ fontSize: 13 }} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ─── CONTENIDO PRINCIPAL ─── */}
        <section style={{ background: C.white, borderRadius: 12, boxShadow: C.shadow, padding: '2.5rem' }}>

          {activeTab === 'info' && (
            <>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, color: '#000', marginBottom: 28 }}>
                Información de tu cuenta
              </h2>

              {/* Alertas */}
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

                {/* Fila 1: Nombre y Apellido */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  {[
                    { label: 'Nombre(s)',   name: 'first_name', type: 'text',  placeholder: 'Tu nombre' },
                    { label: 'Apellido(s)', name: 'last_name',  type: 'text',  placeholder: 'Tu apellido' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{label}</label>
                      <input type={type} name={name} value={form[name]} onChange={change} placeholder={placeholder}
                        style={inputStyle} />
                    </div>
                  ))}
                </div>

                {/* Fila 2: Email y Teléfono */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  {[
                    { label: 'Correo Electrónico', name: 'email', type: 'email', placeholder: 'correo@ejemplo.com' },
                    { label: 'Celular',             name: 'phone', type: 'tel',   placeholder: '3001234567' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{label}</label>
                      <input type={type} name={name} value={form[name]} onChange={change} placeholder={placeholder}
                        style={inputStyle} />
                    </div>
                  ))}
                </div>

                {/* Fila 3: Tipo y Número de documento */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>Tipo de documento</label>
                    <select name="id_type" value={form.id_type} onChange={change}
                      style={inputStyle}>
                      <option value="cc">Cédula de Ciudadanía</option>
                      <option value="ti">Tarjeta de Identidad</option>
                      <option value="ce">Cédula de Extranjería</option>
                      <option value="pp">Pasaporte</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>Número de documento</label>
                    <input type="text" name="id_number" value={form.id_number} onChange={change} placeholder="1234567890"
                      style={inputStyle} />
                  </div>
                </div>

                {/* Fila 4: Fecha de nacimiento */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>Fecha de nacimiento</label>
                    <input type="date" name="birth_date" value={form.birth_date} onChange={change}
                      style={inputStyle} />
                  </div>
                </div>

                {/* Género */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, display: 'block', fontFamily: 'Nunito, sans-serif' }}>Género</label>
                  <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                    {[['male','Masculino'], ['female','Femenino'], ['other','Prefiero no decir']].map(([val, lbl]) => (
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
                    style={{
                      padding: '10px 24px', border: `1.5px solid ${C.green}`,
                      background: 'white', color: C.green,
                      borderRadius: 8, fontWeight: 700, fontSize: 14,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                      display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.green; e.currentTarget.style.color = 'white' } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = C.green }}>
                    {loading
                      ? <><i className="fas fa-spinner fa-spin" /> Guardando...</>
                      : <><i className="fas fa-save" /> Guardar cambios</>}
                  </button>

                  <button type="button" onClick={() => setShowDeleteModal(true)}
                    style={{
                      padding: '10px 20px', border: `1.5px solid rgba(255,75,62,0.4)`,
                      background: 'white', color: C.red,
                      borderRadius: 8, fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                      display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = C.red }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(255,75,62,0.4)' }}>
                    <i className="fas fa-trash-alt" /> Eliminar Cuenta
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Últimas Órdenes</h2>
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
                <span style={{ fontSize: 48 }}>📦</span>
                <p style={{ marginTop: 12, fontWeight: 600 }}>No tienes órdenes recientes</p>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 24px', background: C.red, color: 'white', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                  <i className="fas fa-utensils" /> Pedir ahora
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, color: '#000', marginBottom: 28 }}>
                Mi Suscripción
              </h2>
              <SubscriptionTab user={user} />
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Pagos</h2>
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
                <span style={{ fontSize: 48 }}>💳</span>
                <p style={{ marginTop: 12, fontWeight: 600 }}>No tienes métodos de pago guardados</p>
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

      {/* ══════════ MODAL ELIMINAR CUENTA ══════════ */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>⚠️</span>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '12px 0 8px' }}>¿Eliminar tu cuenta?</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
                Esta acción es irreversible. Se eliminarán todos tus datos, historial de pedidos y favoritos.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '12px', border: `1.5px solid ${C.border}`, borderRadius: 8, background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={handleDelete}
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 8, background: C.red, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
