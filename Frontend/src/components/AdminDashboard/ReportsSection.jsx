import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../services/adminApi'

export default function ReportsSection() {
  const { t } = useTranslation()
  const [salesData, setSalesData] = useState(null)
  const [restaurantsData, setRestaurantsData] = useState([])
  const [usersData, setUsersData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // FIX 2: Estado de error

  const MONTHS = [t('adminDashboard.months.jan'), t('adminDashboard.months.feb'), t('adminDashboard.months.mar'), t('adminDashboard.months.apr'), t('adminDashboard.months.may'), t('adminDashboard.months.jun'), t('adminDashboard.months.jul'), t('adminDashboard.months.aug'), t('adminDashboard.months.sep'), t('adminDashboard.months.oct'), t('adminDashboard.months.nov'), t('adminDashboard.months.dec')]

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)
      setError(null) // Resetear error al recargar
      try {
        const [sales, restaurants, users] = await Promise.all([
          adminApi.getSalesReport(),
          adminApi.getRestaurantsReport(),
          adminApi.getUsersReport(),
        ])
        setSalesData(sales?.data || null)
        setRestaurantsData(restaurants?.data || [])
        setUsersData(users?.data || null)
      } catch (error) {
        console.error('Error cargando reportes:', error)
        setError('No se pudieron cargar los reportes. Verifica la conexión con el servidor.') // FIX 2: Error visible
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [])

  const fmt = n => Number(n || 0).toLocaleString('es-CO')
  const fmtCOP = n => `$${fmt(n)}`

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 h-32" />
        ))}
      </div>
    )
  }

  // FIX 2: Mostrar error si existe
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center max-w-md">
          <p className="text-red-500 dark:text-red-400 font-semibold"><i className="fas fa-exclamation-triangle mr-1"></i> {error}</p>
        </div>
      </div>
    )
  }

  const byDay = salesData?.by_day || []
  // FIX 1: maxRevenue con fallback seguro
  const maxRevenue = byDay.length > 0
    ? Math.max(...byDay.map(d => Number(d.revenue) || 0))
    : 1

  const newPerMonth = usersData?.new_per_month || []
  // FIX 1: maxUsers con fallback seguro
  const maxUsers = newPerMonth.length > 0
    ? Math.max(...newPerMonth.map(d => Number(d.total) || 0))
    : 1

  // FIX 1: maxOrders con fallback seguro
  const maxOrders = restaurantsData.length > 0
    ? Math.max(...restaurantsData.map(r => Number(r.total_orders) || 0))
    : 1

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t('adminDashboard.reports.monthlyRevenue') || 'Ingresos del mes',
            value: fmtCOP(salesData?.total_revenue),
            sub: `${fmt(salesData?.total_orders)} ${t('adminDashboard.reports.ordersLabel') || 'pedidos entregados'}`,
          },
          {
            label: t('adminDashboard.reports.totalUsers') || 'Usuarios totales',
            value: fmt(usersData?.total),
            sub: `+${fmt(usersData?.new_this_month)} ${t('adminDashboard.reports.this_month') || 'este mes'}`,
          },
          {
            label: t('adminDashboard.reports.topRestaurants') || 'Restaurantes top',
            value: fmt(restaurantsData.length),
            sub: t('adminDashboard.reports.by_volume') || 'por volumen de ventas',
          },
          {
            label: t('adminDashboard.reports.avgOrder') || 'Ingreso promedio',
            value: salesData?.total_orders > 0
              ? fmtCOP(salesData.total_revenue / salesData.total_orders)
              : '$0',
            sub: t('adminDashboard.reports.per_order') || 'por pedido entregado',
          },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <p className="text-2xl font-black text-gray-800 dark:text-slate-100 truncate">{kpi.value}</p>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mt-1">{kpi.label}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">{t('adminDashboard.reports.monthlyRevenue') || 'Ingresos del mes'}</h3>
          <p className="text-xs text-gray-400 mb-6">
            {salesData?.period?.from
              ? `${salesData.period.from} → ${salesData.period.to}`
              : t('adminDashboard.reports.current_month') || 'Mes actual'}
          </p>
          {byDay.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              {t('adminDashboard.reports.no_data') || 'Sin pedidos entregados en este período'}
            </div>
          ) : (
            <div className="flex items-end gap-1 h-48 w-full overflow-x-auto">
              {byDay.map((d, i) => (
                <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-1 group">
                  <div className="w-full flex flex-col justify-end relative h-full">
                    <div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap"
                    >
                      {fmtCOP(d.revenue)}
                    </div>
                    <div
                      className="w-full bg-red-500 rounded-t-lg transition-all duration-500 group-hover:bg-red-600"
                      style={{ height: `${(Number(d.revenue) / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">
                    {/* FIX 3: Fecha sin desfase de zona horaria */}
                    {d.date?.split('-')[2]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">{t('adminDashboard.reports.userGrowth') || 'Nuevos usuarios por mes'}</h3>
          <p className="text-xs text-gray-400 mb-6">{t('adminDashboard.reports.this_year') || 'Año'} {new Date().getFullYear()}</p>
          {newPerMonth.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              {t('adminDashboard.reports.no_data') || 'Sin datos de registro este año'}
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48 w-full">
              {newPerMonth.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex flex-col justify-end relative h-full">
                    <div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap"
                    >
                      {fmt(d.total)}
                    </div>
                    <div
                      className="w-full bg-slate-600 dark:bg-slate-500 rounded-t-lg transition-all duration-500 group-hover:bg-slate-500"
                      style={{ height: `${(Number(d.total) / maxUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">
                    {MONTHS[d.month - 1]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">
          {t('adminDashboard.reports.topRestaurants') || 'Top restaurantes por pedidos'}
        </h3>
        {restaurantsData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">{t('adminDashboard.reports.no_data') || 'Sin datos de restaurantes'}</p>
        ) : (
          <div className="space-y-4">
            {restaurantsData.map((r, i) => (
              <div key={r.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-gray-700 dark:text-slate-300">
                    {i + 1}. {r.name}
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">
                    {fmt(r.total_orders)} {t('adminDashboard.reports.ordersLabel') || 'pedidos'} · {fmtCOP(r.revenue)}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${(r.total_orders / maxOrders) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}