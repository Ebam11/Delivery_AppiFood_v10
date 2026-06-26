import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resetPassword, sendPasswordResetLink } from '../api/auth'
import './Auth.css'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const emailFromQuery = searchParams.get('email') || ''
  const isResetMode = Boolean(token && emailFromQuery)

  const initialForm = useMemo(() => ({
    email: emailFromQuery,
    password: '',
    password_confirmation: '',
  }), [emailFromQuery])

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isResetMode) {
        await resetPassword({
          token,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        })
        setMessage(t('forgotPassword.reset_success') || 'Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        await sendPasswordResetLink(form.email)
        setMessage(t('forgotPassword.link_sent') || 'Te enviamos un correo con el enlace para restablecer tu contraseña.')
      }
    } catch (requestError) {
      const responseMessage = requestError?.response?.data?.message || (t('forgotPassword.error_generic') || 'No se pudo procesar la solicitud. Intenta nuevamente.')
      setError(responseMessage)
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
            <span className="inline-flex self-start items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm mb-4">
              <i className="fas fa-key" /> {t('forgotPassword.badge') || 'Recuperación segura'}
            </span>
            <h2 className="text-4xl font-black text-white leading-tight max-w-md">
              {t('forgotPassword.title') || "Recupera el acceso a tu cuenta en minutos."}
            </h2>
          </div>
        </div>

        {/* Sección Derecha: Formulario */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-slate-900 mb-2">
                  {isResetMode ? (t('forgotPassword.create_new') || 'Nueva contraseña') : (t('forgotPassword.forgot_question') || '¿Olvidaste tu clave?')}
                </h1>
                <p className="text-slate-500 font-medium">
                  {isResetMode
                    ? (t('forgotPassword.reset_hint') || 'Escribe la nueva clave que usarás para entrar a tu cuenta.')
                    : (t('forgotPassword.forgot_hint') || 'Ingresa tu correo y te enviaremos un enlace de recuperación.')}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-red-100 animate-shake">
                  <i className="fas fa-exclamation-circle text-lg" /> {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-green-100 animate-fade-in">
                  <i className="fas fa-check-circle text-lg" /> {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('forgotPassword.email') || 'Correo electrónico'}</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={Boolean(emailFromQuery)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700 disabled:opacity-60"
                    placeholder="tucorreo@email.com"
                  />
                </div>

                {isResetMode && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('forgotPassword.new_password') || 'Nueva contraseña'}</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength="8"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('forgotPassword.confirm_password') || 'Confirmar contraseña'}</label>
                      <input
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        required
                        minLength="8"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700"
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 transform active:scale-[0.98]"
                >
                  {loading ? <i className="fas fa-spinner fa-spin text-lg" /> : <i className="fas fa-paper-plane text-lg" />}
                  <span className="text-lg">
                    {loading ? (t('forgotPassword.processing') || 'Procesando...') : isResetMode ? (t('forgotPassword.submit_reset') || 'Restablecer') : (t('forgotPassword.submit_link') || 'Enviar enlace')}
                  </span>
                </button>

                <div className="flex items-center justify-between px-1 text-sm font-bold mt-6">
                  <Link to="/login" className="text-red-500 hover:underline">
                    {t('forgotPassword.back_to_login') || 'Volver a iniciar sesión'}
                  </Link>
                  <Link to="/support" className="text-slate-500 hover:text-red-500 transition-colors">
                    {t('forgotPassword.need_help') || '¿Necesitas ayuda?'}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}