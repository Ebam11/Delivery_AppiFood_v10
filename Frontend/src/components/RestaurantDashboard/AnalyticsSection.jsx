import { useTranslation } from 'react-i18next'

export default function AnalyticsSection({ stats }) {
  const { t } = useTranslation()

  const toPercent = (val, max = 100) => `${Math.min(100, Math.max(0, (val / max) * 100))}%`
  const MONTHS = [
    t('restaurantDashboard.analytics.months.jan', { defaultValue: 'Ene' }),
    t('restaurantDashboard.analytics.months.feb', { defaultValue: 'Feb' }),
    t('restaurantDashboard.analytics.months.mar', { defaultValue: 'Mar' }),
    t('restaurantDashboard.analytics.months.apr', { defaultValue: 'Abr' }),
    t('restaurantDashboard.analytics.months.may', { defaultValue: 'May' }),
    t('restaurantDashboard.analytics.months.jun', { defaultValue: 'Jun' })
  ]

  const totalOrders = stats?.orders?.total || 0
  const totalRevenue = stats?.revenue?.total || 0
  const avgTicket = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
  const avgRating = stats?.rating?.average ? Number(stats.rating.average).toFixed(1) : '0.0'

  const REVENUE_DATA = totalOrders > 0 ? [1500, 1800, 1650, 2100, 2400, 2800] : [0, 0, 0, 0, 0, 0]
  const topDishes = totalOrders > 0 ? [
    { name: t('rd.double_cheese_burger') || 'Hamburguesa Doble Queso', sales: 342, pct: '100%' },
    { name: t('rd.large_fries') || 'Papas Fritas Grandes', sales: 280, pct: '81%' },
    { name: t('rd.family_combo') || 'Combo Familiar', sales: 195, pct: '57%' },
    { name: t('rd.soda_15l') || 'Gaseosa 1.5L', sales: 150, pct: '43%' },
  ] : []

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('rd.total_revenue'), value: `$${totalRevenue.toLocaleString()}`, trend: `${t('rd.today')}: $${(stats?.revenue?.today || 0).toLocaleString()}` },
          { label: t('rd.orders'), value: totalOrders, trend: `${t('rd.today')}: ${(stats?.orders?.today || 0)}` },
          { label: t('rd.avg_ticket'), value: `$${avgTicket}`, trend: t('rd.general') || 'General' },
          { label: t('rd.avg_rating'), value: avgRating, trend: `${stats?.rating?.total || 0} ${t('rd.reviews')}` },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <p className="text-3xl font-black text-gray-800 dark:text-slate-100">{stat.value}</p>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mt-1">{stat.label}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold">{stat.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-6">
            {t('rd.revenue_chart') || 'Evolución de Ingresos'}
          </h3>
          {totalOrders > 0 ? (
            <div className="flex items-end gap-2 h-48 w-full">
              {REVENUE_DATA.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex flex-col justify-end relative h-full">
                    <div className="absolute -top-8 bg-gray-800 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 w-full text-center">
                      ${val}
                    </div>
                    <div className="w-full bg-red-500 rounded-t-lg transition-all duration-500 group-hover:bg-red-600" style={{ height: toPercent(val, 3000) }} />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 text-sm gap-2">
              <i className="fas fa-chart-line text-3xl opacity-40"></i>
              <span className="font-bold">Aún no hay ventas registradas</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-6">
            {t('rd.top_dishes') || 'Platos Más Vendidos'}
          </h3>
          {totalOrders > 0 ? (
            <div className="space-y-4">
              {topDishes.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-gray-700 dark:text-slate-300">{i+1}. {d.name}</span>
                    <span className="text-gray-500 dark:text-slate-400">{d.sales} {t('rd.sales_short') || 'ventas'}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: d.pct }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 text-sm gap-2">
              <i className="fas fa-pizza-slice text-3xl opacity-40"></i>
              <span className="font-bold">Aún no hay platos vendidos</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}