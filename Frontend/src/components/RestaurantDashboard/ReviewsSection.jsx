import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchJson } from '../../api/fetchJson'

// Barra de distribución de estrellas
function StarBar({ count, total, star }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right font-bold text-gray-500 dark:text-slate-400">{star}</span>
      <span className="text-yellow-400 text-xs">★</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-gray-400 dark:text-slate-500">{count}</span>
    </div>
  )
}

// Avatar de usuario
function UserAvatar({ name, avatar }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
      />
    )
  }
  const initials = (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['from-red-400 to-orange-400', 'from-blue-400 to-cyan-400', 'from-purple-400 to-pink-400', 'from-green-400 to-teal-400', 'from-yellow-400 to-amber-400']
  const color = colors[(name || '').charCodeAt(0) % colors.length]
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  )
}

// Estrellas visuales
function Stars({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'text-2xl' : 'text-sm'
  return (
    <span className={sz}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-200 dark:text-slate-600'}>★</span>
      ))}
    </span>
  )
}

export default function ReviewsSection({ externalSearch = '' }) {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [starFilter, setStarFilter] = useState(0) // 0 = todos
  const [replyText, setReplyText] = useState({})
  const [replying, setReplying] = useState({})
  const [profile, setProfile] = useState(null) // para average_rating del backend

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [reviewsRes, profileRes] = await Promise.all([
          fetchJson('/api/restaurant/reviews'),
          fetchJson('/api/restaurant/profile'),
        ])
        const items = Array.isArray(reviewsRes) ? reviewsRes : (reviewsRes?.data || [])
        setReviews(items)
        if (profileRes?.data) setProfile(profileRes.data)
      } catch (err) {
        console.error('Error cargando reseñas', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleReply = async (reviewId) => {
    const text = replyText[reviewId]
    if (!text?.trim()) return
    setReplying(r => ({ ...r, [reviewId]: true }))
    try {
      await fetchJson(`/api/restaurant/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        body: { reply: text }
      })
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, restaurant_reply: text } : r
      ))
      setReplyText(prev => ({ ...prev, [reviewId]: '' }))
    } catch (err) {
      console.error('Error al responder', err)
    } finally {
      setReplying(r => ({ ...r, [reviewId]: false }))
    }
  }

  const handleToggleVisibility = async (reviewId) => {
    try {
      const res = await fetchJson(`/api/restaurant/reviews/${reviewId}/toggle-visibility`, {
        method: 'PATCH'
      })
      const updatedReview = res.data || res
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, is_visible: updatedReview.is_visible, comment: updatedReview.comment } : r
      ))
    } catch (err) {
      console.error('Error al cambiar visibilidad', err)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reseña permanentemente?')) return
    try {
      await fetchJson(`/api/restaurant/reviews/${reviewId}`, {
        method: 'DELETE'
      })
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    } catch (err) {
      console.error('Error al eliminar reseña', err)
    }
  }

  // Métricas calculadas desde reseñas reales
  const avgRating = profile?.average_rating
    ? Number(profile.average_rating).toFixed(1)
    : reviews.length
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '0.0'

  const totalReviews = profile?.total_reviews ?? reviews.length
  const positiveCount = reviews.filter(r => r.rating >= 4).length
  const positivePct = reviews.length ? Math.round((positiveCount / reviews.length) * 100) : 0
  const pendingCount = reviews.filter(r => !r.restaurant_reply).length

  // Distribución por estrellas
  const starDist = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }))

  // Filtros
  const visible = reviews.filter(r => {
    if (filter === 'pending' && r.restaurant_reply) return false
    if (filter === 'answered' && !r.restaurant_reply) return false
    if (starFilter > 0 && r.rating !== starFilter) return false
    if (externalSearch) {
      const q = externalSearch.toLowerCase()
      return (
        r.user?.name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Calificación promedio', value: avgRating, color: 'text-yellow-500', icon: '⭐' },
          { label: 'Total reseñas', value: totalReviews, color: 'text-blue-500', icon: '💬' },
          { label: 'Valoraciones positivas', value: `${positivePct}%`, color: 'text-green-500', icon: '👍' },
          { label: 'Sin responder', value: pendingCount, color: 'text-red-500', icon: '⏳' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Panel rating + distribución ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8 items-center">

          {/* Nota grande */}
          <div className="flex flex-col items-center gap-1 min-w-[120px]">
            <p className="text-6xl font-black text-gray-900 dark:text-white">{avgRating}</p>
            <Stars rating={Math.round(Number(avgRating))} size="lg" />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{totalReviews} reseña{totalReviews !== 1 ? 's' : ''}</p>
          </div>

          {/* Barras de distribución */}
          <div className="flex-1 w-full space-y-2">
            {starDist.map(({ star, count }) => (
              <button
                key={star}
                onClick={() => setStarFilter(starFilter === star ? 0 : star)}
                className={`w-full text-left rounded-xl px-2 py-0.5 transition ${starFilter === star ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                <StarBar count={count} total={reviews.length} star={star} />
              </button>
            ))}
          </div>
        </div>
        {starFilter > 0 && (
          <p className="text-xs text-center mt-3 text-yellow-600 dark:text-yellow-400 font-semibold">
            Mostrando solo reseñas de {starFilter} ★ —{' '}
            <button onClick={() => setStarFilter(0)} className="underline">ver todas</button>
          </p>
        )}
      </div>

      {/* ── Lista de reseñas ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4 flex-wrap">
          {[
            { key: 'all',      label: t('rd.all_reviews')  || 'Todas' },
            { key: 'pending',  label: t('rd.pending_reply') || 'Sin responder' },
            { key: 'answered', label: t('rd.answered')      || 'Respondidas' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === f.key ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              {f.label}
              {f.key === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent mx-auto mb-3" />
            <p className="font-semibold">Cargando reseñas...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500">
            <p className="text-5xl mb-3">💬</p>
            <p className="font-semibold text-gray-600 dark:text-slate-400">
              {reviews.length === 0 ? 'Aún no tienes reseñas' : 'No hay reseñas en esta categoría'}
            </p>
            <p className="text-sm mt-1 text-gray-400">
              {reviews.length === 0 ? 'Las reseñas de tus clientes aparecerán aquí cuando califiquen sus pedidos.' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map(r => (
              <div key={r.id} className="border border-gray-100 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex gap-3 items-start">
                    <UserAvatar name={r.user?.name} avatar={r.user?.avatar} />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{r.user?.name || 'Usuario'}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars rating={r.rating || 0} />
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {new Date(r.created_at).toLocaleDateString('es-CO', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVisibility(r.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border transition ${
                        r.is_visible !== false
                          ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30'
                          : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-900/30'
                      }`}
                    >
                      {r.is_visible !== false ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition dark:bg-red-950/20 dark:border-red-900/30"
                      title="Eliminar Reseña"
                    >
                      <i className="fas fa-trash text-[10px]" />
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${r.restaurant_reply ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                      {r.restaurant_reply ? '✓ Respondida' : 'Sin responder'}
                    </span>
                  </div>
                </div>

                {r.comment && (
                  <p className="text-gray-700 dark:text-slate-300 text-sm mb-4 leading-relaxed pl-13 italic">
                    "{r.comment}"
                  </p>
                )}

                {r.restaurant_reply ? (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 pl-13 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-red-500 mb-1">Tu respuesta:</p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{r.restaurant_reply}</p>
                    </div>
                  </div>
                ) : (
                  <div className="pl-13 mt-2">
                    <div className="flex gap-2">
                      <input
                        value={replyText[r.id] || ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleReply(r.id)}
                        placeholder="Escribe una respuesta pública..."
                        className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-400 transition text-gray-800 dark:text-slate-200"
                      />
                      <button
                        onClick={() => handleReply(r.id)}
                        disabled={replying[r.id] || !replyText[r.id]?.trim()}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition disabled:opacity-40 shadow-sm"
                      >
                        {replying[r.id] ? '...' : 'Responder'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}