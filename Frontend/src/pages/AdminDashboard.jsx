// Frontend/src/pages/AdminDashboard.jsx
import { useTranslation } from 'react-i18next'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import Sidebar from '../components/RestaurantDashboard/Sidebar'
import TopBar from '../components/RestaurantDashboard/TopBar'
import DashboardSection from '../components/AdminDashboard/DashboardSection'
import RestaurantsSection from '../components/AdminDashboard/RestaurantsSection'
import UsersSection from '../components/AdminDashboard/UsersSection'
import OrdersSection from '../components/AdminDashboard/OrdersSection'
import ReviewsSection from '../components/AdminDashboard/ReviewsSection'
import NotificationsSection from '../components/AdminDashboard/NotificationsSection'
import ReportsSection from '../components/AdminDashboard/ReportsSection'
import SettingsSection from '../components/AdminDashboard/SettingsSection'
import '../styles/AdminDashboard.css'

export default function AdminDashboard({ user, onLogout }) {
  const { t } = useTranslation()
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    loading,
    stats,
    restaurants,
    users,
    orders,
    reviews,
    pagination,
    toast,
    showToast,
    toggleUserStatus,
    deleteUser,
    verifyRestaurant,
    toggleRestaurantStatus,
    deleteRestaurant,
    updateOrderStatus,
    deleteOrder,
    toggleReviewVisibility,
    deleteReview,
  } = useAdminDashboard()

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSection stats={stats} loading={loading} />
      case 'restaurants':
        return (
          <RestaurantsSection
            restaurants={restaurants}
            loading={loading}
            onVerify={verifyRestaurant}
            onToggleStatus={toggleRestaurantStatus}
            onDelete={deleteRestaurant}
            pagination={pagination}
          />
        )
      case 'users':
        return (
          <UsersSection
            users={users}
            loading={loading}
            onToggleStatus={toggleUserStatus}
            onDelete={deleteUser}
            pagination={pagination}
          />
        )
      case 'orders':
        return (
          <OrdersSection
            orders={orders}
            loading={loading}
            onUpdateStatus={updateOrderStatus}
            onDelete={deleteOrder}
            pagination={pagination}
          />
        )
      case 'reviews':
        return (
          <ReviewsSection
            reviews={reviews}
            loading={loading}
            onToggleVisibility={toggleReviewVisibility}
            onDelete={deleteReview}
            pagination={pagination}
          />
        )
      case 'notifications':
        return <NotificationsSection showToast={showToast} />
      case 'reports':
        return <ReportsSection />
      case 'settings':
        return <SettingsSection showToast={showToast} />
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4">🚧</span>
            <p className="text-xl font-bold">{t('adminDashboard.coming_soon') || 'Próximamente'}</p>
            <p className="text-sm">{t('adminDashboard.in_development') || 'Sección en desarrollo.'}</p>
          </div>
        )
    }
  }

  return (
    <div className="ad-container flex min-h-screen bg-orange-50/30 dark:bg-slate-950 text-gray-800 dark:text-slate-100 transition-colors duration-250">
      <Sidebar
        active={activeTab}
        onNav={setActiveTab}
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={onLogout}
        isAdmin={true}
      />

      <div className="flex-1 flex flex-col min-w-0 md:pl-[220px]">
        <TopBar
          title={t(`adminDashboard.nav.${activeTab}`, { defaultValue: activeTab })}
          onMenuOpen={() => setIsSidebarOpen(true)}
          user={user}
          isAdmin={true}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm text-white ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.type === 'error' ? '✗' : '✓'} {toast.message}
        </div>
      )}
    </div>
  )
}