import { useTranslate as useTranslation } from '../../hooks/useTranslate';

export default function AnalyticsSection({ stats }) {
  const { t } = useTranslation();

  const toPercent = (val, max = 100) => `${Math.min(100, Math.max(0, (val / max) * 100))}%`;
  const MONTHS = [t('restaurantDashboard.analytics.months.jan', { defaultValue: 'Ene' }), t('restaurantDashboard.analytics.months.feb', { defaultValue: 'Feb' }), t('restaurantDashboard.analytics.months.mar', { defaultValue: 'Mar' }), t('restaurantDashboard.analytics.months.apr', { defaultValue: 'Abr' }), t('restaurantDashboard.analytics.months.may', { defaultValue: 'May' }), t('restaurantDashboard.analytics.months.jun', { defaultValue: 'Jun' })];
  const REVENUE_DATA = [1500, 1800, 1650, 2100, 2400, 2800];

  const totalOrders = stats?.orders?.total || 0;
  const totalRevenue = stats?.revenue?.total || 0;
  const avgTicket = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
  const avgRating = stats?.rating?.average ? Number(stats.rating.average).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('restaurantDashboard.analytics.totalRevenue', { defaultValue: 'Ingresos Totales' }), value: `$${totalRevenue.toLocaleString()}`, trend: 'Hoy: $' + (stats?.revenue?.today || 0) },
          { label: t('restaurantDashboard.analytics.orders', { defaultValue: 'Pedidos' }), value: totalOrders, trend: 'Hoy: ' + (stats?.orders?.today || 0) },
          { label: t('restaurantDashboard.analytics.avgTicket', { defaultValue: 'Ticket Promedio' }), value: `$${avgTicket}`, trend: 'General' },
          { label: t('restaurantDashboard.analytics.rating', { defaultValue: 'Calificación Prom.' }), value: `⭐ ${avgRating}`, trend: `${stats?.rating?.total || 0} reseñas` },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-black text-gray-800">{stat.value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{stat.label}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">{stat.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">{t('restaurantDashboard.analytics.revenueChart', { defaultValue: 'Evolución de Ingresos' })}</h3>
          <div className="flex items-end gap-2 h-48 w-full">
            {REVENUE_DATA.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col justify-end relative h-full">
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 w-full text-center">
                    ${val}
                  </div>
                  <div className="w-full bg-red-500 rounded-t-lg transition-all duration-500 group-hover:bg-red-600" style={{ height: toPercent(val, 3000) }} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">{t('restaurantDashboard.analytics.topDishes', { defaultValue: 'Platos Más Vendidos' })}</h3>
          <div className="space-y-4">
            {[
              { name: 'Hamburguesa Doble Queso', sales: 342, pct: '100%' },
              { name: 'Papas Fritas Grandes', sales: 280, pct: '81%' },
              { name: 'Combo Familiar', sales: 195, pct: '57%' },
              { name: 'Gaseosa 1.5L', sales: 150, pct: '43%' },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-gray-700">{i+1}. {d.name}</span>
                  <span className="text-gray-500">{d.sales} ventas</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: d.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
