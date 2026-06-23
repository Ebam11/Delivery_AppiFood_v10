// Frontend/src/components/AdminDashboard/RestaurantsSection.jsx
import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { Badge } from '../RestaurantDashboard/Common';

export default function RestaurantsSection({ 
  restaurants, 
  loading, 
  onVerify, 
  onToggleStatus,
  onDelete,
  pagination 
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Filtros en frontend solo para UI, los datos ya vienen filtrados del backend
  const visible = restaurants.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || 
                      r.owner?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const FILTERS = [
    { key: 'all', label: t('adminDashboard.filter.all', { defaultValue: 'Todos' }) },
    { key: 'active', label: t('adminDashboard.filter.active', { defaultValue: 'Activos' }) },
    { key: 'pending', label: t('adminDashboard.filter.pending', { defaultValue: 'Pendientes' }) },
    { key: 'suspended', label: t('adminDashboard.filter.suspended', { defaultValue: 'Suspendidos' }) },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

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
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.restTable.restaurant', { defaultValue: 'Restaurante' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.restTable.owner', { defaultValue: 'Propietario' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.restTable.contact', { defaultValue: 'Contacto' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.restTable.status', { defaultValue: 'Estado' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.restTable.actions', { defaultValue: 'Acciones' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {visible.map(r => {
                const status = r.is_active ? 'active' : 'suspended';
                const isVerified = r.is_verified || false;
                
                return (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center font-bold">
                          {r.name?.charAt(0) || 'R'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-slate-100">
                            {r.name}
                            {isVerified && (
                              <span className="ml-2 text-xs text-blue-500">✓</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {r.city || 'Sin ubicación'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-slate-300">
                      {r.owner?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800 dark:text-slate-200">{r.owner?.email || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{r.owner?.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={status} />
                      {!isVerified && (
                        <span className="ml-2 text-xs text-orange-500">Pendiente</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                        {!isVerified && (
                          <button
                            onClick={() => onVerify?.(r.id)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition"
                          >
                            {t('adminDashboard.actions.approve', { defaultValue: 'Verificar' })}
                          </button>
                        )}
                        <button
                          onClick={() => onToggleStatus?.(r.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            r.is_active
                              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                          }`}
                        >
                          {r.is_active 
                            ? t('adminDashboard.actions.suspend', { defaultValue: 'Suspender' })
                            : t('adminDashboard.actions.reactivate', { defaultValue: 'Reactivar' })}
                        </button>
                        <button
                          onClick={() => onDelete?.(r.id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Paginación */}
      {pagination && pagination.total > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-slate-400">
          <span>
            Mostrando {pagination.from || 0} - {pagination.to || 0} de {pagination.total || 0}
          </span>
          <div className="flex gap-2">
            {/* Aquí irían los botones de paginación */}
          </div>
        </div>
      )}
    </div>
  );
}