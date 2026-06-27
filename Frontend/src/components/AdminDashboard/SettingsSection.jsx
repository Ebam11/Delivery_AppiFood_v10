// Frontend/src/components/AdminDashboard/SettingsSection.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ThemeToggle from '../ThemeToggle'

const STORAGE_KEY = 'appifood_admin_settings'

const DEFAULT_SETTINGS = {
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
}

export default function SettingsSection({ showToast }) {
  const { t } = useTranslation()

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  const [savedSections, setSavedSections] = useState({})

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: value }))
  }

  const handleSave = (section) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      setSavedSections(prev => ({ ...prev, [section]: true }))
      setTimeout(() => setSavedSections(prev => ({ ...prev, [section]: false })), 2000)
      showToast(t(`adminDashboard.toast.${section}Saved`, { defaultValue: 'Configuración guardada' }))
    } catch {
      showToast('Error al guardar configuración', 'error')
    }
  }

  const handleBackup = () => {
    try {
      const backupData = {
        exported_at: new Date().toISOString(),
        settings: form,
        version: '1.0'
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `appifood-settings-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Backup descargado correctamente')
    } catch {
      showToast('Error al generar backup', 'error')
    }
  }

  const handleReset = () => {
    if (!confirm('¿Restablecer toda la configuración a valores por defecto?')) return
    setForm(DEFAULT_SETTINGS)
    localStorage.removeItem(STORAGE_KEY)
    showToast('Configuración restablecida')
  }

  const inputClass = "w-full border-2 border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 dark:focus:border-red-400 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 transition"
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2 tracking-wider"
  const sectionClass = "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
  const sectionHeaderClass = "bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center gap-3"

  const SaveButton = ({ section, label }) => (
    <button
      onClick={() => handleSave(section)}
      className={`px-6 py-2.5 rounded-xl font-bold transition text-sm ${
        savedSections[section]
          ? 'bg-green-500 text-white'
          : 'bg-gray-800 dark:bg-slate-700 text-white hover:bg-black dark:hover:bg-slate-600'
      }`}
    >
      {savedSections[section] ? '✓ Guardado' : label || 'Guardar Configuración'}
    </button>
  )

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-10">

      {/* ── Gestión de Usuarios ── */}
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
              <input
                name="adminEmail"
                value={form.adminEmail}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t('adminDashboard.settings.userLimit', { defaultValue: 'Límite de usuarios' })}
              </label>
              <input
                type="number"
                name="userLimit"
                value={form.userLimit}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>
              {t('adminDashboard.settings.accountPolicy', { defaultValue: 'Política de cuentas' })}
            </label>
            <select
              name="accountPolicy"
              value={form.accountPolicy}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="auto">Automática</option>
              <option value="manual">Aprobación Manual</option>
            </select>
          </div>
          <SaveButton section="settings" />
        </div>
      </section>

      {/* ── Seguridad ── */}
      <section className={sectionClass}>
        <div className={sectionHeaderClass}>
          <span className="text-xl">🔒</span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-100">
              {t('adminDashboard.settings.security', { defaultValue: 'Seguridad' })}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {t('adminDashboard.settings.securitySub', { defaultValue: 'Autenticación y sesiones' })}
            </p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                {t('adminDashboard.settings.twoFactor', { defaultValue: 'Autenticación de dos factores' })}
              </label>
              <select
                name="twoFactor"
                value={form.twoFactor}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="optional">Opcional</option>
                <option value="required">Obligatoria</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t('adminDashboard.settings.sessionTime', { defaultValue: 'Tiempo de sesión (min)' })}
              </label>
              <input
                type="number"
                name="sessionTime"
                value={form.sessionTime}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
          <SaveButton section="security" label="Actualizar Seguridad" />
        </div>
      </section>

      {/* ── Notificaciones del sistema ── */}
      <section className={sectionClass}>
        <div className={sectionHeaderClass}>
          <span className="text-xl"><i className="fas fa-bell mr-1"></i></span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-slate-100">Preferencias de Notificaciones</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Qué eventos generan alertas para el admin</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[
            { name: 'notifOrders', label: 'Nuevos pedidos' },
            { name: 'notifRestaurants', label: 'Nuevos restaurantes registrados' },
            { name: 'notifSystem', label: 'Alertas del sistema' },
          ].map(item => (
            <label key={item.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <span className="font-semibold text-gray-700 dark:text-slate-300 text-sm">{item.label}</span>
              <input
                type="checkbox"
                name={item.name}
                checked={form[item.name]}
                onChange={handleChange}
                className="w-4 h-4 accent-red-500"
              />
            </label>
          ))}
          <SaveButton section="notifications" label="Guardar Preferencias" />
        </div>
      </section>

      {/* ── Tema ── */}
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
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">Tema Visual</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Cambia entre modo claro y modo noche</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </section>

      {/* ── Zona Crítica ── */}
      <section className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden">
        <div className="bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800/30 px-6 py-4 flex items-center gap-3">
          <span className="text-xl"><i className="fas fa-exclamation-triangle mr-1"></i></span>
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-400">Zona Crítica</h3>
            <p className="text-xs text-red-600 dark:text-red-500">Acciones de alto impacto sobre el sistema</p>
          </div>
        </div>
        <div className="p-6 flex flex-wrap gap-4">
          <button
            onClick={handleBackup}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition text-sm"
          >
            📦 Backup de Configuración
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition text-sm shadow-lg shadow-red-600/20"
          >
            🔄 Restablecer Configuración
          </button>
        </div>
      </section>
    </div>
  )
}