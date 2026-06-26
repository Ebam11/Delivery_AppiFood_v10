// Frontend/src/components/RestaurantDashboard/Sidebar.jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getHomePathByRole } from '../../utils/appHelpers'
import { COLORS } from './constants'

export default function Sidebar({ active, onNav, open, onClose, user, onLogout, isAdmin }) {
  const { t } = useTranslation()
  const primaryColor = isAdmin ? '#e71d1d' : COLORS.primary

  const NAV_SECTIONS = isAdmin ? [
    {
      title: t('adminDashboard.breadcrumb.globalOrders', { defaultValue: 'Pedidos Globales' }),
      items: [
        { id: 'dashboard',     icon: 'fa-gauge',        label: t('adminDashboard.nav.dashboard',      { defaultValue: 'Dashboard' }) },
        { id: 'restaurants',   icon: 'fa-utensils',     label: t('adminDashboard.nav.restaurants',    { defaultValue: 'Restaurantes' }) },
        { id: 'users',         icon: 'fa-users',        label: t('adminDashboard.nav.users',          { defaultValue: 'Usuarios' }) },
        { id: 'orders',        icon: 'fa-bag-shopping', label: t('adminDashboard.nav.orders',         { defaultValue: 'Pedidos' }) },
      ]
    },
    {
      title: t('adminDashboard.breadcrumb.moderation', { defaultValue: 'Moderación' }),
      items: [
        { id: 'reviews',       icon: 'fa-star',         label: t('adminDashboard.nav.reviews',        { defaultValue: 'Reseñas' }) },
        { id: 'notifications', icon: 'fa-bell',         label: t('adminDashboard.nav.notifications',  { defaultValue: 'Notificaciones' }) },
      ]
    },
    {
      title: t('adminDashboard.breadcrumb.system', { defaultValue: 'Sistema' }),
      items: [
        { id: 'reports',       icon: 'fa-chart-bar',    label: t('adminDashboard.nav.reports',        { defaultValue: 'Reportes' }) },
        { id: 'settings',      icon: 'fa-gear',         label: t('adminDashboard.nav.settings',       { defaultValue: 'Configuración' }) },
      ]
    }
  ] : [
    {
      title: t('rd.main_group', { defaultValue: 'Principal' }),
      items: [
        { id: 'dashboard',       icon: 'fa-gauge',          label: t('rd.dashboard') },
        { id: 'orders',          icon: 'fa-bag-shopping',   label: t('rd.orders') },
        { id: 'messages',        icon: 'fa-comment-dots',   label: t('rd.messages') },
      ]
    },
    {
      title: t('rd.management_group', { defaultValue: 'Gestión' }),
      items: [
        { id: 'menu',            icon: 'fa-book-open',      label: t('rd.menu') },
        { id: 'inventory',       icon: 'fa-boxes-stacked',  label: t('rd.inventory') },
        { id: 'promotions',      icon: 'fa-tag',            label: t('rd.promotions') },
      ]
    },
    {
      title: t('rd.admin_group', { defaultValue: 'Administración' }),
      items: [
        { id: 'analytics',       icon: 'fa-chart-line',     label: t('rd.analytics') },
        { id: 'reviews',         icon: 'fa-star',           label: t('rd.reviews') },
        { id: 'restaurant-info', icon: 'fa-store',          label: t('rd.restaurant_info') },
      ]
    }
  ]

  // Nombre a mostrar: nombre del restaurante si está disponible, sino nombre del usuario
  const displayName = user?.restaurant?.name || user?.name || t('rd.restaurant_info')

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full w-[220px] bg-white border-r border-gray-100 z-50
        flex flex-col transition-transform duration-300 shadow-sm
        dark:bg-slate-900 dark:border-slate-800
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        {/* Logo - AHORA MUESTRA NOMBRE DEL RESTAURANTE */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800">
          <Link to={getHomePathByRole(user)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: primaryColor }}>
              {displayName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="font-bold text-gray-800 dark:text-slate-100 text-base truncate">
              {displayName}
            </span>
          </Link>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <p className="px-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onNav(item.id); onClose() }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all
                      ${active === item.id
                        ? 'text-white font-semibold'
                        : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-100'
                      }`}
                    style={active === item.id ? { background: primaryColor } : {}}
                  >
                    <i className={`fas ${item.icon} text-sm w-4 text-center`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del sidebar - SOLO BOTÓN DE LOGOUT */}
        <div className="px-4 pb-5 border-t border-gray-100 dark:border-slate-800 pt-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition shadow-sm shadow-red-500/20"
          >
            <i className="fas fa-right-from-bracket text-sm" />
            {t('rd.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}