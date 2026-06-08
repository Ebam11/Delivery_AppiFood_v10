import { useTranslate as useTranslation } from '../../hooks/useTranslate';

export default function ReportsSection() {
  const { t } = useTranslation();

  // Helper para generar barras (reusando lógica de los otros gráficos)
  const toPercent = (val, max = 100) => `${Math.min(100, Math.max(0, (val / max) * 100))}%`;
  const MONTHS = [t('adminDashboard.months.jan', { defaultValue: 'Ene' }), t('adminDashboard.months.feb', { defaultValue: 'Feb' }), t('adminDashboard.months.mar', { defaultValue: 'Mar' }), t('adminDashboard.months.apr', { defaultValue: 'Abr' }), t('adminDashboard.months.may', { defaultValue: 'May' }), t('adminDashboard.months.jun', { defaultValue: 'Jun' }), t('adminDashboard.months.jul', { defaultValue: 'Jul' })];
  const REVENUE_DATA = [45, 52, 48, 61, 59, 75, 82]; // En miles (K)
  const USERS_DATA = [120, 150, 180, 220, 290, 340, 410]; 

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('adminDashboard.reports.annualRevenue', { defaultValue: 'Ingresos Anuales' }), value: '$422K', trend: '+24%' },
          { label: t('adminDashboard.reports.totalUsers', { defaultValue: 'Usuarios Totales' }), value: '12,450', trend: '+18%' },
          { label: t('adminDashboard.reports.activeRestaurants', { defaultValue: 'Restaurantes Activos' }), value: '342', trend: '+5%' },
          { label: t('adminDashboard.reports.totalOrders', { defaultValue: 'Pedidos Totales' }), value: '84,201', trend: '+32%' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-black text-gray-800">{kpi.value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{kpi.label}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">{kpi.trend} {t('adminDashboard.reports.vsLastYear', { defaultValue: 'vs año anterior' })}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">{t('adminDashboard.reports.monthlyRevenue', { defaultValue: 'Ingresos Mensuales (K$)' })}</h3>
          <div className="flex items-end gap-2 h-48 w-full">
            {REVENUE_DATA.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col justify-end relative h-full">
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 w-full text-center">
                    ${val}K
                  </div>
                  <div className="w-full bg-red-500 rounded-t-lg transition-all duration-500 group-hover:bg-red-600" style={{ height: toPercent(val, 100) }} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">{t('adminDashboard.reports.userGrowth', { defaultValue: 'Crecimiento de Usuarios' })}</h3>
          <div className="flex items-end gap-2 h-48 w-full">
            {USERS_DATA.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col justify-end relative h-full">
                  <div className="w-full bg-slate-800 rounded-t-lg transition-all duration-500 group-hover:bg-slate-700" style={{ height: toPercent(val, 500) }} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">{t('adminDashboard.reports.topRestaurants', { defaultValue: 'Top Restaurantes por Pedidos' })}</h3>
        <div className="space-y-4">
          {[
            { name: 'Burger Bros', orders: 12450, pct: '100%' },
            { name: 'La Paella Dorada', orders: 9800, pct: '78%' },
            { name: 'Sushi Garden', orders: 8500, pct: '68%' },
          ].map((r, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-gray-700">{i+1}. {r.name}</span>
                <span className="text-gray-500">{r.orders} {t('adminDashboard.reports.ordersLabel', { defaultValue: 'pedidos' })}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: r.pct }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
