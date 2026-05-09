/**
 * Archivo: src/pages/Register.jsx
 * Componente de registro para nuevos clientes.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiError, fetchJson } from '../api/fetchJson'
import Footer from '../components/Footer'
import './Auth.css'

export default function RegisterPage({ onLogin }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm_password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
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

      localStorage.setItem('token', data.token)
      onLogin?.(data.user)
      navigate('/')
      
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('register.error_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
          <div className="text-center mb-8">
            <Link to="/" className="logo-satisfy text-4xl mb-4 inline-block">AppiFood</Link>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{t('register.heading') || "Crea tu cuenta"}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">{t('register.subtitle') || "Únete para disfrutar la mejor comida."}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-red-100 animate-fade-in">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('register.name')}</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                placeholder="Tu nombre completo" required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('register.email')}</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                placeholder="ejemplo@correo.com" required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('register.password')}</label>
              <input 
                type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                placeholder="••••••••" required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('register.confirm_password')}</label>
              <input 
                type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                placeholder="••••••••" required
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-user-plus" />}
              {loading ? t('register.loading') : t('register.submit')}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 font-medium">
            ¿Ya tienes cuenta? <Link to="/login" className="text-red-500 font-black hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}