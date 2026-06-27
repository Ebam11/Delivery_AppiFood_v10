// Frontend/src/components/RestaurantDashboard/TopBar.jsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'
import { COLORS } from './constants'

export default function TopBar({
  title, breadcrumb, onMenuOpen, user, isAdmin,
  notifications = [], unreadCount = 0,
  onNotifRead, onNotifDelete, onNotifMarkAll,
  searchQuery = '', onSearchChange, activeTab
}) {
  const { t } = useTranslation()
  const primaryColor = isAdmin ? '#e71d1d' : COLORS.primary
  const [showNotifs, setShowNotifs] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuOpen}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400"
        >
          <i className="fas fa-bars" />
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

      <div className="flex items-center gap-3">

        {/* Buscador */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 transition-all focus-within:border-red-400">
          <i className="fas fa-search text-gray-400 dark:text-slate-500 text-sm" />
          <input
            placeholder={
              activeTab === 'orders' ? 'Buscar pedido...' :
              activeTab === 'menu' ? 'Buscar plato...' :
              activeTab === 'reviews' ? 'Buscar reseña...' :
              activeTab === 'inventory' ? 'Buscar producto...' :
              'Buscar...'
            }
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && onSearchChange?.('')}
            className="bg-transparent text-sm outline-none w-36 text-gray-600 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange?.('')} className="text-gray-300 hover:text-red-400 transition">
              <i className="fas fa-xmark text-xs" />
            </button>
          )}
        </div>

        {/* Notificaciones */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <i className="fas fa-bell text-sm" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
                style={{ background: primaryColor, fontSize: '10px' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                  {t('rd.notifications_title') || 'Notificaciones'}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => onNotifMarkAll?.()}
                    className="text-xs hover:underline"
                    style={{ color: primaryColor }}
                  >
                    {t('rd.mark_all_read') || 'Marcar todas como leídas'}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 dark:text-slate-500 text-sm">
                    {t('rd.no_notifications') || 'Sin notificaciones'}
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition ${!n.is_read ? 'bg-red-50/40 dark:bg-red-950/10' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${!n.is_read ? 'font-semibold text-gray-800 dark:text-slate-100' : 'text-gray-600 dark:text-slate-400'}`}>
                          {n.message || n.data?.message || t('rd.new_notification') || 'Nueva notificación'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                          {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.is_read && (
                          <button
                            onClick={() => onNotifRead?.(n.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 text-xs"
                            title={t('rd.mark_read') || 'Marcar como leída'}
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => onNotifDelete?.(n.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-300 hover:text-red-400 text-xs"
                          title={t('rd.delete_notification') || 'Eliminar'}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}