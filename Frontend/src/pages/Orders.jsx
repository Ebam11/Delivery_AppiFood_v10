// Archivo: src/pages/Orders.jsx | Comentario: logica principal del modulo.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
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
      pending:    'bg-yellow-100 text-yellow-850 dark:bg-yellow-950/30 dark:text-yellow-400',
      confirmed:  'bg-blue-100 text-blue-850 dark:bg-blue-950/30 dark:text-blue-400',
      preparing:  'bg-purple-100 text-purple-850 dark:bg-purple-950/30 dark:text-purple-400',
      on_the_way: 'bg-cyan-100 text-cyan-850 dark:bg-cyan-950/30 dark:text-cyan-400',
      delivered:  'bg-green-100 text-green-850 dark:bg-green-950/30 dark:text-green-400',
      cancelled:  'bg-red-100 text-red-850 dark:bg-red-950/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200';
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
    <div className="page-orders min-h-screen bg-gray-50 dark:bg-slate-950 p-6 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">{t('orders.title')}</h1>

        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        {!orders || orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-slate-400 text-xl mb-4">
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
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-lg text-gray-800 dark:text-white flex items-center gap-2">
                      <i className="fas fa-receipt text-gray-400 dark:text-slate-500" />
                      {t('orders.order_number')}{order.id}
                    </h3>
                    <p className="text-gray-600 dark:text-slate-300 font-bold mt-1">
                      {order.restaurant_name || t('orders.restaurant')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-semibold flex items-center gap-1.5">
                      <i className="far fa-clock" />
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <p className="text-2xl font-black text-brand">
                      ${Number(order.total || 0).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
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