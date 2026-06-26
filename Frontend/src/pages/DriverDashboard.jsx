/**
 * Archivo: src/pages/DriverDashboard.jsx
 * Panel principal del repartidor (Driver).
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchJson } from '../api/fetchJson'
import '../styles/DriverDashboard.css'

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

function MapAutoCenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true })
    }
  }, [center, map])
  return null
}

const STATUS_LABELS = {
  pending: 'pending',
  confirmed: 'confirmed',
  preparing: 'preparing',
  on_the_way: 'on_the_way',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

export default function DriverDashboard({ user, onLogout }) {
  const { t } = useTranslation()
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

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchJson('/api/driver/stats')
      setStats(res?.data || null)
    } catch (err) {
      console.warn('Error cargando stats:', err.message)
    }
  }, [])

  const loadAvailable = useCallback(async () => {
    try {
      const res = await fetchJson('/api/driver/orders/available')
      setAvailableOrders(res?.data || [])
    } catch (err) {
      console.warn('Error cargando pedidos disponibles:', err.message)
    }
  }, [])

  const loadMyOrders = useCallback(async () => {
    try {
      const res = await fetchJson('/api/driver/orders/active')
      setMyOrders(res?.data || [])
    } catch (err) {
      console.warn('Error cargando pedidos activos:', err.message)
    }
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetchJson('/api/driver/orders/history')
      setHistory(res?.data || [])
    } catch (err) {
      console.warn('Error cargando historial:', err.message)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadStats(), loadAvailable(), loadMyOrders()])
      setLoading(false)
    }
    init()
  }, [loadStats, loadAvailable, loadMyOrders])

  useEffect(() => {
    const interval = setInterval(() => {
      loadAvailable()
      loadMyOrders()
      loadStats()
    }, 15000)
    return () => clearInterval(interval)
  }, [loadAvailable, loadMyOrders, loadStats])

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
        // Silencioso
      }
    }

    locationIntervalRef.current = setInterval(sendLocation, 10000)
    sendLocation()

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
    }
  }, [driverPos, myOrders])

  const handleAcceptOrder = async (orderId) => {
    setActionLoading(orderId)
    try {
      await fetchJson(`/api/driver/orders/${orderId}/accept`, { method: 'POST' })
      showToast(t('driver.order_accepted') || '¡Pedido aceptado! Dirígete al restaurante.', 'success')
      await Promise.all([loadAvailable(), loadMyOrders(), loadStats()])
    } catch (err) {
      showToast(err.message || t('driver.accept_error') || 'Error al aceptar pedido', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteOrder = async (orderId) => {
    setActionLoading(orderId)
    try {
      const res = await fetchJson(`/api/driver/orders/${orderId}/complete`, { method: 'POST' })
      const points = res?.points_earned || 0
      showToast(
        `${t('driver.delivery_completed') || '¡Entrega completada!'}${points > 0 ? ` ${t('driver.points_earned') || 'El cliente ganó'} ${points} ${t('driver.points') || 'puntos.'}` : ''}`,
        'success'
      )
      await Promise.all([loadMyOrders(), loadStats()])
      setActiveTab('available')
    } catch (err) {
      showToast(err.message || t('driver.complete_error') || 'Error al completar pedido', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    }
  }, [activeTab, loadHistory])

  if (loading) {
    return (
      <div className="dd-container">
        <div className="dd-loading">
          <div className="dd-loading-spinner" />
          <div className="dd-loading-text">{t('driver.loading') || 'Cargando panel del repartidor...'}</div>
        </div>
      </div>
    )
  }

  const activeOrder = myOrders.find(o => o.status === 'on_the_way')
  const initials = (user?.name || 'D').slice(0, 2).toUpperCase()
  const tabCounts = {
    available: availableOrders.length,
    active: myOrders.length,
  }

  return (
    <div className="dd-container">
      <div className="dd-main">
        <header className="dd-header">
          <div className="dd-header-inner">
            <div className="dd-logo">
              <div className="dd-logo-icon">🛵</div>
              <span className="dd-logo-text">{t('driver.app_name') || 'AppiFood Driver'}</span>
            </div>
            <div className="dd-user-info">
              <span className="dd-status-badge online">{t('driver.online') || 'En línea'}</span>
              <div style={{ textAlign: 'right' }}>
                <div className="dd-user-name">{user?.name || t('driver.driver') || 'Repartidor'}</div>
                <div className="dd-user-role">{t('driver.driver_role') || 'Repartidor'}</div>
              </div>
              <div className="dd-user-avatar">{initials}</div>
            </div>
          </div>
        </header>

        <nav className="dd-tabs">
          {[
            { id: 'available', label: t('driver.available') || 'Disponibles', icon: '📋' },
            { id: 'active', label: t('driver.active') || 'En Curso', icon: '🚀' },
            { id: 'history', label: t('driver.history') || 'Historial', icon: '📜' },
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

        <div className="dd-content dd-fade-in">
          <div className="dd-stats-grid">
            <div className="dd-stat-card">
              <div className="dd-stat-icon purple">📦</div>
              <div>
                <div className="dd-stat-value">{stats?.deliveries_today ?? 0}</div>
                <div className="dd-stat-label">{t('driver.deliveries_today') || 'Entregas hoy'}</div>
              </div>
            </div>
            <div className="dd-stat-card">
              <div className="dd-stat-icon teal">🏆</div>
              <div>
                <div className="dd-stat-value">{stats?.deliveries_total ?? 0}</div>
                <div className="dd-stat-label">{t('driver.total_deliveries') || 'Total entregas'}</div>
              </div>
            </div>
            <div className="dd-stat-card">
              <div className="dd-stat-icon green">💰</div>
              <div>
                <div className="dd-stat-value">
                  ${(stats?.earnings_today ?? 0).toLocaleString('es-CO')}
                </div>
                <div className="dd-stat-label">{t('driver.earnings_today') || 'Ganancia hoy'}</div>
              </div>
            </div>
            <div className="dd-stat-card">
              <div className="dd-stat-icon yellow">🔥</div>
              <div>
                <div className="dd-stat-value">{stats?.active_orders ?? 0}</div>
                <div className="dd-stat-label">{t('driver.active_orders') || 'Pedidos activos'}</div>
              </div>
            </div>
          </div>

          {activeOrder && (
            <div className="dd-active-order">
              <div className="dd-active-order-title">
                🚀 {t('driver.active_order') || 'Pedido en Curso'} — #{activeOrder.id}
              </div>
              <div className="dd-active-order-grid">
                <div>
                  <div className="dd-order-info-row">
                    <div className="dd-order-info-icon">👤</div>
                    <div>
                      <div className="dd-order-info-label">{t('driver.customer') || 'Cliente'}</div>
                      <div className="dd-order-info-value">
                        {activeOrder.customer_name || activeOrder.user?.name || 'Cliente'}
                      </div>
                    </div>
                  </div>
                  <div className="dd-order-info-row">
                    <div className="dd-order-info-icon">📍</div>
                    <div>
                      <div className="dd-order-info-label">{t('driver.address') || 'Dirección'}</div>
                      <div className="dd-order-info-value">
                        {activeOrder.delivery_address || 'Sin dirección'}
                      </div>
                    </div>
                  </div>
                  <div className="dd-order-info-row">
                    <div className="dd-order-info-icon">💵</div>
                    <div>
                      <div className="dd-order-info-label">{t('driver.total') || 'Total'}</div>
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
                      {actionLoading === activeOrder.id ? '⏳' : '✅'} {t('driver.mark_delivered') || 'Marcar como Entregado'}
                    </button>
                  </div>
                </div>

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
                            <Popup>{t('driver.your_location') || '📍 Tu ubicación actual'}</Popup>
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

          {activeTab === 'available' && (
            <div>
              <h2 className="dd-section-title">📋 {t('driver.available_orders') || 'Pedidos Disponibles'}</h2>
              {availableOrders.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">🕐</div>
                  <div className="dd-empty-title">{t('driver.no_available_orders') || 'No hay pedidos disponibles'}</div>
                  <div className="dd-empty-desc">
                    {t('driver.no_orders_hint') || 'Los nuevos pedidos aparecerán aquí automáticamente. ¡Mantente atento!'}
                  </div>
                </div>
              ) : (
                <div className="dd-orders-grid">
                  {availableOrders.map((order) => (
                    <div key={order.id} className="dd-order-card dd-fade-in">
                      <div className="dd-order-card-header">
                        <span className="dd-order-id">#{order.id}</span>
                        <span className={`dd-order-status ${order.status}`}>
                          {t(`orders.status_${order.status}`, { defaultValue: order.status_label })}
                        </span>
                      </div>
                      <div className="dd-order-card-body">
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">🍽️</div>
                          <div>
                            <div className="dd-order-info-label">{t('driver.restaurant') || 'Restaurante'}</div>
                            <div className="dd-order-info-value">
                              {order.restaurant_name || order.restaurant?.name || '-'}
                            </div>
                          </div>
                        </div>
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">👤</div>
                          <div>
                            <div className="dd-order-info-label">{t('driver.customer') || 'Cliente'}</div>
                            <div className="dd-order-info-value">
                              {order.customer_name || order.user?.name || 'Cliente'}
                            </div>
                          </div>
                        </div>
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">📍</div>
                          <div>
                            <div className="dd-order-info-label">{t('driver.delivery_address') || 'Dirección de entrega'}</div>
                            <div className="dd-order-info-value">
                              {order.delivery_address || 'Sin dirección'}
                            </div>
                          </div>
                        </div>

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
                              <span>{t('driver.total') || 'Total'}</span>
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
                          {actionLoading === order.id ? '⏳' : '🛵'} {t('driver.accept_order') || 'Aceptar Pedido'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'active' && (
            <div>
              <h2 className="dd-section-title">🚀 {t('driver.active_orders_title') || 'Pedidos en Curso'}</h2>
              {myOrders.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">✨</div>
                  <div className="dd-empty-title">{t('driver.no_active_orders') || 'No tienes pedidos activos'}</div>
                  <div className="dd-empty-desc">
                    {t('driver.no_active_hint') || 'Acepta un pedido desde la pestaña "Disponibles" para comenzar a entregar.'}
                  </div>
                </div>
              ) : (
                <div className="dd-orders-grid">
                  {myOrders.map((order) => (
                    <div key={order.id} className="dd-order-card dd-fade-in">
                      <div className="dd-order-card-header">
                        <span className="dd-order-id">#{order.id}</span>
                        <span className={`dd-order-status ${order.status}`}>
                          {t(`orders.status_${order.status}`, { defaultValue: order.status_label })}
                        </span>
                      </div>
                      <div className="dd-order-card-body">
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">👤</div>
                          <div>
                            <div className="dd-order-info-label">{t('driver.customer') || 'Cliente'}</div>
                            <div className="dd-order-info-value">
                              {order.customer_name || order.user?.name || 'Cliente'}
                            </div>
                          </div>
                        </div>
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">📍</div>
                          <div>
                            <div className="dd-order-info-label">{t('driver.address') || 'Dirección'}</div>
                            <div className="dd-order-info-value">
                              {order.delivery_address || 'Sin dirección'}
                            </div>
                          </div>
                        </div>
                        <div className="dd-order-info-row">
                          <div className="dd-order-info-icon">💵</div>
                          <div>
                            <div className="dd-order-info-label">{t('driver.total') || 'Total'}</div>
                            <div className="dd-order-info-value">
                              ${Number(order.total).toLocaleString('es-CO')}
                            </div>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="dd-order-info-row">
                            <div className="dd-order-info-icon">📝</div>
                            <div>
                              <div className="dd-order-info-label">{t('driver.notes') || 'Notas'}</div>
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
                            {actionLoading === order.id ? '⏳' : '✅'} {t('driver.deliver') || 'Entregar'}
                          </button>
                        )}
                        {order.status !== 'on_the_way' && (
                          <div className="dd-btn dd-btn-outline" style={{ cursor: 'default' }}>
                            ⏳ {t('driver.waiting_restaurant') || 'Esperando preparación del restaurante'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="dd-section-title">📜 {t('driver.delivery_history') || 'Historial de Entregas'}</h2>
              {history.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">📦</div>
                  <div className="dd-empty-title">{t('driver.no_history') || 'Sin entregas aún'}</div>
                  <div className="dd-empty-desc">
                    {t('driver.no_history_hint') || 'Tu historial de entregas aparecerá aquí una vez que completes pedidos.'}
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--dd-border)', background: 'var(--dd-surface)' }}>
                  <table className="dd-history-table">
                    <thead>
                      <tr>
                        <th>{t('driver.order_id') || 'Pedido'}</th>
                        <th>{t('driver.customer') || 'Cliente'}</th>
                        <th>{t('driver.restaurant') || 'Restaurante'}</th>
                        <th>{t('driver.total') || 'Total'}</th>
                        <th>{t('driver.status') || 'Estado'}</th>
                        <th>{t('driver.date') || 'Fecha'}</th>
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
                              {t(`orders.status_${order.status}`, { defaultValue: order.status_label })}
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

      {toast && (
        <div className={`dd-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
        </div>
      )}
    </div>
  )
}