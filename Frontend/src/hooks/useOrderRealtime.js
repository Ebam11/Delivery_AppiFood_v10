import { useState, useEffect, useRef, useCallback } from 'react'
import client from '../api/client'

/**
 * Hook de polling inteligente para actualizaciones de estado de pedidos en tiempo real.
 * Hace polling cada 15 segundos mientras el pedido esté activo (no entregado/cancelado).
 * Se detiene automáticamente cuando el pedido llega a un estado final.
 */
const FINAL_STATUSES = ['entregado', 'cancelado', 'delivered', 'cancelled']
const POLL_INTERVAL_MS = 15000 // 15 segundos

export function useOrderRealtime(orderId, onStatusChange) {
  const [status, setStatus] = useState(null)
  const [tracking, setTracking] = useState([])
  const intervalRef = useRef(null)
  const lastStatusRef = useRef(null)

  const fetchOrderStatus = useCallback(async () => {
    if (!orderId) return

    try {
      const res = await client.get(`/orders/${orderId}`)
      const order = res.data?.data || res.data

      const newStatus = (order?.status || '').toLowerCase()
      const newTracking = order?.tracking || []

      setStatus(newStatus)
      setTracking(newTracking)

      // Notificar solo si el status cambió
      if (newStatus && newStatus !== lastStatusRef.current) {
        lastStatusRef.current = newStatus
        onStatusChange?.(newStatus, order)

        // Si llegó a estado final, detener el polling
        if (FINAL_STATUSES.includes(newStatus)) {
          clearInterval(intervalRef.current)
        }
      }
    } catch {
      // Silenciar errores de red — el polling reintentará
    }
  }, [orderId, onStatusChange])

  useEffect(() => {
    if (!orderId) return

    // Fetch inmediato al montar
    fetchOrderStatus()

    // Iniciar polling
    intervalRef.current = setInterval(fetchOrderStatus, POLL_INTERVAL_MS)

    return () => clearInterval(intervalRef.current)
  }, [orderId, fetchOrderStatus])

  return { status, tracking }
}

/**
 * Hook para notificaciones de nuevos pedidos en el dashboard del restaurante.
 * Hace polling cada 20 segundos y notifica si llega un pedido nuevo.
 */
export function useRestaurantOrderNotifications(isRestaurant, onNewOrder) {
  const knownIdsRef = useRef(new Set())
  const intervalRef = useRef(null)
  const initializedRef = useRef(false)

  const fetchOrders = useCallback(async () => {
    if (!isRestaurant) return

    try {
      const res = await client.get('/restaurant/orders')
      const orders = res.data?.data || res.data || []

      if (!initializedRef.current) {
        // Primera carga: solo registrar los IDs existentes, sin notificar
        orders.forEach(o => knownIdsRef.current.add(o.id))
        initializedRef.current = true
        return
      }

      // Detectar pedidos nuevos
      const newOrders = orders.filter(o => !knownIdsRef.current.has(o.id))

      if (newOrders.length > 0) {
        newOrders.forEach(o => knownIdsRef.current.add(o.id))
        onNewOrder?.(newOrders)

        // Notificación nativa del navegador si está disponible y permitida
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🍽️ Nuevo pedido recibido', {
            body: `${newOrders.length} pedido(s) nuevo(s) esperando confirmación`,
            icon: '/favicon.ico',
          })
        }
      }
    } catch {
      // Silenciar errores de red
    }
  }, [isRestaurant, onNewOrder])

  useEffect(() => {
    if (!isRestaurant) return

    // Pedir permiso de notificaciones al iniciar
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    fetchOrders()
    intervalRef.current = setInterval(fetchOrders, 20000)

    return () => clearInterval(intervalRef.current)
  }, [isRestaurant, fetchOrders])
}
