// Archivo: src/pages/Orders.jsx | Comentario: logica principal del modulo.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrderStore } from '../store/orderStore';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';

export const Orders = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { orders, isLoading, error, fetchOrders, clearError } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

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

  if (isLoading) return <Loading />;

  return (
    <div className="page-orders min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">{t('orders.title')}</h1>

        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-xl mb-4">
              {t('orders.no_orders')}
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t('orders.first_order')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {t('orders.order_number')}{order.id}
                    </h3>
                    <p className="text-gray-600">
                      {order.restaurant_name || t('orders.restaurant')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      ${Number(order.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      {order.items.length} {order.items.length !== 1 ? t('orders.products_plural') : t('orders.products')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};