import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { Badge } from '../RestaurantDashboard/Common';

export default function RestaurantsSection({ restaurants }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const visible = restaurants.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const FILTERS = [
    { key: 'all', label: t('adminDashboard.filter.all', { defaultValue: 'Todos' }) },
    { key: 'active', label: t('adminDashboard.filter.active', { defaultValue: 'Activos' }) },
    { key: 'pending', label: t('adminDashboard.filter.pending', { defaultValue: 'Pendientes' }) },
    { key: 'suspended', label: t('adminDashboard.filter.suspended', { defaultValue: 'Suspendidos' }) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === f.key 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-gray-400 dark:text-slate-500">🔍</span>
          <input
            placeholder={t('adminDashboard.restSearch', { defaultValue: 'Buscar restaurante...' })}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-full lg:w-60 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 bg-transparent"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
              <tr>
                {[
                  t('adminDashboard.restTable.restaurant', { defaultValue: 'Restaurante' }),
                  t('adminDashboard.restTable.owner', { defaultValue: 'Propietario' }),
                  t('adminDashboard.restTable.contact', { defaultValue: 'Contacto' }),
                  t('adminDashboard.restTable.status', { defaultValue: 'Estado' }),
                  t('adminDashboard.restTable.actions', { defaultValue: 'Acciones' })
                ].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {visible.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center font-bold">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-slate-100">{r.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{r.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700 dark:text-slate-300">{r.owner}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800 dark:text-slate-200">{r.email}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{r.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={r.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === 'pending' ? (
                        <>
                          <button className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition">
                            {t('adminDashboard.actions.approve', { defaultValue: 'Aprobar' })}
                          </button>
                          <button className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                            {t('adminDashboard.actions.reject', { defaultValue: 'Rechazar' })}
                          </button>
                        </>
                      ) : r.status === 'active' ? (
                        <button className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/40 transition">
                          {t('adminDashboard.actions.suspend', { defaultValue: 'Suspender' })}
                        </button>
                      ) : (
                        <button className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                          {t('adminDashboard.actions.reactivate', { defaultValue: 'Reactivar' })}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    No se encontraron restaurantes con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
