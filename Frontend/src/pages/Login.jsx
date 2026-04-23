// Archivo: src/pages/Login.jsx | Comentario: logica principal del modulo.
// src/pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Footer from '../components/Footer'
import { ApiError, fetchJson } from '../api/fetchJson'

export default function LoginPage({ onLogin }) {
  const [form, setForm]         = useState({ email: '', password: '', remember: false })
  const [errors, setErrors]     = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const change = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) {
      setErrors(er => ({ ...er, [name]: null }))
    }
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const data = await fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      localStorage.setItem('token', data.token)
      onLogin?.(data.user)
      const role = data.user?.role
      if (role === 'admin')           navigate('/admin/dashboard')
      else if (role === 'restaurant') navigate('/restaurant/dashboard')
      else                            navigate('/')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ email: error.message || 'Credenciales incorrectas.' })
      } else {
        setErrors({ email: 'Error de conexión. Intenta de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 relative flex items-center" style={{ minHeight: '100vh' }}>
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.55),rgba(20,20,20,0.55)), url(https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&h=900&fit=crop) center/cover no-repeat' }} />

        <div className="fixed top-0 left-0 right-0 h-[68px] bg-white shadow-md flex items-center justify-center z-50">
          <Link to="/" className="font-['Satisfy'] text-3xl text-[#FF4B3E]">AppiFood</Link>
        </div>

        <div className="relative z-10 w-full max-w-[1300px] mx-auto px-[10%] pt-16 pb-12 flex items-center justify-between gap-10 flex-wrap">
          {/* Texto izquierdo */}
          <div className="text-white max-w-md hidden md:block">
            <h1 className="text-5xl font-black leading-tight mb-4">{t('login.title')}</h1>
            <p className="text-xl font-semibold opacity-90 leading-relaxed">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Card */}
          <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-7">
              <div className="text-center mb-5">
                <span className="font-['Satisfy'] text-3xl text-[#FF4B3E]">AppiFood</span>
                <p className="text-[#FF4B3E] font-bold text-lg mt-1">{t('login.heading')}</p>
              </div>

              {errors.email && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                  <i className="fas fa-exclamation-circle flex-shrink-0"></i>
                  {errors.email}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
                  <input type="email" name="email" value={form.email} onChange={change}
                    placeholder="tucorreo@email.com" required autoFocus
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition
                      ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#FF4B3E]'}
                      focus:ring-2 focus:ring-[#FF4B3E]/20`} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={change}
                      placeholder="••••••••" required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/20" />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4B3E] transition">
                      <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#FF4B3E] text-white rounded-xl font-bold hover:bg-[#e03a2d] transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading
                    ? <><i className="fas fa-spinner fa-spin"></i> {t('login.loading')}</>
                    : <><i className="fas fa-sign-in-alt"></i> {t('login.submit')}</>}
                </button>

                <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="remember" checked={form.remember} onChange={change}
                      className="accent-[#FF4B3E] w-4 h-4" />
                    <span className="text-gray-700">{t('login.remember')}</span>
                  </label>
                  <Link to="/forgot-password" className="text-[#FF4B3E] hover:underline">
                    {t('login.forgot')}
                  </Link>
                </div>

                <p className="text-center text-sm text-gray-500">
                  {t('login.no_account')}{' '}
                  <Link to="/register" className="text-[#FF4B3E] font-bold hover:underline">
                    {t('login.register_link')}
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}