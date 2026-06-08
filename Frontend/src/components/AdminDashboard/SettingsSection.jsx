import { useState } from 'react';
import { useTranslate as useTranslation } from '../../hooks/useTranslate';

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

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-10">
      
      {/* Gestión de Usuarios */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">👥</span>
          <div>
            <h3 className="font-bold text-gray-800">{t('adminDashboard.settings.userMgmt', { defaultValue: 'Gestión de Usuarios' })}</h3>
            <p className="text-xs text-gray-500">{t('adminDashboard.settings.userMgmtSub', { defaultValue: 'Límites y políticas' })}</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('adminDashboard.settings.adminEmail', { defaultValue: 'Email del Administrador' })}</label>
              <input name="adminEmail" value={form.adminEmail} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('adminDashboard.settings.userLimit', { defaultValue: 'Límite de usuarios' })}</label>
              <input type="number" name="userLimit" value={form.userLimit} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('adminDashboard.settings.accountPolicy', { defaultValue: 'Política de cuentas' })}</label>
            <select name="accountPolicy" value={form.accountPolicy} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 bg-gray-50">
              <option value="auto">{t('adminDashboard.settings.policyAuto', { defaultValue: 'Automática' })}</option>
              <option value="manual">{t('adminDashboard.settings.policyManual', { defaultValue: 'Aprobación Manual' })}</option>
            </select>
          </div>
          <button onClick={() => handleSave('settings')} className="px-6 py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition text-sm">
            {t('adminDashboard.settings.saveConfig', { defaultValue: 'Guardar Configuración' })}
          </button>
        </div>
      </section>

      {/* Seguridad */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <h3 className="font-bold text-gray-800">{t('adminDashboard.settings.security', { defaultValue: 'Seguridad' })}</h3>
            <p className="text-xs text-gray-500">{t('adminDashboard.settings.securitySub', { defaultValue: 'Autenticación' })}</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('adminDashboard.settings.twoFactor', { defaultValue: '2FA' })}</label>
              <select name="twoFactor" value={form.twoFactor} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 bg-gray-50">
                <option value="optional">{t('adminDashboard.settings.tfOptional', { defaultValue: 'Opcional' })}</option>
                <option value="required">{t('adminDashboard.settings.tfRequired', { defaultValue: 'Obligatoria' })}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('adminDashboard.settings.sessionTime', { defaultValue: 'Tiempo de sesión (min)' })}</label>
              <input type="number" name="sessionTime" value={form.sessionTime} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 bg-gray-50" />
            </div>
          </div>
          <button onClick={() => handleSave('security')} className="px-6 py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition text-sm">
            {t('adminDashboard.settings.updateSecurity', { defaultValue: 'Actualizar Seguridad' })}
          </button>
        </div>
      </section>

      {/* Zona de Peligro */}
      <section className="bg-red-50 rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="bg-red-100 border-b border-red-200 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold text-red-800">{t('adminDashboard.settings.dangerZoneTitle', { defaultValue: 'Zona Crítica' })}</h3>
            <p className="text-xs text-red-600">{t('adminDashboard.settings.dangerZoneDesc', { defaultValue: 'Acciones irreversibles' })}</p>
          </div>
        </div>
        <div className="p-6 flex flex-wrap gap-4">
          <button onClick={() => { if(confirm('¿Generar backup de la base de datos?')) showToast('Backup iniciado...'); }} className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition text-sm">
            {t('adminDashboard.settings.fullBackup', { defaultValue: 'Backup Completo' })}
          </button>
          <button onClick={() => { if(confirm('¿Activar modo mantenimiento?')) showToast('Modo mantenimiento activado'); }} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition text-sm shadow-lg shadow-red-600/20">
            {t('adminDashboard.settings.maintenanceMode', { defaultValue: 'Modo Mantenimiento' })}
          </button>
        </div>
      </section>
    </div>
  );
}
