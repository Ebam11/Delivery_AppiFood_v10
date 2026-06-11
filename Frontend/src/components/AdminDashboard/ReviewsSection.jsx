import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';

export default function ReviewsSection() {
  const { t } = useTranslation();
  
  const MOCK_REVIEWS = [
    { id: 1, restaurant: 'La Paella Dorada', user: 'Carlos M.', rating: 5, date: '2026-06-01', text: 'Excelente servicio y comida deliciosa.', status: 'pending' },
    { id: 2, restaurant: 'Burger Bros', user: 'Ana G.', rating: 2, date: '2026-06-02', text: 'La hamburguesa llegó fría y tardó mucho.', status: 'pending' },
    { id: 3, restaurant: 'Sushi Garden', user: 'Luis F.', rating: 4, date: '2026-06-03', text: 'Buen sushi, pero el empaque podría mejorar.', status: 'answered', reply: 'Gracias por tu sugerencia, Luis. Estamos trabajando en nuevos empaques ecológicos.' }
  ];

  const [filter, setFilter] = useState('all');
  const visible = MOCK_REVIEWS.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('adminDashboard.reviews.total', { defaultValue: 'Total reseñas' }), value: '1,245', icon: '⭐' },
          { label: t('adminDashboard.reviews.pending', { defaultValue: 'Sin responder' }), value: '14', icon: '💬' },
          { label: t('adminDashboard.reviews.answered', { defaultValue: 'Respondidas' }), value: '1,231', icon: '✅' },
          { label: t('adminDashboard.reviews.avgRating', { defaultValue: 'Calif. promedio' }), value: '4.6', icon: '📈' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-orange-50 dark:bg-slate-800 text-red-500">
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800 dark:text-slate-100">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === 'all' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
          >
            {t('adminDashboard.reviews.filterAll', { defaultValue: 'Todas' })}
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
          >
            {t('adminDashboard.reviews.filterPending', { defaultValue: 'Sin responder' })}
          </button>
        </div>

        <div className="space-y-4">
          {visible.map(r => (
            <div key={r.id} className="border border-gray-100 dark:border-slate-800 rounded-2xl p-5 bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">
                    {r.restaurant} <span className="text-gray-400 dark:text-slate-500 font-normal text-sm ml-2">por {r.user}</span>
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{r.date}</span>
                  </div>
                </div>
                {r.status === 'pending' ? (
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold">
                    {t('adminDashboard.reviews.statusPending', { defaultValue: 'Sin responder' })}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-bold">
                    {t('adminDashboard.reviews.statusAnswered', { defaultValue: 'Respondida' })}
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 dark:text-slate-300 text-sm mb-4">"{r.text}"</p>
              
              {r.reply ? (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 ml-4">
                  <p className="text-xs font-bold text-red-500 mb-1">Respuesta del restaurante:</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{r.reply}</p>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-600 transition">
                    {t('adminDashboard.actions.delete', { defaultValue: 'Eliminar' })}
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition">
                    {t('adminDashboard.actions.reply', { defaultValue: 'Responder' })}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
