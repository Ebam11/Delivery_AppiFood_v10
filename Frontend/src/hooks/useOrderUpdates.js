import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useOrderStore } from '../store/orderStore';
import { logInfo, logError } from '../services/logService';

/**
 * Hook: useOrderUpdates
 * 
 * Conecta a WebSocket y escucha actualizaciones de órdenes
 * Actualiza el estado global automáticamente
 */
export const useOrderUpdates = () => {
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const addOrder = useOrderStore((state) => state.addOrder);
  const setNewOrders = useOrderStore((state) => state.setNewOrders);

  // Conectar a WebSocket
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_WS_URL || 'http://localhost:6001';

    logInfo('Conectando a WebSocket', { url: socketUrl });

    // Crear conexión Socket.io
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    // Evento: Conectado
    socket.on('connect', () => {
      logInfo('Conectado a WebSocket');
    });

    // Evento: Cambio de estado de orden
    socket.on('order-status-changed', (data) => {
      logInfo('Actualización de orden recibida', {
        order_id: data.order_id,
        new_status: data.new_status,
      });

      // Actualizar estado global
      updateOrderStatus(data.order_id, data.new_status);

      // Mostrar notificación
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Estado de orden actualizado', {
          body: data.message,
          icon: '/img/logo.png',
        });
      }
    });

    // Evento: Nueva orden (para restaurantes)
    socket.on('new-order', (data) => {
      logInfo('Nueva orden recibida', {
        order_id: data.order_id,
        total: data.total,
      });

      // Reproducir sonido (si existe)
      try {
        const audio = new Audio('/sounds/new-order.mp3');
        audio.play().catch(() => {
          // Ignorar si falla
        });
      } catch (err) {
        // Ignorar
      }

      // Mostrar notificación
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nueva orden', {
          body: `Orden #${data.order_id} - $${data.total}`,
          icon: '/img/logo.png',
          tag: 'new-order',
          requireInteraction: true,
        });
      }
    });

    // Evento: Error de conexión
    socket.on('connect_error', (error) => {
      logError('Error en conexión WebSocket', {
        error: error.message,
      });
    });

    // Evento: Desconectado
    socket.on('disconnect', () => {
      logInfo('Desconectado de WebSocket');
    });

    // Limpiar conexión al desmontar
    return () => {
      socket.disconnect();
    };
  }, [updateOrderStatus, addOrder, setNewOrders]);
};

/**
 * Hook: useBroadcaster
 * 
 * Emite eventos al servidor via WebSocket
 * Usado para cambios locales que deben sincronizarse
 */
export const useBroadcaster = () => {
  const socketRef = React.useRef(null);

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_WS_URL || 'http://localhost:6001';
    socketRef.current = io(socketUrl, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  /**
   * Emitir evento personalizado
   */
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      logInfo('Evento emitido', { event, data });
    } else {
      logError('WebSocket no está conectado', { event });
    }
  }, []);

  return { emit, socket: socketRef.current };
};

/**
 * Hook: useOrderNotifications
 * 
 * Solicita permisos de notificación y maneja notificaciones
 */
export const useOrderNotifications = () => {
  useEffect(() => {
    // Solicitar permiso de notificación
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          logInfo('Permisos de notificación otorgados');
        }
      });
    }
  }, []);

  /**
   * Mostrar notificación personalizada
   */
  const notify = useCallback((title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/img/logo.png',
        ...options,
      });
    }
  }, []);

  return { notify };
};
