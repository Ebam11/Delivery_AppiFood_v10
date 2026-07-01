import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../hooks/useProfile'
import { fetchJson } from '../api/fetchJson'
import SubscriptionTab from '../components/SubscriptionTab'
import NotificationsTab from '../components/NotificationsTab'
import PaymentMethodsTab from '../components/PaymentMethodsTab'
import ThemeToggle from '../components/ThemeToggle'
import '../styles/Profile.css'

export default function UserProfilePage({ user, onLogout, onUpdateProfile }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
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

  const [emailVerified, setEmailVerified] = useState(user?.email_verified || false)
  const [phoneVerified, setPhoneVerified] = useState(user?.phone_verified || false)
  const [verifyMsg, setVerifyMsg] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'email') {
      setEmailVerified(true);
      setVerifyMsg({ type: 'success', text: t('profile.email_verified_success') || '<i className="fas fa-check-circle mr-1"></i> ¡Tu correo electrónico ha sido verificado con éxito!' });
      setActiveTab('security');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setActiveTab, t]);

  const handleVerifyEmail = async () => {
    setVerifyLoading('email')
    setVerifyMsg(null)
    try {
      const res = await fetchJson('/profile/verify-email', { method: 'POST' })
      if (res.data) {
        setEmailVerified(true)
        onUpdateProfile?.(res.data)
        setVerifyMsg({ type: 'success', text: t('profile.email_verified_success') || '<i className="fas fa-check-circle mr-1"></i> Correo verificado correctamente.' })
      } else {
        setVerifyMsg({ type: 'success', text: t('profile.email_verification_sent') || '📩 Te hemos enviado un enlace de confirmación a tu correo electrónico.' })
      }
    } catch (err) {
      setVerifyMsg({ type: 'error', text: err.message || t('profile.verification_error') || 'Error al enviar el correo de verificación.' })
    } finally {
      setVerifyLoading(null)
    }
  }

  const handleVerifyPhone = async () => {
    setVerifyLoading('phone')
    setVerifyMsg(null)
    try {
      const res = await fetchJson('/profile/verify-phone', { method: 'POST' })
      setPhoneVerified(true)
      onUpdateProfile?.(res.data || res)
      setVerifyMsg({ type: 'success', text: t('profile.phone_verified_success') || '<i className="fas fa-check-circle mr-1"></i> Teléfono verificado correctamente.' })
    } catch (err) {
      setVerifyMsg({ type: 'error', text: err.message || t('profile.verification_error') || 'Error al verificar el teléfono.' })
    } finally {
      setVerifyLoading(null)
    }
  }

  const menuItems = [
    { id: 'info', label: t('profile.account_info') || 'Información de cuenta', icon: 'fas fa-user-circle' },
    { id: 'security', label: t('profile.security') || 'Seguridad', icon: 'fas fa-shield-alt' },
    { id: 'subscription', label: t('profile.my_subscription') || 'Mi suscripción', icon: 'fas fa-crown' },
    { id: 'payments', label: t('profile.payments') || 'Métodos de pago', icon: 'fas fa-credit-card' },
    { id: 'notifications', label: t('profile.notifications') || 'Notificaciones', icon: 'fas fa-bell' },
    { id: 'orders', label: t('profile.last_orders') || 'Mis pedidos', icon: 'fas fa-history' },
  ]

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="profile-container">
        <div className="profile-card dark:bg-slate-900 dark:border-slate-800">
          {/* Sidebar */}
          <aside className="profile-sidebar dark:bg-slate-800/50 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-500/20">
                {formData.first_name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-gray-900 dark:text-gray-100 truncate">{formData.first_name} {formData.last_name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold truncate">{formData.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      <i className="fas fa-check-circle" /> {t('profile.verified') || 'Verificado'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                      <i className="fas fa-exclamation-circle" /> {t('profile.not_verified') || 'No verificado'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <nav className="flex-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'orders') {
                      navigate('/user/orders')
                    } else {
                      setActiveTab(item.id)
                    }
                  }}
                  className={`profile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                >
                  <i className={item.icon} />
                  {item.label}
                </button>
              ))}
            </nav>

            <button 
              onClick={onLogout}
              className="mt-8 flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <i className="fas fa-sign-out-alt" />
              {t('profile.logout') || 'Cerrar sesión'}
            </button>
          </aside>

          {/* Contenido */}
          <main className="profile-content">
            {activeTab === 'info' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">{t('profile.account_info') || 'Información de cuenta'}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('profile.night_mode') || 'Modo Noche:'}</span>
                    <ThemeToggle />
                  </div>
                </div>
                
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-green-100 dark:border-green-800">
                    <i className="fas fa-check-circle" /> {t('profile.saved') || 'Guardado correctamente'}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-red-100 dark:border-red-800">
                    <i className="fas fa-exclamation-circle" /> {error}
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="profile-input-group">
                      <label className="profile-label">{t('profile.first_name') || 'Nombre'}</label>
                      <input name="first_name" value={formData.first_name} onChange={handleChange} className="profile-input" placeholder={t('profile.placeholder_first_name') || 'Tu nombre'} />
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-label">{t('profile.last_name') || 'Apellido'}</label>
                      <input name="last_name" value={formData.last_name} onChange={handleChange} className="profile-input" placeholder={t('profile.placeholder_last_name') || 'Tu apellido'} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="profile-input-group">
                      <label className="profile-label flex items-center gap-2">
                        {t('profile.email') || 'Correo electrónico'}
                        {emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                            <i className="fas fa-check-circle" /> {t('profile.verified') || 'Verificado'}
                          </span>
                        ) : (
                          <button type="button" className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full normal-case tracking-normal hover:bg-amber-100 dark:hover:bg-amber-900/50 transition">
                            <i className="fas fa-paper-plane" /> {t('profile.verify') || 'Verificar'}
                          </button>
                        )}
                      </label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="profile-input" />
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-label flex items-center gap-2">
                        {t('profile.phone') || 'Teléfono'}
                        {phoneVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                            <i className="fas fa-check-circle" /> {t('profile.verified') || 'Verificado'}
                          </span>
                        ) : formData.phone ? (
                          <button type="button" className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full normal-case tracking-normal hover:bg-amber-100 dark:hover:bg-amber-900/50 transition">
                            <i className="fas fa-paper-plane" /> {t('profile.verify') || 'Verificar'}
                          </button>
                        ) : null}
                      </label>
                      <input name="phone" value={formData.phone} onChange={handleChange} className="profile-input" placeholder={t('profile.placeholder_phone') || '+57 300 000 0000'} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <i className="fas fa-id-card text-gray-400" />
                      {t('profile.identity_document') || 'Documento de identidad'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="profile-input-group">
                      <label className="profile-label">Tipo de documento</label>
                        <select name="id_type" value={formData.id_type} onChange={handleChange} className="profile-input cursor-pointer">
                          <option value="cc">{t('profile.id_cc') || 'Cédula de Ciudadanía (CC)'}</option>
                          <option value="ce">{t('profile.id_ce') || 'Cédula de Extranjería (CE)'}</option>
                          <option value="ti">{t('profile.id_ti') || 'Tarjeta de Identidad (TI)'}</option>
                          <option value="passport">{t('profile.id_pp') || 'Pasaporte'}</option>
                          <option value="nit">{t('profile.id_nit') || 'NIT'}</option>
                        </select>
                      </div>
                      <div className="profile-input-group">
                      <label className="profile-label">Número de documento</label>
                        <input name="id_number" value={formData.id_number} onChange={handleChange} className="profile-input" placeholder={t('profile.placeholder_id') || '1234567890'} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="profile-input-group">
                      <label className="profile-label">{t('profile.birth_date') || 'Fecha de nacimiento'}</label>
                      <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="profile-input" />
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-label">{t('profile.gender') || 'Género'}</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="profile-input cursor-pointer">
                        <option value="male">{t('profile.male') || 'Masculino'}</option>
                        <option value="female">{t('profile.female') || 'Femenino'}</option>
                        <option value="other">{t('profile.other') || 'Otro'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-wrap gap-4">
                    <button 
                      type="submit" disabled={loading}
                      className="bg-red-500 hover:bg-red-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <i className="fas fa-spinner fa-spin" />}
                      {loading ? (t('profile.saving') || 'Guardando...') : (t('profile.save') || 'Guardar cambios')}
                    </button>
                    <button 
                      type="button" onClick={handleDeleteAccount}
                      className="text-red-500 font-bold px-6 hover:underline"
                    >
                      {t('profile.delete_account') || 'Eliminar cuenta'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-8">{t('profile.security') || 'Seguridad'}</h3>

                {verifyMsg && (
                  <div className={`mb-4 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border ${
                    verifyMsg.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 border-red-200 dark:border-red-800'
                  }`}>
                    {verifyMsg.text}
                    <button onClick={() => setVerifyMsg(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
                      <i className="fas fa-times" />
                    </button>
                  </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${emailVerified ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-500'}`}>
                        <i className="fas fa-envelope text-xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{t('profile.email_verification') || 'Verificación de correo electrónico'}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formData.email}</p>
                      </div>
                    </div>
                    {emailVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 font-bold text-xs flex-shrink-0">
                        <i className="fas fa-check-circle" /> {t('profile.verified') || 'Verificado'}
                      </span>
                    ) : (
                      <button
                        onClick={handleVerifyEmail}
                        disabled={verifyLoading === 'email'}
                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition shadow-sm flex-shrink-0 disabled:opacity-60 flex items-center gap-2"
                      >
                        {verifyLoading === 'email' ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
                        {verifyLoading === 'email' ? t('profile.sending') || 'Enviando...' : (t('profile.verify_now') || 'Verificar ahora')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${phoneVerified ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-500'}`}>
                        <i className="fas fa-mobile-alt text-xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{t('profile.phone_verification') || 'Verificación de número de celular'}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formData.phone || t('profile.no_phone') || 'No registrado'}</p>
                        {!formData.phone && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                            <i className="fas fa-info-circle mr-1" />{t('profile.add_phone_hint') || 'Agrega un teléfono en la pestaña de información primero.'}
                          </p>
                        )}
                      </div>
                    </div>
                    {phoneVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 font-bold text-xs flex-shrink-0">
                        <i className="fas fa-check-circle" /> {t('profile.verified') || 'Verificado'}
                      </span>
                    ) : (
                      <button
                        onClick={handleVerifyPhone}
                        disabled={!formData.phone || verifyLoading === 'phone'}
                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center gap-2"
                      >
                        {verifyLoading === 'phone' ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-mobile-alt" />}
                        {verifyLoading === 'phone' ? t('profile.verifying') || 'Verificando...' : (t('profile.verify_phone') || 'Verificar teléfono')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">
                      <i className="fas fa-lock text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{t('profile.change_password') || 'Cambiar contraseña'}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('profile.password_hint') || 'Actualiza tu contraseña de acceso'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && <SubscriptionTab user={user} />}
            {activeTab === 'payments' && <PaymentMethodsTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'orders' && (
               <div className="text-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('profile.no_orders') || 'Aún no tienes pedidos'}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{t('profile.orders_hint') || 'Tus compras aparecerán aquí.'}</p>
               </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}