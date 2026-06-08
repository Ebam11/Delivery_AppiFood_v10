/**
 * Archivo: src/pages/DriverDashboard.jsx
 * Panel principal del repartidor (Driver).
 * Permite ver pedidos disponibles, aceptarlos, actualizar ubicación GPS
 * en tiempo real, completar entregas y ver historial.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchJson } from '../api/fetchJson'
import '../styles/DriverDashboard.css'

// ─── Iconos personalizados de Leaflet ──────────────────────
const driverIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: linear-gradient(135deg, #6C5CE7, #A29BFE);
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 12px rgba(108,92,231,0.5);
    border: 3px solid white;
  ">🛵</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const customerIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: linear-gradient(135deg, #00CEC9, #81ECEC);
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 12px rgba(0,206,201,0.5);
    border: 3px solid white;
  ">🏠</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const restaurantIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background: linear-gradient(135deg, #FF6B6B, #ffa502);
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 12px rgba(255,107,107,0.5);
    border: 3px solid white;
  ">🍽️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

// ─── Componente para autocentrar el mapa ───────────────────
function MapAutoCenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true })
    }
  }, [center, map])
  return null
}

// ─── Etiquetas de estado ───────────────────────────────────
const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  on_the_way: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

// ─── Componente Principal ──────────────────────────────────
export default function DriverDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('available')
  const [availableOrders, setAvailableOrders] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [driverPos, setDriverPos] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const geoWatchRef = useRef(null)
  const locationIntervalRef = useRef(null)

  // ── Mostrar notificación toast ───────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── Cargar estadísticas ──────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const res = await fetchJson('/api/driver/stats')
      setStats(res?.data || null)
    } catch (err) {
      console.warn('Error cargando stats:', err.message)
    }
  }, [])

  // ── Cargar pedidos disponibles ───────────────────────────
  const loadAvailable = useCallback(async () => {
    try {
      const res = await fetchJson('/api/driver/orders/available')
      setAvailableOrders(res?.data || [])
    } catch (err) {
      console.warn('Error cargando pedidos disponibles:', err.message)
    }
  }, [])

  // ── Cargar pedidos activos ───────────────────────────────
  const loadMyOrders = useCallback(async () => {
    try {
      const res = await fetchJson('/api/driver/orders/active')
      setMyOrders(res?.data || [])
    } catch (err) {
      console.warn('Error cargando pedidos activos:', err.message)
    }
  }, [])

  // ── Cargar historial ─────────────────────────────────────
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetchJson('/api/driver/orders/history')
      setHistory(res?.data || [])
    } catch (err) {
      console.warn('Error cargando historial:', err.message)
    }
  }, [])

  // ── Carga inicial ────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadStats(), loadAvailable(), loadMyOrders()])
      setLoading(false)
    }
    init()
  }, [loadStats, loadAvailable, loadMyOrders])

  // ── Refrescar datos periódicamente ───────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      loadAvailable()
      loadMyOrders()
      loadStats()
    }, 15000) // Cada 15 segundos
    return () => clearInterval(interval)
  }, [loadAvailable, loadMyOrders, loadStats])

  // ── Geolocalización del navegador ────────────────────────
  useEffect(() => {
    if ('geolocation' in navigator) {
      geoWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setDriverPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        (err) => console.warn('Geolocalización error:', err.message),
        { enableHighAccuracy: true, maximumAge: 5000 }
      )
    }
    return () => {
      if (geoWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchRef.current)
      }
    }
  }, [])

  // ── Enviar ubicación GPS al backend para pedidos en curso ─
  useEffect(() => {
    if (!driverPos || myOrders.length === 0) return

    const sendLocation = async () => {
      const activeOrder = myOrders.find(o => o.status === 'on_the_way')
      if (!activeOrder) return

      try {
        await fetchJson(`/api/driver/orders/${activeOrder.id}/location`, {
          method: 'POST',
          body: { lat: driverPos.lat, lng: driverPos.lng },
        })
      } catch (err) {
        // Silencioso - no bloquear la UI
      }
    }

    locationIntervalRef.current = setInterval(sendLocation, 10000)
    sendLocation() // Enviar inmediatamente

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
    }
  }, [driverPos, myOrders])

  // ── Aceptar un pedido ────────────────────────────────────
  const handleAcceptOrder = async (orderId) => {
    setActionLoading(orderId)
    try {
      await fetchJson(`/api/driver/orders/${orderId}/accept`, { method: 'POST' })
      showToast('¡Pedido aceptado! Dirígete al restaurante.', 'success')
      await Promise.all([loadAvailable(), loadMyOrders(), loadStats()])
    } catch (err) {
      showToast(err.message || 'Error al aceptar pedido', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Completar un pedido ──────────────────────────────────
  const handleCompleteOrder = async (orderId) => {
    setActionLoading(orderId)
    try {
      const res = await fetchJson(`/api/driver/orders/${orderId}/complete`, { method: 'POST' })
      const points = res?.points_earned || 0
      showToast(
        `¡Entrega completada!${points > 0 ? ` El cliente ganó ${points} puntos.` : ''}`,
        'success'
      )
      await Promise.all([loadMyOrders(), loadStats()])
      setActiveTab('available')
    } catch (err) {
      showToast(err.message || 'Error al completar pedido', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Cargar historial al cambiar de tab ───────────────────
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    }
  }, [activeTab, loadHistory])

  // ── Render: Loading State ────────────────────────────────
  if (loading) {
    return (
      <div className="dd-container">
        <div className="dd-loading">
          <div className="dd-loading-spinner" />
          <div className="dd-loading-text">Cargando panel del repartidor...</div>
        </div>
      </div>
    )
  }

  // ── Datos derivados ──────────────────────────────────────
  const activeOrder = myOrders.find(o => o.status === 'on_the_way')
  const initials = (user?.name || 'D').slice(0, 2).toUpperCase()
  const tabCounts = {
    available: availableOrders.length,
    active: myOrders.length,
  }

  return (
    <div className="dd-container">
      <div className="dd-main">
        {/* ─── Header ────────────────────────────────────── */}
        <header className="dd-header">
          <div className="dd-header-inner">
            <div className="dd-logo">
              <div className="dd-logo-icon">🛵</div>
              <span className="dd-logo-text">AppiFood Driver</span>
            </div>
            <div className="dd-user-info">
              <span className="dd-status-badge online">En línea</span>
              <div style={{ textAlign: 'right' }}>
                <div className="dd-user-name">{user?.name || 'Repartidor'}</div>
                <div className="dd-user-role">Repartidor</div>
              </div>
              <div className="dd-user-avatar">{initials}</div>
            </div>
          </div>
        </header>

        {/* ─── Tabs ──────────────────────────────────────── */}
        <nav className="dd-tabs">
          {[
            { id: 'available', label: 'Disponibles', icon: '📋' },
            { id: 'active', label: 'En Curso', icon: '🚀' },
            { id: 'history', label: 'Historial', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`dd-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span className="dd-tab-badge">{tabCounts[tab.id]}</span>
              )}
            </button>
          ))}
        </nav>

        {/* ─── Content ───────────────────────────────────── */}
        <div className="dd-content dd-fade-in">
          {/* ── Stats Cards ──────────────────────────────── */}
          <div className="dd-stats-grid">
            <div className="dd-stat-card">
              <div className="dd-stat-icon purple">📦</div>
              <div>
                <div className="dd-stat-value">{stats?.deliveries_today ?? 0}</div>
                <div className="dd-stat-label">Entregas hoy</div>
              </div>
            </div>
            <div className="dd-stat-card">
              <div className="dd-stat-icon teal">🏆</div>
              <div>
                <div className="dd-stat-value">{stats?.deliveries_total ?? 0}</div>
                <div className="dd-stat-label">Total entregas</div>
              </div>
            </div>
            <div className="dd-stat-card">
              <div className="dd-stat-icon green">💰</div>
              <div>
                <div className="dd-stat-value">
                  ${(stats?.earnings_today ?? 0).toLocaleString('es-CO')}
                </div>
                <div className="dd-stat-label">Ganancia hoy</div>
              </div>
            </div>
            <div className="dd-stat-card">
              <div className="dd-stat-icon yellow">🔥</div>
              <div>
                <div className="dd-stat-value">{stats?.active_orders ?? 0}</div>
                <div className="dd-stat-label">Pedidos activos</div>
              </div>
            </div>
          </div>

          {/* ── Active Order with Map ────────────────────── */}
          {activeOrder && (
            <div className="dd-active-order">
              <div className="dd-active-order-title">
                🚀 Pedido en Curso — #{activeOrder.id}
              </div>
              <div className="dd-active-order-grid">
                <div>
                  <div className="dd-order-info-row">
                    <div className="dd-order-info-icon">👤</div>
                    <div>
                      <div className="dd-order-info-label">Cliente</div>
                      <div className="dd-order-info-value">
                        {activeOrder.customer_name || activeOrder.user?.name || 'Cliente'}
                      </div>
                    </div>
                  </div>
                  <div className="dd-order-info-row">
                    <div className="dd-order-info-icon">📍</div>
                    <div>
                      <div className="dd-order-info-label">Dirección</div>
                      <div className="dd-order-info-value">
                        {activeOrder.delivery_address || 'Sin dirección'}
                      </div>
                    </div>
                  </div>
                  <div className="dd-order-info-row">
                    <div className="dd-order-info-icon">💵</div>
                    <div>
                      <div className="dd-order-info-label">Total</div>
                      <div className="dd-order-info-value">
                        ${Number(activeOrder.total).toLocaleString('es-CO')}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      className="dd-btn dd-btn-success"
                      onClick={() => handleCompleteOrder(activeOrder.id)}
                      disabled={actionLoading === activeOrder.id}
                    >
                      {actionLoading === activeOrder.id ? '⏳' : '✅'} Marcar como Entregado
                    </button>
                  </div>
                </div>

                {/* Mapa de tracking */}
                <div className="dd-map-wrapper" style={{ margin: 0 }}>
                  <div className="dd-map-container">
                    <MapContainer
                      center={driverPos || [4.7110, -74.0721]}
                      zoom={14}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      />
                      {driverPos && (
                        <>
                          <MapAutoCenter center={[driverPos.lat, driverPos.lng]} />
                          <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon}>
                            <Popup>📍 Tu ubicación actual</Popup>
                          </Marker>
                        </>
                      )}
                      {activeOrder.delivery_lat && activeOrder.delivery_lng && (
                        <Marker
                          position={[
                            Number(activeOrder.delivery_lat),
                            Number(activeOrder.delivery_lng),
                          ]}
                          icon={customerIcon}
                        >
                          <Popup>🏠 {activeOrder.delivery_address || 'Cliente'}</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Available Orders ────────────────────── */}
          {activeTab === 'available' && (
            <div>
              <h2 className="dd-section-title">📋 Pedidos Disponibles</h2>
              {availableOrders.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">🕐</div>
                  <div className="dd-empty-title">No hay pedidos disponibles</div>
                  <div className="dd-empty-desc">
                    Los nuevos pedidos aparecerán aquí automáticamente.
                    ¡Mantente atento!
                  </div>
                </div>
              ) : (
                <div className="dd-orders-grid">
                  {availableOrders.map((order) => (
                    <div key={order.id} className="dd-order-card dd-fade-in">
                      <div className="dd-order-card-header">
                        <span className="dd-order-id">#{order.id}</span>
                        <span className={`dd-order-status ${order.status}`}>
                          {STATUS_LABELS[order.status] || order.status_label}
                        </span>
                      </div>
                      <div className="dd-order-card-body">
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">🍽️</div>
                          <div>
                            <div className="dd-order-info-label">Restaurante</div>
                            <div className="dd-order-info-value">
                              {order.restaurant_name || order.restaurant?.name || '-'}
                            </div>
                          </div>
                        </div>
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">👤</div>
                          <div>
                            <div className="dd-order-info-label">Cliente</div>
                            <div className="dd-order-info-value">
                              {order.customer_name || order.user?.name || 'Cliente'}
                            </div>
                          </div>
                        </div>
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">📍</div>
                          <div>
                            <div className="dd-order-info-label">Dirección de entrega</div>
                            <div className="dd-order-info-value">
                              {order.delivery_address || 'Sin dirección'}
                            </div>
                          </div>
                        </div>

                        {/* Items del pedido */}
                        {order.items && order.items.length > 0 && (
                          <div className="dd-order-items-list">
                            {order.items.map((item, i) => (
                              <div key={i} className="dd-order-item">
                                <div className="dd-order-item-name">
                                  <span className="dd-order-item-qty">{item.quantity}x</span>
                                  <span>{item.name || item.product_name}</span>
                                </div>
                                <span>${Number(item.subtotal || item.unit_price * item.quantity).toLocaleString('es-CO')}</span>
                              </div>
                            ))}
                            <div className="dd-order-total">
                              <span>Total</span>
                              <span>${Number(order.total).toLocaleString('es-CO')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="dd-order-card-footer">
                        <button
                          className="dd-btn dd-btn-primary"
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={actionLoading === order.id}
                        >
                          {actionLoading === order.id ? '⏳ Aceptando...' : '🛵 Aceptar Pedido'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Active Orders ───────────────────────── */}
          {activeTab === 'active' && (
            <div>
              <h2 className="dd-section-title">🚀 Pedidos en Curso</h2>
              {myOrders.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">✨</div>
                  <div className="dd-empty-title">No tienes pedidos activos</div>
                  <div className="dd-empty-desc">
                    Acepta un pedido desde la pestaña "Disponibles" para comenzar a entregar.
                  </div>
                </div>
              ) : (
                <div className="dd-orders-grid">
                  {myOrders.map((order) => (
                    <div key={order.id} className="dd-order-card dd-fade-in">
                      <div className="dd-order-card-header">
                        <span className="dd-order-id">#{order.id}</span>
                        <span className={`dd-order-status ${order.status}`}>
                          {STATUS_LABELS[order.status] || order.status_label}
                        </span>
                      </div>
                      <div className="dd-order-card-body">
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">👤</div>
                          <div>
                            <div className="dd-order-info-label">Cliente</div>
                            <div className="dd-order-info-value">
                              {order.customer_name || order.user?.name || 'Cliente'}
                            </div>
                          </div>
                        </div>
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">📍</div>
                          <div>
                            <div className="dd-order-info-label">Dirección</div>
                            <div className="dd-order-info-value">
                              {order.delivery_address || 'Sin dirección'}
                            </div>
                          </div>
                        </div>
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">💵</div>
                          <div>
                            <div className="dd-order-info-label">Total</div>
                            <div className="dd-order-info-value">
                              ${Number(order.total).toLocaleString('es-CO')}
                            </div>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="dd-order-info-row">
                            <div className="dd-order-info-icon">📝</div>
                            <div>
                              <div className="dd-order-info-label">Notas</div>
                              <div className="dd-order-info-value">{order.notes}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="dd-order-card-footer">
                        {order.status === 'on_the_way' && (
                          <button
                            className="dd-btn dd-btn-success"
                            onClick={() => handleCompleteOrder(order.id)}
                            disabled={actionLoading === order.id}
                          >
                            {actionLoading === order.id ? '⏳' : '✅'} Entregar
                          </button>
                        )}
                        {order.status !== 'on_the_way' && (
                          <div className="dd-btn dd-btn-outline" style={{ cursor: 'default' }}>
                            ⏳ Esperando preparación del restaurante
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: History ─────────────────────────────── */}
          {activeTab === 'history' && (
            <div>
              <h2 className="dd-section-title">📜 Historial de Entregas</h2>
              {history.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">📦</div>
                  <div className="dd-empty-title">Sin entregas aún</div>
                  <div className="dd-empty-desc">
                    Tu historial de entregas aparecerá aquí una vez que completes pedidos.
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--dd-border)', background: 'var(--dd-surface)' }}>
                  <table className="dd-history-table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Restaurante</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 700, color: 'var(--dd-primary-light)' }}>
                            #{order.id}
                          </td>
                          <td>{order.customer_name || order.user?.name || 'Cliente'}</td>
                          <td>{order.restaurant_name || order.restaurant?.name || '-'}</td>
                          <td style={{ fontWeight: 700 }}>
                            ${Number(order.total).toLocaleString('es-CO')}
                          </td>
                          <td>
                            <span className={`dd-order-status ${order.status}`}>
                              {STATUS_LABELS[order.status] || order.status_label}
                            </span>
                          </td>
                          <td style={{ color: 'var(--dd-text-muted)', fontSize: '0.82rem' }}>
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString('es-CO', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast Notification ───────────────────────────── */}
      {toast && (
        <div className={`dd-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}{' '}
          {toast.message}
        </div>
      )}
    </div>
  )
}
