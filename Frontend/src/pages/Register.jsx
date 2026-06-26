/**
 * Archivo: src/pages/Register.jsx
 * Componente de registro para nuevos clientes.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { ApiError, fetchJson } from '../api/fetchJson'
import { isValidName } from '../utils/validation'
import Footer from '../components/Footer'
import './Auth.css'

export default function RegisterPage({ onLogin }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm_password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const [showEmailForm, setShowEmailForm] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  const isNameInvalid = formData.name && !isValidName(formData.name)

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-slate-200', labelColor: 'text-slate-400' }
    let score = 0
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[a-z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1
    
    if (pwd.length < 8) {
      return { score: 0, text: t('validation.password_too_short'), color: 'bg-red-400', labelColor: 'text-red-500' }
    }
    
    if (score === 1) return { score: 1, text: t('validation.password_weak'), color: 'bg-amber-400', labelColor: 'text-amber-500' }
    if (score === 2) return { score: 2, text: t('validation.password_medium'), color: 'bg-blue-400', labelColor: 'text-blue-500' }
    return { score: 3, text: t('validation.password_strong'), color: 'bg-emerald-500', labelColor: 'text-emerald-500' }
  }

  const pwdInfo = getPasswordStrength(formData.password)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!isValidName(formData.name)) {
      return setError(t('validation.name_special_chars'))
    }
    if (formData.password !== formData.confirm_password) {
      return setError(t('register.error_passwords_match') || "Las contraseñas no coinciden")
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchJson('/auth/register', {
        method: 'POST',
        body: { 
          name: formData.name, 
          email: formData.email, 
          password: formData.password,
          password_confirmation: formData.confirm_password
        }
      })

      const token = data.data?.access_token || data.token
      const user = data.data?.user || data.user
      localStorage.setItem('token', token)
      onLogin?.(user)
      navigate('/')
      
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('register.error_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Header Centrado */}
      <header className="h-[80px] flex items-center justify-center bg-white border-b border-slate-100 z-50">
        <Link to="/" className="logo-satisfy text-4xl text-[#FF4B3E]">AppiFood</Link>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sección Izquierda: Imagen Decorativa */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: 'url(/img/auth-bg.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-16">
            <h2 className="text-4xl font-black text-white leading-tight max-w-md">
              {t('register.hero_text') || "Únete a la red de comida más grande y empieza a disfrutar."}
            </h2>
          </div>
        </div>

        {/* Sección Derecha: Formulario */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-slate-900 mb-2">{t('register.heading') || "Regístrate ahora"}</h1>
                <p className="text-slate-500 font-medium">{t('register.subtitle') || "Crea tu cuenta y empieza a disfrutar hoy mismo."}</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-red-100 animate-shake">
                  <i className="fas fa-exclamation-circle text-lg" /> {error}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <button 
                  type="button"
                  onClick={() => {
                    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost/delivery-appifood/Backend/public'
                    window.location.href = `${apiBase}/api/auth/google`
                  }}
                  className="w-full bg-white border-2 border-slate-100 hover:border-red-500/30 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  {t('register.google_button') || "Registrarse con Google"}
                </button>
                
                {!showEmailForm ? (
                  <button 
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="w-full bg-slate-50 border-2 border-transparent hover:border-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-envelope text-slate-400" />
                    {t('register.continue_email') || "Registrarme con mi correo"}
                  </button>
                ) : (
                  <div className="animate-fade-in space-y-4">
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="flex-shrink mx-4 text-xs font-black uppercase tracking-widest text-slate-300">Tus datos</span>
                      <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('register.name')}</label>
                          <input 
                            type="text" name="name" value={formData.name} onChange={handleChange}
                            className={`w-full border-2 rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700 ${
                              isNameInvalid 
                                ? 'border-red-500 bg-red-50/20 focus:border-red-500' 
                                : 'border-transparent bg-slate-50 focus:border-red-500/30 focus:bg-white'
                            }`}
                            placeholder="Tu nombre completo" required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('register.email')}</label>
                          <input 
                            type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700"
                            placeholder="ejemplo@correo.com" required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('register.password')}</label>
                            <input 
                              type="password" name="password" value={formData.password} onChange={handleChange}
                              className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700"
                              placeholder="••••••••" required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('register.confirm_password')}</label>
                            <input 
                              type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange}
                              className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700"
                              placeholder="••••••••" required
                            />
                          </div>
                        </div>

                        {formData.password && (
                          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3 animate-fade-in mt-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs font-bold">
                                {formData.password.length >= 8 ? (
                                  <span className="text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
                                    <i className="fas fa-check-circle" /> {t('validation.password_min_length')}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
                                    <i className="far fa-circle" /> {t('validation.password_min_length')}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs font-bold">
                                <span className="text-slate-400">Seguridad:</span>
                                <span className={`px-2.5 py-1 rounded-full text-white ${pwdInfo.color}`}>
                                  {pwdInfo.text}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${pwdInfo.color}`} 
                                  style={{ width: `${formData.password.length >= 8 ? (pwdInfo.score + 1) * 33.3 : 15}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button 
                        type="submit" disabled={loading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 transform active:scale-[0.98]"
                      >
                        {loading ? <i className="fas fa-spinner fa-spin text-lg" /> : <i className="fas fa-user-plus text-lg" />}
                        <span className="text-lg">{loading ? t('register.loading') : t('register.submit')}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <p className="text-center mt-8 text-slate-500 font-bold">
                ¿Ya tienes cuenta? <Link to="/login" className="text-red-500 hover:underline">Inicia sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}