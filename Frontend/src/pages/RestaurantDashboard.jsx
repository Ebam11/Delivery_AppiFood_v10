/**
 * Archivo: src/pages/RestaurantDashboard.jsx
 * Punto de entrada principal para el panel de administración del restaurante.
 * Organizado de forma modular para facilitar su mantenimiento.
 */
import { useTranslation } from 'react-i18next'
import { useRestaurantDashboard } from '../hooks/useRestaurantDashboard'
import Sidebar from '../components/RestaurantDashboard/Sidebar'
import TopBar from '../components/RestaurantDashboard/TopBar'
import DashboardSection from '../components/RestaurantDashboard/DashboardSection'
import OrdersSection from '../components/RestaurantDashboard/OrdersSection'
import MenuSection from '../components/RestaurantDashboard/MenuSection'
import OrderDetailModal from '../components/RestaurantDashboard/OrderDetailModal'
import '../styles/RestaurantDashboard.css'

export default function RestaurantDashboard({ user, onLogout }) {
  const { t } = useTranslation()
  
  // Toda la lógica de estado y manejadores se encuentra en este hook personalizado
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    orders,
    menu,
    categories,       //nuevo
    stats,
    loading,
    menuLoading,      //nuevo
    selectedOrder,
    setSelectedOrder,
    toast,
    handleStatusChange,
     handleAddProduct,       // ← nuevo
    handleEditProduct,      // ← nuevo
    handleDeleteProduct,    // ← nuevo
    handleToggleAvailability // ← nuevo
  } = useRestaurantDashboard(user)

  // Función para renderizar la sección activa basada en la navegación
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSection orders={orders} menu={menu} stats={stats} loading={loading} />
      case 'orders':
        return (
          <OrdersSection 
            orders={orders} 
            onStatusChange={handleStatusChange} 
            onSelectOrder={setSelectedOrder} 
          />
        )
      case 'menu':
        return (
          <MenuSection
            menu={menu}
            categories={categories}
            loading={menuLoading}
            onAdd={handleAddProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggle={handleToggleAvailability}
          />
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4">🚧</span>
            <p className="text-xl font-bold">{t('rd.coming_soon') || "Próximamente"}</p>
            <p className="text-sm">{t('rd.section_under_construction') || "Esta sección está en desarrollo."}</p>
          </div>
        )
    }
  }

  return (
    <div className="rd-container flex min-h-screen bg-slate-50">
      {/* Navegación Lateral */}
      <Sidebar 
        active={activeTab} 
        onNav={setActiveTab} 
        open={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior */}
        <TopBar 
          title={t(`rd.${activeTab}`)} 
          onMenuOpen={() => setIsSidebarOpen(true)} 
          user={user} 
        />

        {/* Contenido Principal */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Notificaciones flotantes */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white bg-red-500 animate-bounce">
          ✓ {toast}
        </div>
      )}

      {/* Modal de Detalle de Orden */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}