import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import ThemeToggle from '../ThemeToggle';

export default function SettingsSection({ showToast }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    adminEmail: 'admin@appifood.com',
    userLimit: 50000,
    accountPolicy: 'auto',
    twoFactor: 'optional',
    sessionTime: 60,
    notifOrders: true,
    notifRestaurants: true,
    notifSystem: true,
    autoReports: 'weekly',
    reportEmail: 'reports@appifood.com'
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({...form, [e.target.name]: value});
  };

  const handleSave = (section) => {
    showToast(t(`adminDashboard.toast.${section}Saved`, { defaultValue: 'Configuración guardada' }));
  };

  const inputClass = "w-full border-2 border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 dark:focus:border-red-400 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 transition";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2 tracking-wider";
  const sectionClass = "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden";
  const sectionHeaderClass = "bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center gap-3";

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-10">
      
      {/* Gestión de Usuarios */}
      <section className={sectionClass}>
        <div className={sectionHeaderClass}>
          <span className="text-xl">👥</span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-100">
              {t('adminDashboard.settings.userMgmt', { defaultValue: 'Gestión de Usuarios' })}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {t('adminDashboard.settings.userMgmtSub', { defaultValue: 'Límites y políticas' })}
            </p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                {t('adminDashboard.settings.adminEmail', { defaultValue: 'Email del Administrador' })}
              </label>
              <input name="adminEmail" value={form.adminEmail} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                {t('adminDashboard.settings.userLimit', { defaultValue: 'Límite de usuarios' })}
              </label>
              <input type="number" name="userLimit" value={form.userLimit} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>
              {t('adminDashboard.settings.accountPolicy', { defaultValue: 'Política de cuentas' })}
            </label>
            <select name="accountPolicy" value={form.accountPolicy} onChange={handleChange} className={inputClass}>
              <option value="auto">{t('adminDashboard.settings.policyAuto', { defaultValue: 'Automática' })}</option>
              <option value="manual">{t('adminDashboard.settings.policyManual', { defaultValue: 'Aprobación Manual' })}</option>
            </select>
          </div>
          <button 
            onClick={() => handleSave('settings')} 
            className="px-6 py-2.5 bg-gray-800 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-slate-600 transition text-sm"
          >
            {t('adminDashboard.settings.saveConfig', { defaultValue: 'Guardar Configuración' })}
          </button>
        </div>
      </section>

      {/* Seguridad */}
      <section className={sectionClass}>
        <div className={sectionHeaderClass}>
          <span className="text-xl">🔒</span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-100">
              {t('adminDashboard.settings.security', { defaultValue: 'Seguridad' })}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {t('adminDashboard.settings.securitySub', { defaultValue: 'Autenticación' })}
            </p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                {t('adminDashboard.settings.twoFactor', { defaultValue: '2FA' })}
              </label>
              <select name="twoFactor" value={form.twoFactor} onChange={handleChange} className={inputClass}>
                <option value="optional">{t('adminDashboard.settings.tfOptional', { defaultValue: 'Opcional' })}</option>
                <option value="required">{t('adminDashboard.settings.tfRequired', { defaultValue: 'Obligatoria' })}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t('adminDashboard.settings.sessionTime', { defaultValue: 'Tiempo de sesión (min)' })}
              </label>
              <input type="number" name="sessionTime" value={form.sessionTime} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <button 
            onClick={() => handleSave('security')} 
            className="px-6 py-2.5 bg-gray-800 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-slate-600 transition text-sm"
          >
            {t('adminDashboard.settings.updateSecurity', { defaultValue: 'Actualizar Seguridad' })}
          </button>
        </div>
      </section>

      {/* Preferencia de Interfaz */}
      <section className={sectionClass}>
        <div className={sectionHeaderClass}>
          <span className="text-xl">🎨</span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-100">
              {t('adminDashboard.settings.themeTitle', { defaultValue: 'Preferencia de Interfaz' })}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {t('adminDashboard.settings.themeSub', { defaultValue: 'Personaliza la apariencia visual del panel' })}
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{t('adminDashboard.settings.themeLabel', { defaultValue: 'Tema Visual' })}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('adminDashboard.settings.themeDesc', { defaultValue: 'Cambia entre modo claro y modo noche' })}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </section>

      {/* Zona de Peligro */}
      <section className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden">
        <div className="bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800/30 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-400">
              {t('adminDashboard.settings.dangerZoneTitle', { defaultValue: 'Zona Crítica' })}
            </h3>
            <p className="text-xs text-red-600 dark:text-red-500">
              {t('adminDashboard.settings.dangerZoneDesc', { defaultValue: 'Acciones irreversibles' })}
            </p>
          </div>
        </div>
        <div className="p-6 flex flex-wrap gap-4">
          <button 
            onClick={() => { if(confirm('¿Generar backup de la base de datos?')) showToast('Backup iniciado...'); }} 
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition text-sm"
          >
            {t('adminDashboard.settings.fullBackup', { defaultValue: 'Backup Completo' })}
          </button>
          <button 
            onClick={() => { if(confirm('¿Activar modo mantenimiento?')) showToast('Modo mantenimiento activado'); }} 
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition text-sm shadow-lg shadow-red-600/20"
          >
            {t('adminDashboard.settings.maintenanceMode', { defaultValue: 'Modo Mantenimiento' })}
          </button>
        </div>
      </section>
    </div>
  );
}
