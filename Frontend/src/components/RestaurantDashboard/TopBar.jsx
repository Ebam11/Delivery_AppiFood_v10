import { useTranslate as useTranslation } from '../../hooks/useTranslate';
import LanguageSwitcher from '../LanguageSwitcher'
import ThemeToggle from '../ThemeToggle'
import { COLORS } from './constants'

/**
 * Barra superior del panel del restaurante.
 * Contiene el título, buscador y perfil de usuario.
 */
export default function TopBar({ title, breadcrumb, onMenuOpen, user, isAdmin }) {
  const { t } = useTranslation()
  const primaryColor = isAdmin ? '#e71d1d' : COLORS.primary
  
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuOpen} 
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"
        >
          ☰
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-slate-100">{title}</h1>
          {breadcrumb && (
            <p className="text-xs text-gray-400 dark:text-slate-500">
              <span className="cursor-pointer hover:underline" style={{ color: primaryColor }}>
                {t('rd.breadcrumb_dashboard')}
              </span>
              {breadcrumb.map((b, i) => (
                <span key={i}> / <span className="text-gray-400 dark:text-slate-500">{b}</span></span>
              ))}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2">
          <span className="text-gray-400 dark:text-slate-500 text-sm">🔍</span>
          <input 
            placeholder={t('rd.search')} 
            className="bg-transparent text-sm outline-none w-32 text-gray-600 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500" 
          />
        </div>
        
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
          🔔
        </button>

        <div className="flex items-center gap-2 border-l border-gray-100 dark:border-slate-800 pl-4 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{user?.name || t('rd.restaurant_info')}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">{isAdmin ? t('admin.admin_label', { defaultValue: 'Administrador' }) : t('rd.restaurant_label')}</p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: primaryColor }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'R'}
          </div>
        </div>
      </div>
    </header>
  )
}
