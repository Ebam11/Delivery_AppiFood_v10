/**
 * Archivo: src/pages/Profile.jsx
 * Página de perfil de usuario.
 * Modularizada para mejor mantenimiento.
 */

import { useTranslation } from 'react-i18next'
import { useProfile } from '../hooks/useProfile'
import SubscriptionTab from '../components/SubscriptionTab'
import NotificationsTab from '../components/NotificationsTab'
import PaymentMethodsTab from '../components/PaymentMethodsTab'
import '../styles/Profile.css'

export default function UserProfilePage({ user, onLogout, onUpdateProfile }) {
  const { t } = useTranslation()
  const {
    activeTab,
    setActiveTab,
    formData,
    loading,
    success,
    error,
    handleChange,
    handleUpdate,
    handleDeleteAccount
  } = useProfile(user, onUpdateProfile, onLogout)

  const menuItems = [
    { id: 'info', label: t('profile.account_info'), icon: 'fas fa-user-circle' },
    { id: 'subscription', label: t('profile.my_subscription'), icon: 'fas fa-crown' },
    { id: 'payments', label: t('profile.payments'), icon: 'fas fa-credit-card' },
    { id: 'notifications', label: t('profile.notifications'), icon: 'fas fa-bell' },
    { id: 'orders', label: t('profile.last_orders'), icon: 'fas fa-history' },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="profile-container">
        <div className="profile-card">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-500/20">
                {formData.first_name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-gray-900 truncate">{formData.first_name} {formData.last_name}</h2>
                <p className="text-xs text-gray-500 font-bold truncate">{formData.email}</p>
              </div>
            </div>

            <nav className="flex-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`profile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                >
                  <i className={item.icon} />
                  {item.label}
                </button>
              ))}
            </nav>

            <button 
              onClick={onLogout}
              className="mt-8 flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <i className="fas fa-sign-out-alt" />
              {t('profile.logout')}
            </button>
          </aside>

          {/* Contenido */}
          <main className="profile-content">
            {activeTab === 'info' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-black text-gray-900 mb-8">{t('profile.account_info')}</h3>
                
                {success && (
                  <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-green-100">
                    <i className="fas fa-check-circle" /> ¡Perfil actualizado con éxito!
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="profile-input-group">
                      <label className="profile-label">{t('profile.first_name')}</label>
                      <input name="first_name" value={formData.first_name} onChange={handleChange} className="profile-input" />
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-label">{t('profile.last_name')}</label>
                      <input name="last_name" value={formData.last_name} onChange={handleChange} className="profile-input" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="profile-input-group">
                      <label className="profile-label">{t('profile.email')}</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="profile-input" />
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-label">{t('profile.phone')}</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} className="profile-input" />
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="submit" disabled={loading}
                      className="bg-red-500 hover:bg-red-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button 
                      type="button" onClick={handleDeleteAccount}
                      className="text-red-500 font-bold px-6 hover:underline"
                    >
                      Eliminar Cuenta
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'subscription' && <SubscriptionTab user={user} />}
            {activeTab === 'payments' && <PaymentMethodsTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'orders' && (
               <div className="text-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes pedidos</h4>
                  <p className="text-gray-500">Tus compras aparecerán aquí.</p>
               </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}