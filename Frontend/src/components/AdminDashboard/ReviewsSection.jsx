// Frontend/src/components/AdminDashboard/ReviewsSection.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../RestaurantDashboard/Common'

export default function ReviewsSection({
  reviews,
  loading,
  onToggleVisibility,
  onDelete,
  pagination,
}) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-sm">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-sm">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 dark:text-slate-600 text-sm">★</span>
        ))}
        <span className="ml-1 text-xs font-medium text-gray-500 dark:text-slate-400">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  const reviewList = Array.isArray(reviews) ? reviews : reviews?.data || []

  const visible = reviewList.filter((r) => {
    const matchStatus = filter === 'all' || (filter === 'visible' ? r.is_visible : !r.is_visible)
    const matchSearch =
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const FILTERS = [
    { key: 'all',     label: t('adminDashboard.filter.all',     { defaultValue: 'Todas' }) },
    { key: 'visible', label: t('adminDashboard.filter.visible', { defaultValue: 'Visibles' }) },
    { key: 'hidden',  label: t('adminDashboard.filter.hidden',  { defaultValue: 'Ocultas' }) },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
      </div>
    )
  }

  const stats = {
    total:     reviewList.length,
    visible:   reviewList.filter(r => r.is_visible).length,
    hidden:    reviewList.filter(r => !r.is_visible).length,
    avgRating: reviewList.length > 0
      ? reviewList.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewList.length
      : 0,
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('adminDashboard.reviews.total',     { defaultValue: 'Total' }),                value: stats.total,                color: 'text-gray-800 dark:text-slate-100' },
          { label: t('adminDashboard.reviews.visible',   { defaultValue: 'Visibles' }),             value: stats.visible,              color: 'text-green-500' },
          { label: t('adminDashboard.reviews.hidden',    { defaultValue: 'Ocultas' }),              value: stats.hidden,               color: 'text-orange-500' },
          { label: t('adminDashboard.reviews.avgRating', { defaultValue: 'Calificación Promedio' }),value: stats.avgRating.toFixed(1), color: 'text-yellow-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
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
          <i className="fas fa-search text-gray-400 dark:text-slate-500 text-sm" />
          <input
            placeholder={t('adminDashboard.reviewSearch', { defaultValue: 'Buscar reseña...' })}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-full lg:w-60 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 bg-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
              <tr>
                {[
                  t('adminDashboard.reviewTable.user',       { defaultValue: 'Usuario' }),
                  t('adminDashboard.reviewTable.restaurant', { defaultValue: 'Restaurante' }),
                  t('adminDashboard.reviewTable.rating',     { defaultValue: 'Calificación' }),
                  t('adminDashboard.reviewTable.comment',    { defaultValue: 'Comentario' }),
                  t('adminDashboard.reviewTable.date',       { defaultValue: 'Fecha' }),
                  t('adminDashboard.reviewTable.status',     { defaultValue: 'Estado' }),
                  t('adminDashboard.reviewTable.actions',    { defaultValue: 'Acciones' }),
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
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        {r.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-slate-100">{r.user?.name || 'Usuario eliminado'}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{r.user?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                        {r.restaurant?.name?.charAt(0) || 'R'}
                      </div>
                      <p className="font-medium text-gray-800 dark:text-slate-200">{r.restaurant?.name || 'Restaurante eliminado'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{renderStars(r.rating || 0)}</td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-gray-700 dark:text-slate-300 truncate">{r.comment || 'Sin comentario'}</p>
                      {r.reply && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          <i className="fas fa-comment mr-1" /> {r.reply}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={r.is_visible ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onToggleVisibility?.(r.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          r.is_visible
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                        }`}
                      >
                        {r.is_visible
                          ? t('adminDashboard.actions.hide', { defaultValue: 'Ocultar' })
                          : t('adminDashboard.actions.show', { defaultValue: 'Mostrar' })}
                      </button>
                      <button
                        onClick={() => onDelete?.(r.id)}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                      >
                        <i className="fas fa-trash text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    {t('adminDashboard.reviewEmpty', { defaultValue: 'No se encontraron reseñas.' })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination?.total > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-slate-400">
          <span>
            {t('adminDashboard.pagination.showing', { defaultValue: 'Mostrando' })} {pagination.from || 0} - {pagination.to || 0} {t('adminDashboard.pagination.of', { defaultValue: 'de' })} {pagination.total || 0}
          </span>
        </div>
      )}
    </div>
  )
}