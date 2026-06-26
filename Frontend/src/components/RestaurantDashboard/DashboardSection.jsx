import { useTranslation } from 'react-i18next'
import { COLORS, ACTIVITY } from './constants'
import { Badge } from './Common'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function DashboardSection({ orders, menu, stats, loading }) {
  const { t } = useTranslation()
  
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

  const totalOrders = stats?.orders?.total || orders.length
  const totalRevenue = stats?.revenue?.total || orders.reduce((s,o) => s + o.amount, 0)
  const completedOrders = stats?.orders?.total ? Math.round(stats.orders.total * 0.75) : orders.filter(o => o.status === 'completed').length
  
  const avgOrderAmount = totalOrders ? totalRevenue / totalOrders : 18
  const BARS_INCOME  = generateMockSeries({ points: 8, base: Math.round(avgOrderAmount * 2.2), wave: 16, trend: 2, floor: 35 })
  const BARS_EXPENSE = BARS_INCOME.map((v, i) => Math.max(16, Math.round(v * (0.38 + (i % 3) * 0.04))))
  
  const MONTHS = [t('rd.months.mar', { defaultValue: 'Mar' }), t('rd.months.apr', { defaultValue: 'Abr' }), t('rd.months.may', { defaultValue: 'May' }), t('rd.months.jun', { defaultValue: 'Jun' }), t('rd.months.jul', { defaultValue: 'Jul' }), t('rd.months.aug', { defaultValue: 'Ago' }), t('rd.months.sep', { defaultValue: 'Sep' }), t('rd.months.oct', { defaultValue: 'Oct' })]
  const WEEK   = [t('rd.days.mon', { defaultValue: 'Lun' }), t('rd.days.tue', { defaultValue: 'Mar' }), t('rd.days.wed', { defaultValue: 'Mié' }), t('rd.days.thu', { defaultValue: 'Jue' }), t('rd.days.fri', { defaultValue: 'Vie' }), t('rd.days.sat', { defaultValue: 'Sáb' }), t('rd.days.sun', { defaultValue: 'Dom' })]
  const WEEK_ORDERS = generateMockSeries({ points: 7, base: Math.max(totalOrders * 14, 85), wave: 24, trend: 3, floor: 40 })
  const maxV = Math.max(...WEEK_ORDERS, 1)

  const recentOrders = orders.slice(0, 3)
  const trending     = menu.slice(0, 3)

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#a1a1aa' : '#64748b'
  const gridColor = isDark ? '#2e2e3e' : '#f1f5f9'

  const incomeData = {
    labels: MONTHS,
    datasets: [
      {
        label: t('rd.incomes') || 'Ingresos',
        data: BARS_INCOME,
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}15`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: COLORS.primary,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t('rd.expenses') || 'Gastos',
        data: BARS_EXPENSE,
        borderColor: isDark ? '#cbd5e1' : '#1e293b',
        backgroundColor: isDark ? '#cbd5e105' : '#1e293b05',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: isDark ? '#cbd5e1' : '#1e293b',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ]
  }

  const categoryData = {
    labels: [t('rd.main_dishes'), t('rd.drinks'), t('rd.starters'), t('rd.desserts')],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: [COLORS.primary, '#1e293b', '#fbbf24', '#cbd5e1'],
        borderWidth: 0,
      }
    ]
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 10,
        cornerRadius: 12,
        backgroundColor: isDark ? '#1e1e2e' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#1e293b',
        bodyColor: isDark ? '#e4e4e7' : '#64748b',
        borderColor: isDark ? '#2e2e3e' : '#e2e8f0',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'transparent',
        },
        ticks: {
          color: textColor,
          font: { family: 'Inter', size: 10, weight: 'bold' }
        }
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { family: 'Inter', size: 10 }
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        padding: 10,
        cornerRadius: 12,
        backgroundColor: isDark ? '#1e1e2e' : '#ffffff',
        bodyColor: isDark ? '#e4e4e7' : '#64748b',
        borderColor: isDark ? '#2e2e3e' : '#e2e8f0',
        borderWidth: 1,
      }
    },
    cutout: '72%',
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
          {t('rd.loading_data') || "Cargando datos del restaurante..."}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t('rd.total_orders'), value: totalOrders, trend:'+1.58%', icon:'📋' },
          { label: t('rd.completed'),    value: completedOrders, trend:'+0.42%', icon:'✅' },
          { label: t('rd.income'),       value:`$${totalRevenue.toLocaleString()}`, trend:'+2.36%', icon:'💰' },
        ].map((m,i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: COLORS.primaryLight }}>{m.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{m.label}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-0.5">{m.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: COLORS.primary }}>↑ {m.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">{t('rd.total_revenue') || 'Ingresos Totales'}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS.primary }} />{t('rd.incomes') || 'Ingresos'}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block bg-gray-800 dark:bg-slate-400" />{t('rd.expenses') || 'Gastos'}</span>
            </div>
          </div>
          <div className="h-56">
            <Line data={incomeData} options={lineOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <p className="font-semibold text-gray-800 dark:text-white text-sm mb-2">{t('rd.top_categories') || 'Categorías Top'}</p>
          <div className="h-36 relative flex items-center justify-center">
            <Doughnut data={categoryData} options={doughnutOptions} />
            <div className="absolute flex flex-col items-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('rd.sales') || 'Ventas'}</span>
              <span className="text-2xl font-black text-gray-800 dark:text-white">100%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { label: t('rd.main_dishes') || 'Platos', pct:'45%', color: COLORS.primary },
              { label: t('rd.drinks'), pct:'25%', color:'#1e293b' },
              { label: t('rd.starters') || 'Entradas',    pct:'20%', color:'#fbbf24' },
              { label: t('rd.desserts'), pct:'10%', color:'#e5e7eb' },
            ].map((c,i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: c.color }} />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold truncate flex-1">{c.label}</span>
                <span className="text-[10px] text-gray-800 dark:text-white font-black">{c.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <p className="font-semibold text-gray-800 dark:text-white text-sm">{t('rd.recent_orders')}</p>
            <button className="text-xs font-bold" style={{ color: COLORS.primary }}>{t('rd.view_all')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 dark:bg-slate-800/30">
                <tr>
                  {[t('rd.order_id'), t('rd.customer'), t('rd.amount'), t('rd.status')].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: COLORS.primary }}>{o.id}</td>
                    <td className="px-5 py-3 text-gray-800 dark:text-slate-200 font-medium">{o.customer}</td>
                    <td className="px-5 py-3 font-bold text-gray-850 dark:text-slate-100">${o.amount.toFixed(2)}</td>
                    <td className="px-5 py-3"><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 dark:text-white text-sm mb-4">{t('rd.recent_activity')}</p>
          <div className="space-y-4">
            {ACTIVITY.map((a,i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: COLORS.primaryLight }}>
                <i className={`fas ${a.icon} text-sm`} style={{ color: COLORS.primary }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-800 dark:text-slate-200 font-semibold">{t(a.nameKey)}</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{t(a.actionKey)}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{t(a.timeKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}