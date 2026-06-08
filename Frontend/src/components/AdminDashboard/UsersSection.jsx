import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { Badge } from '../RestaurantDashboard/Common';

export default function UsersSection({ users }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const visible = users.filter(u => {
    const matchStatus = filter === 'all' || u.status === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const FILTERS = [
    { key: 'all', label: t('adminDashboard.filter.all', { defaultValue: 'Todos' }) },
    { key: 'active', label: t('adminDashboard.filter.active', { defaultValue: 'Activos' }) },
    { key: 'suspended', label: t('adminDashboard.filter.suspended', { defaultValue: 'Suspendidos' }) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('adminDashboard.userStats.total', { defaultValue: 'Total usuarios' }), value: users.length, color: 'text-gray-800' },
          { label: t('adminDashboard.userStats.active', { defaultValue: 'Activos' }), value: users.filter(u => u.status === 'active').length, color: 'text-green-500' },
          { label: t('adminDashboard.userStats.suspended', { defaultValue: 'Suspendidos' }), value: users.filter(u => u.status === 'suspended').length, color: 'text-orange-500' },
          { label: t('adminDashboard.userStats.premium', { defaultValue: 'Premium' }), value: users.filter(u => u.subscription === 'Premium').length, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === f.key ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-red-50 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input
            placeholder={t('adminDashboard.userSearch', { defaultValue: 'Buscar usuario...' })}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-full lg:w-60 text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[t('adminDashboard.userTable.user', { defaultValue: 'Usuario' }), t('adminDashboard.userTable.contact', { defaultValue: 'Contacto' }), t('adminDashboard.userTable.subscription', { defaultValue: 'Suscripción' }), t('adminDashboard.userTable.status', { defaultValue: 'Estado' }), t('adminDashboard.userTable.actions', { defaultValue: 'Acciones' })].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map(u => (
                <tr key={u.id} className="ad-table-row group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">Unido: {u.joined}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{u.email}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.subscription === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={u.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {u.status === 'active' ? (
                        <button className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100 transition">{t('adminDashboard.actions.suspendAccount', { defaultValue: 'Suspender' })}</button>
                      ) : (
                        <button className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition">{t('adminDashboard.actions.reactivateAccount', { defaultValue: 'Reactivar' })}</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron usuarios con los filtros actuales.
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
