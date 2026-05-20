import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'
import { COLORS } from '../../data/restaurantDashboardData'
import NotificationDropdown from './NotificationDropdown'

export default function TopBar({ title, breadcrumb, onMenuOpen, user, notifications, unreadCount, onNotifRead, onNotifDelete, onNotifMarkAll }) {
  const { t } = useTranslation()

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuOpen}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500"
        >
          ☰
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{title}</h1>
          {breadcrumb && (
            <p className="text-xs text-gray-400">
              <span className="cursor-pointer hover:underline" style={{ color: COLORS.primary }}>
                {t('rd.breadcrumb_dashboard')}
              </span>
              {breadcrumb.map((b, i) => (
                <span key={i}> / <span className="text-gray-400">{b}</span></span>
              ))}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            placeholder={t('rd.search')}
            className="bg-transparent text-sm outline-none w-32 text-gray-600 placeholder-gray-400"
          />
        </div>

        <LanguageSwitcher />

        {/* Campana con dropdown de notificaciones */}
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onRead={onNotifRead}
          onDelete={onNotifDelete}
          onMarkAll={onNotifMarkAll}
        />

        <div className="flex items-center gap-2 border-l border-gray-100 pl-4 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">{user?.name || t('rd.restaurant_info')}</p>
            <p className="text-xs text-gray-400">{t('rd.restaurant_label')}</p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: COLORS.primary }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'R'}
          </div>
        </div>
      </div>
    </header>
  )
}