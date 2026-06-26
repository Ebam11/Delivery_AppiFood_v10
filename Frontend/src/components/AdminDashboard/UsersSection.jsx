// Frontend/src/components/AdminDashboard/UsersSection.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../RestaurantDashboard/Common'

export default function UsersSection({ 
  users, 
  loading, 
  onToggleStatus,
  onDelete,
  pagination 
}) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const visible = users.filter(u => {
    const matchStatus = filter === 'all' || u.status === filter
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                       u.email?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const FILTERS = [
    { key: 'all', label: t('adminDashboard.filter.all', { defaultValue: 'Todos' }) },
    { key: 'active', label: t('adminDashboard.filter.active', { defaultValue: 'Activos' }) },
    { key: 'suspended', label: t('adminDashboard.filter.suspended', { defaultValue: 'Suspendidos' }) },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    )
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    admin: users.filter(u => u.role === 'admin').length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('adminDashboard.userStats.total', { defaultValue: 'Total' }), value: stats.total, color: 'text-gray-800 dark:text-slate-100' },
          { label: t('adminDashboard.userStats.active', { defaultValue: 'Activos' }), value: stats.active, color: 'text-green-500' },
          { label: t('adminDashboard.userStats.suspended', { defaultValue: 'Suspendidos' }), value: stats.suspended, color: 'text-orange-500' },
          { label: t('adminDashboard.userStats.admin', { defaultValue: 'Administradores' }), value: stats.admin, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mt-1">{stat.label}</p>
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
            placeholder={t('adminDashboard.userSearch', { defaultValue: 'Buscar usuario...' })}
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
                  {t('adminDashboard.userTable.user', { defaultValue: 'Usuario' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.userTable.contact', { defaultValue: 'Contacto' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.userTable.role', { defaultValue: 'Rol' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.userTable.status', { defaultValue: 'Estado' })}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('adminDashboard.userTable.actions', { defaultValue: 'Acciones' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {visible.map(u => {
                const isAdmin = u.role === 'admin'
                const isActive = u.status === 'active'
                
                return (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-slate-100">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {u.created_at ? `${t('adminDashboard.userTable.registered') || 'Unido'}: ${new Date(u.created_at).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 dark:text-slate-200">{u.email}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{u.phone || t('adminDashboard.no_phone') || 'Sin teléfono'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isAdmin 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                          : u.role === 'restaurant'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={u.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isAdmin && (
                          <>
                            <button
                              onClick={() => onToggleStatus?.(u.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                isActive
                                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                              }`}
                            >
                              {isActive 
                                ? t('adminDashboard.actions.suspendAccount', { defaultValue: 'Suspender' })
                                : t('adminDashboard.actions.reactivateAccount', { defaultValue: 'Reactivar' })}
                            </button>
                            <button
                              onClick={() => onDelete?.(u.id)}
                              className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    {t('adminDashboard.no_users_found') || 'No se encontraron usuarios.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-slate-400">
          <span>
            {t('adminDashboard.pagination.showing', { defaultValue: 'Mostrando' })} {pagination.from || 0} - {pagination.to || 0} {t('adminDashboard.pagination.of', { defaultValue: 'de' })} {pagination.total || 0}
          </span>
        </div>
      )}
    </div>
  )
}