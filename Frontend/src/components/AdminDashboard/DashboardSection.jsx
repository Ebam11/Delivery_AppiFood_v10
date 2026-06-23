// Frontend/src/components/AdminDashboard/DashboardSection.jsx
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { Badge } from '../RestaurantDashboard/Common';

export default function DashboardSection({ stats, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  // DATOS REALES
  const kpis = [
    {
      label: t('adminDashboard.kpi.activeRestaurants', { defaultValue: 'Restaurantes' }),
      value: stats.restaurants?.total || 0,
      detail: `${stats.restaurants?.active || 0} activos • ${stats.restaurants?.pending || 0} pendientes`,
      icon: '🏪',
      trend: `${stats.restaurants?.verified || 0} verificados`
    },
    {
      label: t('adminDashboard.kpi.activeUsers', { defaultValue: 'Usuarios' }),
      value: stats.users?.total || 0,
      detail: `${stats.users?.customers || 0} clientes • ${stats.users?.restaurants || 0} restaurantes`,
      icon: '👥',
      trend: `${stats.users?.new_today || 0} nuevos hoy`
    },
    {
      label: t('adminDashboard.kpi.totalOrders', { defaultValue: 'Órdenes' }),
      value: stats.orders?.total || 0,
      detail: `${stats.orders?.pending || 0} pendientes • ${stats.orders?.delivered || 0} entregadas`,
      icon: '📦',
      trend: `${stats.orders?.today || 0} hoy`
    },
    {
      label: t('adminDashboard.kpi.platformRevenue', { defaultValue: 'Ingresos' }),
      value: `$${Number(stats.revenue?.total || 0).toFixed(2)}`,
      detail: `$${Number(stats.revenue?.today || 0).toFixed(2)} hoy`,
      icon: '💰',
      trend: `$${Number(stats.revenue?.this_month || 0).toFixed(2)} este mes`
    }
  ];

  // Últimas órdenes (si las tienes en stats)
  const recentOrders = stats.recent_orders || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="ad-stat-card bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase">
                  {kpi.label}
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                  {kpi.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                  {kpi.detail}
                </p>
                <p className="text-xs font-semibold text-green-500 mt-2">
                  {kpi.trend}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-orange-50 dark:bg-slate-800">
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de órdenes recientes */}
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-gray-800 dark:text-white">
              {t('adminDashboard.recentOrders.title', { defaultValue: 'Órdenes Recientes' })}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    {t('adminDashboard.orderTable.date', { defaultValue: 'Fecha' })}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    {t('adminDashboard.orderTable.customer', { defaultValue: 'Cliente' })}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    {t('adminDashboard.orderTable.restaurant', { defaultValue: 'Restaurante' })}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    {t('adminDashboard.orderTable.amount', { defaultValue: 'Monto' })}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    {t('adminDashboard.orderTable.status', { defaultValue: 'Estado' })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">
                      {order.user?.name || order.customer_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                      {order.restaurant?.name || order.restaurant_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      ${Number(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}