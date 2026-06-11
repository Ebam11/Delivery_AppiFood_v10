import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';

export default function NotificationsSection({ showToast }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ subject: '', message: '', target: 'all' });

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) {
      alert(t('adminDashboard.notifications.fillAll', { defaultValue: 'Completa todos los campos' }));
      return;
    }
    showToast(t('adminDashboard.notifications.sent', { defaultValue: `Notificación enviada a ${form.target}`, recipients: form.target }));
    setForm({ subject: '', message: '', target: 'all' });
  };

  const inputClass = "w-full border-2 border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 dark:focus:border-red-400 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 transition";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2 tracking-wider";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-6 text-lg">
          {t('adminDashboard.notifications.sendTitle', { defaultValue: 'Enviar Notificación' })}
        </h3>
        
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className={labelClass}>{t('adminDashboard.notifications.recipients', { defaultValue: 'Destinatarios' })}</label>
            <select 
              value={form.target}
              onChange={e => setForm({...form, target: e.target.value})}
              className={inputClass}
            >
              <option value="all">{t('adminDashboard.notifications.allUsers', { defaultValue: 'Todos los usuarios' })}</option>
              <option value="clients">{t('adminDashboard.notifications.clientsOnly', { defaultValue: 'Solo clientes' })}</option>
              <option value="restaurants">{t('adminDashboard.notifications.restaurantsOnly', { defaultValue: 'Solo restaurantes' })}</option>
              <option value="premium">{t('adminDashboard.notifications.premiumUsers', { defaultValue: 'Usuarios premium' })}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('adminDashboard.notifications.subject', { defaultValue: 'Asunto' })}</label>
            <input 
              value={form.subject}
              onChange={e => setForm({...form, subject: e.target.value})}
              placeholder={t('adminDashboard.notifications.subjectPlaceholder', { defaultValue: 'Ej: Mantenimiento del sistema' })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t('adminDashboard.notifications.message', { defaultValue: 'Mensaje' })}</label>
            <textarea 
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              placeholder={t('adminDashboard.notifications.messagePlaceholder', { defaultValue: 'Escribe el mensaje que se enviará...' })}
              rows="5"
              className={`${inputClass} resize-none`}
            />
          </div>

          <button type="submit" className="w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20">
            {t('adminDashboard.notifications.sendBtn', { defaultValue: 'Enviar Notificación' })}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-6 text-lg">
          {t('adminDashboard.notifications.historyTitle', { defaultValue: 'Historial de Notificaciones' })}
        </h3>
        
        <div className="space-y-4">
          {[
            { date: '2026-06-01 10:00 AM', target: 'Todos los usuarios', subject: '¡Nuevos restaurantes en tu zona!', type: 'Promo' },
            { date: '2026-05-28 03:30 PM', target: 'Solo restaurantes', subject: 'Actualización de términos', type: 'Sistema' },
          ].map((h, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 flex items-center justify-center flex-shrink-0 text-lg">
                📨
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-slate-200">{h.subject}</p>
                <div className="flex gap-2 text-xs mt-1">
                  <span className="text-red-500 font-bold">{h.target}</span>
                  <span className="text-gray-400 dark:text-slate-500">• {h.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
