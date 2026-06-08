import { useState, useEffect } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { fetchJson } from '../../api/fetchJson';

const DAYS = [
  { key: 'monday',    label: 'Lunes' },
  { key: 'tuesday',   label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday',  label: 'Jueves' },
  { key: 'friday',    label: 'Viernes' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
];

export default function CalendarSection() {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchJson('/api/restaurant/profile');
        const restaurantData = data?.data || data;
        const scheds = {};
        if (restaurantData?.schedules?.length > 0) {
          restaurantData.schedules.forEach(s => {
            scheds[s.day] = {
              opening_time: s.opening_time || '08:00',
              closing_time: s.closing_time || '22:00',
              is_closed: s.is_closed ?? false,
            };
          });
        }
        DAYS.forEach(d => {
          if (!scheds[d.key]) {
            scheds[d.key] = { opening_time: '08:00', closing_time: '22:00', is_closed: false };
          }
        });
        setSchedules(scheds);
      } catch (err) {
        console.error('Error cargando horarios', err);
        const defaults = {};
        DAYS.forEach(d => {
          defaults[d.key] = { opening_time: '08:00', closing_time: '22:00', is_closed: false };
        });
        setSchedules(defaults);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (day, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const firstOpen = Object.values(schedules).find(s => !s.is_closed);
      await fetchJson('/api/restaurant/profile', {
        method: 'PUT',
        body: {
          opening_time: firstOpen?.opening_time,
          closing_time: firstOpen?.closing_time,
        }
      });
      showToast('Horarios guardados exitosamente ✓');
    } catch (err) {
      showToast('Error al guardar horarios', 'error');
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const currentDayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">
            {t('restaurantDashboard.calendar.title', { defaultValue: 'Horarios de Atención' })}
          </h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            {now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition text-sm shadow-lg shadow-red-500/20 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Horarios'}
        </button>
      </div>

      {/* Horarios por día */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">⏳</div>
          <p className="font-semibold">Cargando horarios...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800">
            <p className="text-sm font-bold text-gray-700 dark:text-slate-200">Configura el horario de apertura para cada día de la semana</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {DAYS.map(({ key, label }) => {
              const sched = schedules[key] || { opening_time: '08:00', closing_time: '22:00', is_closed: false };
              const isToday = key === currentDayKey;
              return (
                <div
                  key={key}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 transition ${isToday ? 'bg-red-50/50 dark:bg-red-950/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800/40'}`}
                >
                  <div className="w-32 flex-shrink-0 flex items-center gap-2">
                    <span className={`font-bold text-sm ${isToday ? 'text-red-600' : 'text-gray-800 dark:text-slate-200'}`}>
                      {label}
                    </span>
                    {isToday && (
                      <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">HOY</span>
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => handleChange(key, 'is_closed', !sched.is_closed)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${sched.is_closed ? 'bg-red-400' : 'bg-green-400'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${sched.is_closed ? 'translate-x-1' : 'translate-x-5'}`} />
                    </div>
                    <span className={`text-xs font-bold ${sched.is_closed ? 'text-red-500' : 'text-green-600'}`}>
                      {sched.is_closed ? 'Cerrado' : 'Abierto'}
                    </span>
                  </label>

                  {!sched.is_closed && (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Abre</span>
                        <input
                          type="time"
                          value={sched.opening_time}
                          onChange={e => handleChange(key, 'opening_time', e.target.value)}
                          className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-red-400 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-250"
                        />
                      </div>
                      <span className="text-gray-300 dark:text-slate-700">—</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Cierra</span>
                        <input
                          type="time"
                          value={sched.closing_time}
                          onChange={e => handleChange(key, 'closing_time', e.target.value)}
                          className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-red-400 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-250"
                        />
                      </div>
                    </div>
                  )}

                  {sched.is_closed && (
                    <div className="flex-1">
                      <span className="text-xs text-gray-400 dark:text-slate-500 italic">Sin atención este día</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
