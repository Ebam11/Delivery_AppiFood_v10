/**
 * Archivo: src/pages/AdminDashboard.jsx
 * Panel de administración global para AppiFood.
 */
import { useTranslation } from 'react-i18next'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import Sidebar from '../components/RestaurantDashboard/Sidebar' // Reusamos el sidebar con flags
import TopBar from '../components/RestaurantDashboard/TopBar'
import '../styles/AdminDashboard.css'

export default function AdminDashboard({ user, onLogout }) {
  const { t } = useTranslation()
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    restaurants,
    users,
    orders,
    toast,
    showToast
  } = useAdminDashboard()

  return (
    <div className="ad-container flex min-h-screen bg-orange-50/30">
      <Sidebar 
        active={activeTab} 
        onNav={setActiveTab} 
        open={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user}
        onLogout={onLogout}
        isAdmin={true}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          title={t(`adminDashboard.nav.${activeTab}`)} 
          onMenuOpen={() => setIsSidebarOpen(true)} 
          user={user}
          isAdmin={true}
        />

        <main className="flex-1 p-6 overflow-y-auto">
           <div className="bg-white rounded-3xl p-10 border border-orange-100 shadow-sm text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Panel de Administración</h2>
              <p className="text-gray-500">Sección {activeTab} en proceso de optimización modular.</p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="p-4 bg-orange-50 rounded-2xl">
                    <p className="text-3xl font-bold text-red-500">{restaurants.length}</p>
                    <p className="text-sm text-gray-600">Restaurantes</p>
                 </div>
                 <div className="p-4 bg-orange-50 rounded-2xl">
                    <p className="text-3xl font-bold text-red-500">{users.length}</p>
                    <p className="text-sm text-gray-600">Usuarios</p>
                 </div>
                 <div className="p-4 bg-orange-50 rounded-2xl">
                    <p className="text-3xl font-bold text-red-500">{orders.length}</p>
                    <p className="text-sm text-gray-600">Pedidos</p>
                 </div>
              </div>
           </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white bg-red-600">
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
