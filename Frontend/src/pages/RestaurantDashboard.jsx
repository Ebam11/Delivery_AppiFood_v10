/**
 * Archivo: src/pages/RestaurantDashboard.jsx
 * Punto de entrada principal para el panel de administración del restaurante.
 */
import { useTranslation } from 'react-i18next'
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
    handleDeleteProduct,
    notifications,
    unreadCount,
    handleNotifRead,
    handleNotifDelete,
    handleNotifMarkAll,
    handleEditProduct,
    handleToggleAvailability,
    restaurantProfile,
  } = useRestaurantDashboard(user)

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
            onEdit={handleEditProduct}
            onToggleAvailability={handleToggleAvailability}
          />
        )
      case 'analytics': return <AnalyticsSection stats={stats} />
      case 'promotions': return <PromotionsSection />
      case 'inventory': return <InventorySection />
      case 'calendar': return <CalendarSection />
      case 'messages': return <MessagesSection />
      case 'reviews': return <ReviewsSection />
      case 'restaurant-info':
  return (
    <RestaurantInfoSection
      restaurant={restaurantProfile || user?.restaurant}
      restaurantId={restaurantProfile?.id || user?.restaurant?.id}
    />
  )
      default:
        return <DashboardSection stats={stats} orders={orders} menu={menu} />
    }
  }

  return (
    <div className="rd-container flex min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-slate-100 transition-colors duration-250">
      <Sidebar 
        active={activeTab} 
        onNav={setActiveTab} 
        open={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 md:pl-[220px]">
        <TopBar
          title={
            activeTab === 'dashboard' && restaurantProfile?.name
              ? restaurantProfile.name
              : t(`rd.${activeTab.replace('-', '_')}`)
          }
          onMenuOpen={() => setIsSidebarOpen(true)}
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
          onNotifRead={handleNotifRead}
          onNotifDelete={handleNotifDelete}
          onNotifMarkAll={handleNotifMarkAll}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white bg-red-500 animate-bounce">
          ✓ {toast}
        </div>
      )}

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