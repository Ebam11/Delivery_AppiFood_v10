// Archivo: src/pages/RestaurantLogin.jsx | Comentario: logica principal del modulo.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import Footer from '../components/Footer'
import { ApiError, fetchJson } from '../api/fetchJson'

const Field = ({ label, name, type = 'text', placeholder, show, toggleShow, errors, form, onChange }) => (
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
        <input
        type={show !== undefined ? (show ? 'text' : 'password') : type}
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        required
        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition
            ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#FF4B3E]'}
            focus:ring-2 focus:ring-[#FF4B3E]/20 ${toggleShow ? 'pr-11' : 'pr-4'}`}
        />
        {toggleShow && (
        <button
            type="button"
            onClick={toggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4B3E] transition"
        >
            <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
        )}
    </div>
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
)

export default function RestaurantLogin({ onLogin }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const change = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: null }))
    }

    const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
        const data = await fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
        })

        const token = data.data?.access_token || data.token
        const user = data.data?.user || data.user
        localStorage.setItem('token', token)
        onLogin?.(user)
        navigate('/restaurant/dashboard')
    } catch (error) {
        if (error instanceof ApiError) {
        setErrors({ email: error.message })
        } else {
        setErrors({ email: t('restaurant_login.connection_error') })
        }
    } finally {
        setLoading(false)
    }
    }

  return (
    <div className="page-restaurant-login min-h-screen flex flex-col">
      <div className="flex-1 relative flex items-center" style={{ minHeight: '100vh' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg,rgba(0,0,0,0.6),rgba(20,20,20,0.55)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop) center/cover no-repeat',
          }}
        />

        <header className="fixed top-0 left-0 right-0 h-[68px] bg-white shadow-md flex items-center justify-center z-50">
          <Link to="/" className="font-['Satisfy'] text-3xl text-[#FF4B3E]">AppiFood</Link>
        </header>

        <div className="relative z-10 w-full max-w-[1300px] mx-auto px-[10%] pt-16 pb-12 flex items-center justify-between gap-10 flex-wrap">
          <div className="text-white max-w-md hidden md:block">
            <h1 className="text-5xl font-black leading-tight mb-4">{t('restaurant_login.title')}</h1>
            <p className="text-xl font-semibold opacity-90 leading-relaxed">
              {t('restaurant_login.subtitle')}
            </p>
          </div>

          <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-7">
              <div className="text-center mb-5">
                <p className="text-[#FF4B3E] font-bold text-lg mt-1">{t('restaurant_login.login_title')}</p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <Field
                  label={t('restaurant_login.field_email')}
                  name="email"
                  type="email"
                  placeholder={t('restaurant_login.field_email_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                />

                <Field
                  label={t('restaurant_login.field_password')}
                  name="password"
                  placeholder={t('restaurant_login.field_password_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                  show={showPass}
                  toggleShow={() => setShowPass(s => !s)}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF4B3E] text-white rounded-xl font-bold hover:bg-[#e03a2d] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> {t('restaurant_login.login_loading')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i> {t('restaurant_login.login_button')}
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  {t('restaurant_login.no_account')}{' '}
                  <Link to="/register-restaurant" className="text-[#FF4B3E] font-bold hover:underline">
                    {t('restaurant_login.register_link')}
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