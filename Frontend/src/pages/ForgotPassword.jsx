import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import { resetPassword, sendPasswordResetLink } from '../api/auth'

export default function ForgotPassword() {
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
        setMessage('Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        await sendPasswordResetLink(form.email)
        setMessage('Te enviamos un correo con el enlace para restablecer tu contraseña.')
      }
    } catch (requestError) {
      const responseMessage = requestError?.response?.data?.message || 'No se pudo procesar la solicitud. Intenta nuevamente.'
      setError(responseMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f6]">
      <div className="flex-1 relative flex items-center justify-center px-4 py-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,75,62,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,122,89,0.16),_transparent_32%),linear-gradient(135deg,#fff8f6_0%,#fffdfc_55%,#fff4f1_100%)]" />
        <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div className="text-gray-900 hidden lg:block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-[#FF4B3E] font-bold text-sm shadow-sm">
              <i className="fas fa-key" /> Recuperación segura
            </span>
            <h1 className="mt-6 text-5xl font-black leading-tight">
              Recupera el acceso a tu cuenta en minutos.
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl">
              Te guiamos para solicitar el enlace de restablecimiento o para crear una contraseña nueva si ya recibiste el token.
            </p>
          </div>

          <div className="w-full max-w-[520px] mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-7 sm:p-8">
              <div className="text-center mb-6">
                <Link to="/" className="font-['Satisfy'] text-4xl text-[#FF4B3E]">AppiFood</Link>
                <h2 className="mt-3 text-2xl font-black text-gray-900">
                  {isResetMode ? 'Crear nueva contraseña' : '¿Olvidaste tu contraseña?'}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {isResetMode
                    ? 'Escribe la nueva clave que usarás para entrar a tu cuenta.'
                    : 'Ingresa tu correo y te enviaremos un enlace de recuperación.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={Boolean(emailFromQuery)}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/15 transition disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="tucorreo@email.com"
                  />
                </div>

                {isResetMode && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva contraseña</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength="8"
                        className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/15 transition"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar contraseña</label>
                      <input
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        required
                        minLength="8"
                        className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/15 transition"
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl py-3.5 bg-[#FF4B3E] text-white font-black hover:bg-[#e03a2d] transition disabled:opacity-60"
                >
                  {loading ? 'Procesando...' : isResetMode ? 'Restablecer contraseña' : 'Enviar enlace de recuperación'}
                </button>

                <div className="flex flex-col sm:flex-row gap-3 text-sm text-center justify-between">
                  <Link to="/login" className="text-[#FF4B3E] font-semibold hover:underline">
                    Volver a iniciar sesión
                  </Link>
                  <Link to="/support" className="text-gray-600 hover:text-[#FF4B3E]">
                    ¿Necesitas ayuda?
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
