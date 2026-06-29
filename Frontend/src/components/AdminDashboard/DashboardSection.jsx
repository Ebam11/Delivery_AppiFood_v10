// Frontend/src/components/AdminDashboard/DashboardSection.jsx
import { useTranslation } from 'react-i18next'
import { Badge } from '../RestaurantDashboard/Common'

export default function DashboardSection({ stats, loading }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-gray-500">
        {t('adminDashboard.no_data') || 'No hay datos disponibles'}
      </div>
    )
  }

  const kpis = [
    {
      label: t('adminDashboard.kpi.activeRestaurants', { defaultValue: 'Restaurantes' }),
      value: stats.restaurants?.total || 0,
      detail: `${stats.restaurants?.active || 0} ${t('adminDashboard.status.active')} • ${stats.restaurants?.pending || 0} ${t('adminDashboard.status.pending')}`,
      icon: 'fa-store',
      color: '#f59e0b',
      trend: `${stats.restaurants?.verified || 0} ${t('adminDashboard.status.verified') || 'verificados'}`
    },
    {
      label: t('adminDashboard.kpi.activeUsers', { defaultValue: 'Usuarios' }),
      value: stats.users?.total || 0,
      detail: `${stats.users?.customers || 0} ${t('adminDashboard.userTypes.customers') || 'clientes'} • ${stats.users?.restaurants || 0} ${t('adminDashboard.userTypes.restaurants') || 'restaurantes'}`,
      icon: 'fa-users',
      color: '#3b82f6',
      trend: `${stats.users?.new_today || 0} ${t('adminDashboard.kpi.new_today') || 'nuevos hoy'}`
    },
    {
      label: t('adminDashboard.kpi.totalOrders', { defaultValue: 'Órdenes' }),
      value: stats.orders?.total || 0,
      detail: `${stats.orders?.pending || 0} ${t('adminDashboard.status.pending')} • ${stats.orders?.delivered || 0} ${t('orders.status_delivered')}`,
      icon: 'fa-bag-shopping',
      color: '#8b5cf6',
      trend: `${stats.orders?.today || 0} ${t('adminDashboard.kpi.today') || 'hoy'}`
    },
    {
      label: t('adminDashboard.kpi.platformRevenue', { defaultValue: 'Ingresos' }),
      value: `$${Number(stats.revenue?.total || 0).toFixed(2)}`,
      detail: `$${Number(stats.revenue?.today || 0).toFixed(2)} ${t('adminDashboard.kpi.today') || 'hoy'}`,
      icon: 'fa-money-bill-trend-up',
      color: '#10b981',
      trend: `$${Number(stats.revenue?.this_month || 0).toFixed(2)} ${t('adminDashboard.kpi.this_month') || 'este mes'}`
    }
  ]

  const recentOrders = stats.recent_orders || []

  return (
    <div className="space-y-6 animate-fade-in">
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
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${kpi.color}20` }}
              >
                <i className={`fas ${kpi.icon} text-xl`} style={{ color: kpi.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

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
  )
}