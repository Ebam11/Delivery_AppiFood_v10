import { useState, useEffect } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import { fetchJson } from '../../api/fetchJson';
import CalendarSection from './CalendarSection';
import ThemeToggle from '../ThemeToggle';

export default function RestaurantInfoSection({ restaurant }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: restaurant?.name || '',
    desc: restaurant?.description || '',
    email: restaurant?.email || '',
    phone: restaurant?.phone || '',
    address: restaurant?.address || '',
    status: restaurant?.is_active ?? true,
    delivery: restaurant?.delivery_available ?? true
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || '',
        desc: restaurant.description || '',
        email: restaurant.email || '',
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        status: restaurant.is_active ?? true,
        delivery: restaurant.delivery_available ?? true
      })
    }
  }, [restaurant]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({...form, [e.target.name]: value});
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await fetchJson('/api/restaurant/profile', {
        method: 'PUT',
        body: {
          name: form.name,
          description: form.desc,
          email: form.email,
          phone: form.phone,
          address: form.address,
          is_active: form.status,
          delivery_available: form.delivery
        }
      });
      setMsg({ type: 'success', text: t('adminDashboard.settings.saveSuccess', { defaultValue: 'Cambios guardados con éxito.' }) });
    } catch (error) {
      setMsg({ type: 'error', text: t('adminDashboard.settings.saveError', { defaultValue: 'Error al guardar los cambios.' }) });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-10">
      {msg && (
        <div className={`p-4 rounded-xl text-sm font-bold ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800 px-6 py-4">
          <h3 className="font-bold text-gray-800 dark:text-white">{t('restaurantDashboard.info.basicTitle', { defaultValue: 'Información Básica del Restaurante' })}</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('restaurantDashboard.info.restName', { defaultValue: 'Nombre del Restaurante' })}</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('restaurantDashboard.info.email', { defaultValue: 'Correo de Contacto' })}</label>
              <input name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('restaurantDashboard.info.phone', { defaultValue: 'Teléfono' })}</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('restaurantDashboard.info.address', { defaultValue: 'Dirección' })}</label>
              <input name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('restaurantDashboard.info.description', { defaultValue: 'Descripción' })}</label>
            <textarea name="desc" value={form.desc} onChange={handleChange} rows="3" className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800 px-6 py-4">
          <h3 className="font-bold text-gray-800 dark:text-white">{t('restaurantDashboard.info.settingsTitle', { defaultValue: 'Configuración Operativa' })}</h3>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/60 transition">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{t('restaurantDashboard.info.statusLabel', { defaultValue: 'Restaurante Abierto' })}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('restaurantDashboard.info.statusDesc', { defaultValue: 'Permite que los clientes vean tu restaurante y hagan pedidos' })}</p>
            </div>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
              <input type="checkbox" name="status" checked={form.status} onChange={handleChange} className="sr-only" />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.status ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/60 transition">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{t('restaurantDashboard.info.deliveryLabel', { defaultValue: 'Delivery Disponible' })}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('restaurantDashboard.info.deliveryDesc', { defaultValue: 'Ofrece envío a domicilio a través de la plataforma' })}</p>
            </div>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.delivery ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
              <input type="checkbox" name="delivery" checked={form.delivery} onChange={handleChange} className="sr-only" />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.delivery ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{t('restaurantDashboard.info.themeLabel', { defaultValue: 'Tema Visual' })}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('restaurantDashboard.info.themeDesc', { defaultValue: 'Activar modo claro o modo noche' })}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-gray-900 dark:bg-red-500 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-red-600 transition shadow-xl shadow-gray-900/20 disabled:opacity-50">
        {saving ? t('adminDashboard.settings.saving', { defaultValue: 'Guardando...' }) : t('adminDashboard.settings.saveConfig', { defaultValue: 'Guardar Cambios del Perfil' })}
      </button>

      {/* Horarios integrados en Mi Restaurante */}
      <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
        <CalendarSection />
      </div>
    </div>
  );
}
