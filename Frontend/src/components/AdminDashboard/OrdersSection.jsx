import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { Badge } from '../RestaurantDashboard/Common';

export default function OrdersSection({ orders }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const visible = orders.filter(o => {
    const customer = typeof o.customer === 'object' && o.customer !== null ? o.customer.name : (o.customer_name ?? o.customer ?? '');
    const restaurant = typeof o.restaurant === 'object' && o.restaurant !== null ? o.restaurant.name : (o.restaurant_name ?? o.restaurant ?? '');
    return customer.toLowerCase().includes(search.toLowerCase()) || 
           restaurant.toLowerCase().includes(search.toLowerCase()) || 
           String(o.id).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">
          {t('adminDashboard.breadcrumb.globalOrders', { defaultValue: 'Pedidos Globales' })}
        </h3>
        
        <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2">
          <span className="text-gray-400 dark:text-slate-500">🔍</span>
          <input
            placeholder={t('adminDashboard.orderSearch', { defaultValue: 'Buscar pedido, cliente o restaurante...' })}
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
                {[
                  t('adminDashboard.orderTable.date', { defaultValue: 'Fecha' }),
                  t('adminDashboard.orderTable.customer', { defaultValue: 'Cliente' }),
                  t('adminDashboard.orderTable.restaurant', { defaultValue: 'Restaurante' }),
                  t('adminDashboard.orderTable.amount', { defaultValue: 'Monto' }),
                  t('adminDashboard.orderTable.status', { defaultValue: 'Estado' })
                ].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {visible.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs font-bold text-red-500">{o.id}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{o.date} - {o.time}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-slate-200">
                    {typeof o.customer === 'object' && o.customer !== null ? o.customer.name : (o.customer_name ?? o.customer)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 dark:text-slate-400">
                    {typeof o.restaurant === 'object' && o.restaurant !== null ? o.restaurant.name : (o.restaurant_name ?? o.restaurant)}
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900 dark:text-white">${Number(o.total ?? o.amount ?? 0).toFixed(2)}</td>
                  <td className="px-6 py-4"><Badge status={o.status} /></td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    No se encontraron pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
