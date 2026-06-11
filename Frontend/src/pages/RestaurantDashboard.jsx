/**
 * Archivo: src/pages/RestaurantDashboard.jsx
 * Punto de entrada principal para el panel de administración del restaurante.
 * Organizado de forma modular para facilitar su mantenimiento.
 */
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { useRestaurantDashboard } from '../hooks/useRestaurantDashboard'
import Sidebar from '../components/RestaurantDashboard/Sidebar'
import TopBar from '../components/RestaurantDashboard/TopBar'
import DashboardSection from '../components/RestaurantDashboard/DashboardSection'
import OrdersSection from '../components/RestaurantDashboard/OrdersSection'
import MenuSection from '../components/RestaurantDashboard/MenuSection'
import OrderDetailModal from '../components/RestaurantDashboard/OrderDetailModal'
import AnalyticsSection from '../components/RestaurantDashboard/AnalyticsSection'
import PromotionsSection from '../components/RestaurantDashboard/PromotionsSection'
import InventorySection from '../components/RestaurantDashboard/InventorySection'
import CalendarSection from '../components/RestaurantDashboard/CalendarSection'
import MessagesSection from '../components/RestaurantDashboard/MessagesSection'
import ReviewsSection from '../components/RestaurantDashboard/ReviewsSection'
import RestaurantInfoSection from '../components/RestaurantDashboard/RestaurantInfoSection'
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
    stats,
    loading,
    selectedOrder,
    setSelectedOrder,
    toast,
    categories,
    handleStatusChange,
    handleAddProduct,
    handleDeleteProduct
  } = useRestaurantDashboard(user)

  // Función para renderizar la sección activa basada en la navegación
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSection stats={stats} orders={orders} menu={menu} />
      case 'orders':
        return (
          <OrdersSection 
            orders={orders} 
            onViewDetails={setSelectedOrder} 
            onUpdateStatus={handleStatusChange} 
          />
        )
      case 'menu':
        return (
          <MenuSection 
            menu={menu} 
            categories={categories}
            onAdd={handleAddProduct}
            onDelete={handleDeleteProduct}
          />
        )
      case 'analytics': return <AnalyticsSection stats={stats} />
      case 'promotions': return <PromotionsSection />
      case 'inventory': return <InventorySection />
      case 'calendar': return <CalendarSection />
      case 'messages': return <MessagesSection />
      case 'reviews': return <ReviewsSection />
      case 'restaurant-info': return <RestaurantInfoSection restaurant={user?.restaurant || user} />
      default:
        return <DashboardSection stats={stats} orders={orders} menu={menu} />
    }
  }

  return (
    <div className="rd-container flex min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-slate-100 transition-colors duration-250">
      {/* Navegación Lateral */}
      <Sidebar 
        active={activeTab} 
        onNav={setActiveTab} 
        open={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 md:pl-[220px]">
        {/* Barra Superior */}
        <TopBar 
          title={t(`rd.${activeTab.replace('-', '_')}`)} 
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