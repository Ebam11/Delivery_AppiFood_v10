import { useTranslation } from 'react-i18next'
import { COLORS, ACTIVITY } from '../../data/restaurantDashboardData'
import { Badge } from './Common'

/**
 * Sección principal del Dashboard con estadísticas y gráficos.
 */
export default function DashboardSection({ orders, menu, stats, loading }) {
  const { t } = useTranslation()
  
  // Helpers para simular datos de gráficos
  const toPercent = (value, max = 100) => {
    const safeMax = Math.max(Number(max) || 0, 1)
    return `${Math.max(0, Math.min(100, (Number(value) / safeMax) * 100))}%`
  }

  const generateMockSeries = ({ points = 8, base = 80, wave = 18, trend = 2, floor = 12 }) => (
    Array.from({ length: points }, (_, i) => {
      const val = base + Math.sin((i + 1) * 0.85) * wave + i * trend + ((i % 2) ? 4 : -3)
      return Math.max(floor, Math.round(val))
    })
  )

  // Datos procesados
  const totalOrders = stats?.orders?.total || orders.length
  const totalRevenue = stats?.revenue?.total || orders.reduce((s,o) => s + o.amount, 0)
  const completedOrders = stats?.orders?.total ? Math.round(stats.orders.total * 0.75) : orders.filter(o => o.status === 'completed').length
  
  const avgOrderAmount = totalOrders ? totalRevenue / totalOrders : 18
  const BARS_INCOME  = generateMockSeries({ points: 8, base: Math.round(avgOrderAmount * 2.2), wave: 16, trend: 2, floor: 35 })
  const BARS_EXPENSE = BARS_INCOME.map((v, i) => Math.max(16, Math.round(v * (0.38 + (i % 3) * 0.04))))
  
  const MONTHS = ['Mar','Abr','May','Jun','Jul','Ago','Sep','Oct']
  const WEEK   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
  const WEEK_ORDERS = generateMockSeries({ points: 7, base: Math.max(totalOrders * 14, 85), wave: 24, trend: 3, floor: 40 })
  const maxV = Math.max(...WEEK_ORDERS, 1)

  const recentOrders = orders.slice(0, 3)
  const trending     = menu.slice(0, 3)

  return (
    <div className="space-y-6">
      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          {t('rd.loading_data') || "Cargando datos del restaurante..."}
        </div>
      )}

      {/* Tarjetas de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t('rd.total_orders'), value: totalOrders,                       trend:'+1.58%', icon:'📋' },
          { label: t('rd.completed'),    value: completedOrders,                    trend:'+0.42%', icon:'✅' },
          { label: t('rd.income'),       value:`$${totalRevenue.toLocaleString()}`, trend:'+2.36%', icon:'💰' },
        ].map((m,i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: COLORS.primaryLight }}>{m.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{m.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{m.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: COLORS.primary }}>↑ {m.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Ingresos y Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-gray-400">{t('rd.total_revenue')}</p>
              <p className="text-2xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS.primary }} />{t('rd.incomes')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-800 inline-block" />{t('rd.expenses')}</span>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[520px] flex items-end gap-2 h-44 pr-2">
              {BARS_INCOME.map((h,i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end gap-0.5" style={{ height:'100%' }}>
                    <div className="w-full rounded-sm" style={{ height: toPercent(BARS_EXPENSE[i], 100), background:'#1a202c', opacity:0.85 }} />
                    <div className="w-full rounded-sm" style={{ height: toPercent(Math.max(0, h - BARS_EXPENSE[i]), 100), background: COLORS.primary }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">{t('rd.top_categories')}</p>
          <div className="space-y-4">
            {[
              { label: t('rd.main_dishes'), pct:'45%', color: COLORS.primary },
              { label: t('rd.drinks'),      pct:'25%', color:'#1a202c' },
              { label: t('rd.starters'),    pct:'20%', color:'#fbbf24' },
              { label: t('rd.desserts'),    pct:'10%', color:'#e5e7eb' },
            ].map((c,i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{c.label}</span>
                  <span className="font-bold text-gray-800">{c.pct}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: c.pct, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Órdenes Recientes y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <p className="font-semibold text-gray-800 text-sm">{t('rd.recent_orders')}</p>
            <button className="text-xs font-bold" style={{ color: COLORS.primary }}>{t('rd.view_all')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  {[t('rd.order_id'), t('rd.customer'), t('rd.amount'), t('rd.status')].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: COLORS.primary }}>{o.id}</td>
                    <td className="px-5 py-3 text-gray-800 font-medium">{o.customer}</td>
                    <td className="px-5 py-3 font-bold">${o.amount.toFixed(2)}</td>
                    <td className="px-5 py-3"><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">{t('rd.recent_activity')}</p>
          <div className="space-y-4">
            {ACTIVITY.map((a,i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: COLORS.primaryLight }}>{a.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-800 font-semibold">{a.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{a.action}</p>
                  <p className="text-[10px] text-gray-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
