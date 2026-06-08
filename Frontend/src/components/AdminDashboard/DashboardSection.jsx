import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { Badge } from '../RestaurantDashboard/Common';

export default function DashboardSection({ stats, restaurants, users, orders }) {
  const { t } = useTranslation();
  
  const recentOrders = orders.slice(0, 4);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('adminDashboard.kpi.activeRestaurants', { defaultValue: 'Restaurantes Activos' }), value: restaurants.filter(r => r.status === 'active').length, icon: '🏪', trend: t('adminDashboard.kpi.trend3month', { defaultValue: '+3 este mes' }) },
          { label: t('adminDashboard.kpi.activeUsers', { defaultValue: 'Usuarios Activos' }), value: users.filter(u => u.status === 'active').length, icon: '👥', trend: t('adminDashboard.kpi.trend12month', { defaultValue: '+12% este mes' }) },
          { label: t('adminDashboard.kpi.totalOrders', { defaultValue: 'Pedidos Totales' }), value: orders.length, icon: '📦', trend: t('adminDashboard.kpi.trend8day', { defaultValue: '+8% vs ayer' }) },
          { label: t('adminDashboard.kpi.platformRevenue', { defaultValue: 'Ingresos Plataforma' }), value: '$4,250.00', icon: '💰', trend: '+15%' }
        ].map((kpi, i) => (
          <div key={i} className="ad-stat-card">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-orange-50 dark:bg-slate-800 text-red-500">
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-0.5">{kpi.value}</p>
              <p className="text-xs font-semibold text-green-500">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-gray-800 dark:text-white">{t('adminDashboard.recentOrders.title', { defaultValue: 'Pedidos Recientes' })}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  {[t('adminDashboard.orderTable.date', { defaultValue: 'Fecha' }), t('adminDashboard.orderTable.customer', { defaultValue: 'Cliente' }), t('adminDashboard.orderTable.restaurant', { defaultValue: 'Restaurante' }), t('adminDashboard.orderTable.amount', { defaultValue: 'Monto' }), t('adminDashboard.orderTable.status', { defaultValue: 'Estado' })].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {recentOrders.map(o => (
                  <tr key={o.id} className="ad-table-row">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-red-500">{o.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">
                      {typeof o.customer === 'object' && o.customer !== null ? o.customer.name : (o.customer_name ?? o.customer)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                      {typeof o.restaurant === 'object' && o.restaurant !== null ? o.restaurant.name : (o.restaurant_name ?? o.restaurant)}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-950 dark:text-slate-100">${Number(o.total ?? o.amount ?? 0).toFixed(2)}</td>
                    <td className="px-6 py-4"><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('adminDashboard.alerts.title', { defaultValue: 'Alertas del Sistema' })}</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-slate-800/40 rounded-xl border border-orange-100 dark:border-orange-950/20">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-slate-200">2 {t('adminDashboard.alerts.pendingRest', { defaultValue: 'Restaurantes pendientes' })}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Requieren aprobación</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-slate-800/40 rounded-xl border border-red-100 dark:border-red-950/20">
              <span className="text-xl">💬</span>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-slate-200">14 {t('adminDashboard.alerts.unanswered', { defaultValue: 'Reseñas sin responder' })}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Atención requerida</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
