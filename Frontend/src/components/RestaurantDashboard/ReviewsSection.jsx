import { useState, useEffect } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { fetchJson } from '../../api/fetchJson';

export default function ReviewsSection() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState({});

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await fetchJson('/api/restaurant/reviews');
        const items = Array.isArray(data) ? data : data.data || [];
        setReviews(items);
      } catch (err) {
        console.error('Error cargando reseñas', err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  const handleReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    setReplying(r => ({ ...r, [reviewId]: true }));
    try {
      await fetchJson(`/api/restaurant/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: { reply: text }
      });
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, restaurant_reply: text } : r
      ));
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    } catch (err) {
      console.error('Error al responder', err);
    } finally {
      setReplying(r => ({ ...r, [reviewId]: false }));
    }
  };

  const visible = reviews.filter(r => {
    if (filter === 'pending') return !r.restaurant_reply;
    if (filter === 'answered') return !!r.restaurant_reply;
    return true;
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';
  const positiveCount = reviews.filter(r => r.rating >= 4).length;
  const positivePct = reviews.length ? Math.round((positiveCount / reviews.length) * 100) : 0;
  const pendingCount = reviews.filter(r => !r.restaurant_reply).length;

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('restaurantDashboard.reviews.avgRating', { defaultValue: 'Calificación' }), value: `⭐ ${avgRating}`, color: 'text-yellow-500' },
          { label: t('restaurantDashboard.reviews.total', { defaultValue: 'Total reseñas' }), value: reviews.length, color: 'text-blue-500' },
          { label: t('restaurantDashboard.reviews.positive', { defaultValue: 'Positivas' }), value: `${positivePct}%`, color: 'text-green-500' },
          { label: t('restaurantDashboard.reviews.pending', { defaultValue: 'Sin responder' }), value: pendingCount, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Filtros */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'pending', label: 'Sin responder' },
            { key: 'answered', label: 'Respondidas' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === f.key ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">⏳</div>
            <p className="font-semibold">Cargando reseñas...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-5xl mb-3">💬</div>
            <p className="font-semibold text-gray-600">No hay reseñas en esta categoría.</p>
            <p className="text-sm mt-1">¡Las reseñas de tus clientes aparecerán aquí!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map(r => (
              <div key={r.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {(r.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{r.user?.name || 'Usuario'}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-yellow-400 text-sm">{stars(r.rating || 0)}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${r.restaurant_reply ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {r.restaurant_reply ? '✓ Respondida' : 'Pendiente'}
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-4 ml-13 leading-relaxed">"{r.comment || r.text}"</p>

                {r.restaurant_reply ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 ml-13">
                    <p className="text-xs font-bold text-red-500 mb-1">Tu respuesta:</p>
                    <p className="text-sm text-gray-600">{r.restaurant_reply}</p>
                  </div>
                ) : (
                  <div className="ml-13 mt-2">
                    <div className="flex gap-2">
                      <input
                        value={replyText[r.id] || ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                        placeholder="Escribe una respuesta pública..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-400 transition"
                      />
                      <button
                        onClick={() => handleReply(r.id)}
                        disabled={replying[r.id]}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition disabled:opacity-50"
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
  );
}
