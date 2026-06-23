import { useState, useEffect } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { adminApi } from '../../services/adminApi';

export default function ReportsSection() {
  const { t } = useTranslation();
  const [salesData, setSalesData] = useState(null);
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [usersData, setUsersData] = useState(null);
  const [loading, setLoading] = useState(true);

  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [sales, restaurants, users] = await Promise.all([
          adminApi.getSalesReport(),
          adminApi.getRestaurantsReport(),
          adminApi.getUsersReport(),
        ]);
        setSalesData(sales?.data || null);
        setRestaurantsData(restaurants?.data || []);
        setUsersData(users?.data || null);
      } catch (error) {
        console.error('Error cargando reportes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const fmt = n => Number(n || 0).toLocaleString('es-CO');
  const fmtCOP = n => `$${fmt(n)}`;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 h-32" />
        ))}
      </div>
    );
  }

  // Preparar datos de ventas por día para la gráfica
  const byDay = salesData?.by_day || [];
  const maxRevenue = Math.max(...byDay.map(d => Number(d.revenue)), 1);

  // Preparar datos de usuarios por mes
  const newPerMonth = usersData?.new_per_month || [];
  const maxUsers = Math.max(...newPerMonth.map(d => Number(d.total)), 1);

  // Top restaurante para calcular porcentajes
  const maxOrders = Math.max(...restaurantsData.map(r => r.total_orders), 1);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Ingresos del mes',
            value: fmtCOP(salesData?.total_revenue),
            sub: `${fmt(salesData?.total_orders)} pedidos entregados`,
          },
          {
            label: 'Usuarios totales',
            value: fmt(usersData?.total),
            sub: `+${fmt(usersData?.new_this_month)} este mes`,
          },
          {
            label: 'Restaurantes top',
            value: fmt(restaurantsData.length),
            sub: 'por volumen de ventas',
          },
          {
            label: 'Ingreso promedio',
            value: salesData?.total_orders > 0
              ? fmtCOP(salesData.total_revenue / salesData.total_orders)
              : '$0',
            sub: 'por pedido entregado',
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

        {/* Gráfica de ingresos por día */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">Ingresos del mes</h3>
          <p className="text-xs text-gray-400 mb-6">
            {salesData?.period?.from
              ? `${salesData.period.from} → ${salesData.period.to}`
              : 'Mes actual'}
          </p>
          {byDay.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Sin pedidos entregados en este período
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
                    {new Date(d.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gráfica de nuevos usuarios por mes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">Nuevos usuarios por mes</h3>
          <p className="text-xs text-gray-400 mb-6">Año {new Date().getFullYear()}</p>
          {newPerMonth.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Sin datos de registro este año
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

      {/* Top restaurantes por pedidos */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">
          Top restaurantes por pedidos
        </h3>
        {restaurantsData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin datos de restaurantes</p>
        ) : (
          <div className="space-y-4">
            {restaurantsData.map((r, i) => (
              <div key={r.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-gray-700 dark:text-slate-300">
                    {i + 1}. {r.name}
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">
                    {fmt(r.total_orders)} pedidos · {fmtCOP(r.revenue)}
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
  );
}