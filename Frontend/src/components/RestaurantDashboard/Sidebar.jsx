import { useTranslation } from 'react-i18next'
import { COLORS } from '../../data/restaurantDashboardData'

/**
 * Sidebar de navegación para el panel del restaurante.
 */
export default function Sidebar({ active, onNav, open, onClose, user, onLogout }) {
  const { t } = useTranslation()
  
  const NAV_SECTIONS = [
    {
      title: t('rd.main_group', { defaultValue: 'Principal' }),
      items: [
        { id:'dashboard',       icon:'⊞', label: t('rd.dashboard') },
        { id:'orders',          icon:'☰', label: t('rd.orders') },
        { id:'calendar',        icon:'📅', label: t('rd.calendar') },
        { id:'messages',        icon:'💬', label: t('rd.messages') },
      ]
    },
    {
      title: t('rd.management_group', { defaultValue: 'Gestión' }),
      items: [
        { id:'menu',            icon:'🍽', label: t('rd.menu') },
        { id:'inventory',       icon:'📦', label: t('rd.inventory') },
        { id:'promotions',      icon:'🎯', label: t('rd.promotions') },
      ]
    },
    {
      title: t('rd.admin_group', { defaultValue: 'Administración' }),
      items: [
        { id:'analytics',       icon:'📈', label: t('rd.analytics') },
        { id:'reviews',         icon:'★',  label: t('rd.reviews') },
        { id:'restaurant-info', icon:'🏪', label: t('rd.restaurant_info') },
      ]
    }
  ]

  return (
    <>
      {/* Overlay para móviles */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}
      
      <aside className={`
        fixed top-0 left-0 h-full w-[220px] bg-white border-r border-gray-100 z-50
        flex flex-col transition-transform duration-300 shadow-sm
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: COLORS.primary }}>A</div>
            <span className="font-bold text-gray-800 text-base capitalize">AppiFood</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { onNav(item.id); onClose() }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all
                      ${active === item.id ? 'text-white font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                    style={active === item.id ? { background: COLORS.primary } : {}}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 pb-5 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: COLORS.primary }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'R'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || t('rd.restaurant_info')}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
          >
            🚪 {t('rd.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
