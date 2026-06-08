import React, { useState, useEffect } from 'react';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { logInfo, logWarning } from '../services/logService';

/**
 * Componente DeliveryCheck
 * 
 * Verifica si el restaurante entrega en la zona de la dirección
 * Muestra costo de entrega y tiempo estimado
 */
const DeliveryCheck = ({ restaurantId, address, onDeliveryAvailable }) => {
  const { t } = useTranslation();
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (address?.latitude && address?.longitude && restaurantId) {
      checkDeliveryAvailability();
    }
  }, [address, restaurantId]);

  /**
   * Verifica si el restaurante entrega en esta zona
   */
  const checkDeliveryAvailability = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/delivery/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          latitude: address.latitude,
          longitude: address.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Verificación de entrega falló');
      }

      const data = await response.json();

      if (data.available) {
        logInfo('Entrega disponible', {
          restaurant_id: restaurantId,
          delivery_cost: data.delivery_cost,
          estimated_time: data.estimated_time,
        });

        setDeliveryInfo({
          available: true,
          deliveryCost: data.delivery_cost,
          estimatedTime: data.estimated_time,
          zone: data.zone_name,
        });

        if (onDeliveryAvailable) {
          onDeliveryAvailable({
            available: true,
            cost: data.delivery_cost,
            time: data.estimated_time,
          });
        }
      } else {
        logWarning('Entrega no disponible en esta zona', {
          restaurant_id: restaurantId,
        });

        setDeliveryInfo({
          available: false,
          message: data.message || 'No entregamos en esta zona',
        });

        if (onDeliveryAvailable) {
          onDeliveryAvailable({
            available: false,
          });
        }
      }
    } catch (err) {
      logWarning('Error verificando entrega', {
        error: err.message,
      });

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 text-sm">
            {t('delivery.checking') || 'Verificando disponibilidad...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!deliveryInfo) {
    return null;
  }

  if (deliveryInfo.available) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-2">
              {t('delivery.available') || 'Entrega disponible'}
            </h3>

            <div className="space-y-1 text-sm text-green-700">
              <p>
                <strong>{t('delivery.zone') || 'Zona'}:</strong> {deliveryInfo.zone}
              </p>
              <p>
                <strong>{t('delivery.cost') || 'Costo'}:</strong> ${deliveryInfo.deliveryCost.toFixed(2)}
              </p>
              <p>
                <strong>{t('delivery.time') || 'Tiempo estimado'}:</strong>{' '}
                {deliveryInfo.estimatedTime} min
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-2">
            {t('delivery.not_available') || 'Fuera de zona de entrega'}
          </h3>

          <p className="text-sm text-yellow-700 mb-3">
            {deliveryInfo.message}
          </p>

          <button
            onClick={() => alert('Solicitud de expansión enviada')}
            className="text-sm font-semibold text-yellow-700 hover:text-yellow-800 underline"
          >
            {t('delivery.request_expansion') || 'Solicitar expansión de zona'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCheck;
