// Archivo: src/pages/OrderDetail.jsx | Comentario: logica principal del modulo.
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrderStore } from '../store/orderStore';
import { Loading } from '../components/ErrorMessage';
import { ErrorMessage as ErrorMsg } from '../components/ErrorMessage';

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedOrder, isLoading, error, fetchOrderById, cancelOrderById, clearError } = useOrderStore();

  useEffect(() => {
    fetchOrderById(id);
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      pending:    'bg-yellow-100 text-yellow-800',
      confirmed:  'bg-blue-100 text-blue-800',
      preparing:  'bg-purple-100 text-purple-800',
      on_the_way: 'bg-cyan-100 text-cyan-800',
      delivered:  'bg-green-100 text-green-800',
      cancelled:  'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending:    t('orders.status_pending'),
      confirmed:  t('orders.status_confirmed'),
      preparing:  t('orders.status_preparing'),
      on_the_way: t('orders.status_on_the_way'),
      delivered:  t('orders.status_delivered'),
      cancelled:  t('orders.status_cancelled'),
    };
    return labels[status] || status;
  };

  const handleCancel = async () => {
    if (window.confirm(t('order_detail.cancel_confirm'))) {
      try {
        await cancelOrderById(id);
        alert(t('order_detail.cancel_success'));
      } catch (error) {
        alert(t('order_detail.cancel_error'));
      }
    }
  };

  if (isLoading) return <Loading />;

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 text-xl">{t('order_detail.not_found')}</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            {t('order_detail.back')}
          </button>
        </div>
      </div>
    );
  }

  const order = selectedOrder.data || selectedOrder;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/orders')}
          className="mb-6 text-blue-500 hover:text-blue-700 font-semibold"
        >
          {t('order_detail.back')}
        </button>

        {error && <ErrorMsg message={error} onDismiss={clearError} />}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{t('order_detail.title')}{order.id}</h1>
                <p className="text-blue-100 mt-2">{order.restaurant_name}</p>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Productos */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('order_detail.products')}</h2>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-3 border-b">
                    <div>
                      <p className="font-semibold text-gray-800">{item.product_name}</p>
                      <p className="text-sm text-gray-600">x{item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-800">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalles de entrega */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">{t('order_detail.delivery')}</h3>
              <p className="text-gray-700">{order.delivery_address}</p>
            </div>

            {/* Notas */}
            {order.notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">{t('order_detail.notes')}</h3>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}

            {/* Resumen financiero */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">{t('order_detail.subtotal')}</span>
                <span className="font-semibold">${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">{t('order_detail.shipping')}</span>
                <span className="font-semibold">${order.delivery_cost?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('order_detail.discount')}</span>
                  <span className="font-semibold">-${order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>{t('order_detail.total')}</span>
                <span className="text-blue-600">${order.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Estado de pago */}
            {order.payment && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">
                  {t('order_detail.paid_at')} {new Date(order.payment.paid_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}

            {/* Tracking */}
            {order.tracking && order.tracking.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-3">{t('order_detail.history')}</h3>
                <div className="space-y-2">
                  {order.tracking.map((track, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      <span className="font-semibold">{getStatusLabel(track.status)}</span>
                      {' '}
                      {new Date(track.changed_at).toLocaleString('es-ES')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4">
              {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  {t('order_detail.cancel_order')}
                </button>
              )}
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
              >
                {t('order_detail.back')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};