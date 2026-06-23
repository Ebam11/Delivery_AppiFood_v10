// Frontend/src/components/AdminDashboard/OrdersSection.jsx
import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { Badge } from '../RestaurantDashboard/Common';

export default function OrdersSection({ 
  orders, 
  loading, 
  onUpdateStatus,
  onDelete,
  pagination 
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  // ORDER STATUSES para acciones
  const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];

  const visible = orders.filter(o => {
    const customer = o.user?.name || o.customer_name || '';
    const restaurant = o.restaurant?.name || o.restaurant_name || '';
    return customer.toLowerCase().includes(search.toLowerCase()) || 
           restaurant.toLowerCase().includes(search.toLowerCase()) || 
           String(o.id).includes(search);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">
          {t('adminDashboard.breadcrumb.globalOrders', { defaultValue: 'Pedidos Globales' })}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({orders.length} total)
          </span>
        </h3>
        
        <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2">
          <span className="text-gray-400 dark:text-slate-500">🔍</span>
          <input
            placeholder={t('adminDashboard.orderSearch', { defaultValue: 'Buscar pedido...' })}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-full sm:w-80 text-gray-700 dark:text-slate-200 bg-transparent placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.orderTable.date', { defaultValue: 'Fecha' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.orderTable.customer', { defaultValue: 'Cliente' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.orderTable.restaurant', { defaultValue: 'Restaurante' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.orderTable.amount', { defaultValue: 'Monto' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.orderTable.status', { defaultValue: 'Estado' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.orderTable.actions', { defaultValue: 'Acciones' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {visible.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition group">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs font-bold text-red-500">#{o.id}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-slate-200">
                    {o.user?.name || o.customer_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 dark:text-slate-400">
                    {o.restaurant?.name || o.restaurant_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900 dark:text-white">
                    ${Number(o.total || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={o.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                      <select
                        value={o.status || 'pending'}
                        onChange={(e) => onUpdateStatus?.(o.id, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200"
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => onDelete?.(o.id)}
                        className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    No se encontraron pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination && pagination.total > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-slate-400">
          <span>
            Mostrando {pagination.from || 0} - {pagination.to || 0} de {pagination.total || 0}
          </span>
        </div>
      )}
    </div>
  );
}