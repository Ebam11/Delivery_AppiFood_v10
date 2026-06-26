// Archivo: src/pages/RegisterRestaurant.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Footer from '../components/Footer'
import { ApiError, fetchJson } from '../api/fetchJson'
import { isValidName } from '../utils/validation'

const Field = ({ label, name, type = 'text', placeholder, show, toggleShow, errors, form, onChange, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={show !== undefined ? (show ? 'text' : 'password') : type}
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition pr-${toggleShow ? '11' : '4'}
          ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#FF4B3E]'}
          focus:ring-2 focus:ring-[#FF4B3E]/20`}
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

export default function RegisterRestaurant({ onLogin }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    owner_name: '',
    restaurant_name: '',
    email: '',
    phone: '',
    id_number: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const change = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    
    let currentError = null
    if (name === 'owner_name' && value && !isValidName(value)) {
      currentError = t('validation.name_special_chars')
    }

    setErrors(er => ({ ...er, [name]: currentError }))
  }

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

  const pwdInfo = getPasswordStrength(form.password)

  const submit = async e => {
    e.preventDefault()

    const newErrors = {}
    if (!isValidName(form.owner_name)) {
      newErrors.owner_name = t('validation.name_special_chars')
    }
    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = t('register_restaurant.password_mismatch')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.owner_name,
        restaurant_name: form.restaurant_name,
        email: form.email,
        phone: form.phone,
        id_number: form.id_number,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: 'restaurant',
      }

      const data = await fetchJson('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin?.(data.user)
      navigate('/restaurant/dashboard')

    } catch (error) {
      if (error instanceof ApiError) {
        const errs = {}
        if (error.data?.errors) {
          Object.entries(error.data.errors).forEach(([k, v]) => {
            errs[k] = v[0]
          })
        } else {
          errs.email = error.message
        }
        setErrors(errs)
      } else {
        setErrors({ email: t('register_restaurant.connection_error') })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-register-restaurant min-h-screen flex flex-col">
      <div className="flex-1 relative flex items-center" style={{ minHeight: '100vh' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg,rgba(0,0,0,0.6),rgba(20,20,20,0.55)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop) center/cover no-repeat',
          }}
        />
        <header className="fixed top-0 left-0 right-0 h-[68px] bg-white shadow-md flex items-center justify-center px-8 z-50">
          <Link to="/" className="font-['Satisfy'] text-3xl text-[#FF4B3E]">AppiFood</Link>
          <Link
            to="/restaurant/login"
            className="absolute right-8 px-4 py-2 rounded-full border-2 border-[#FF4B3E] text-[#FF4B3E] font-bold text-xs hover:bg-red-50 transition"
          >
            {t('register_restaurant.login_button')}
          </Link>
        </header>

        <div className="relative z-10 w-full max-w-[1300px] mx-auto px-[10%] py-24 flex items-center justify-between gap-10 flex-wrap min-h-screen">
          <div className="text-white max-w-md hidden md:block">
            <h1 className="text-5xl font-black leading-tight mb-4">{t('register_restaurant.title')}</h1>
            <p className="text-xl font-semibold opacity-90 leading-relaxed">
              {t('register_restaurant.subtitle')}
            </p>
          </div>

          <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-7">
              <div className="text-center mb-5">
                <p className="text-[#FF4B3E] font-bold text-lg mt-1">{t('register_restaurant.register_title')}</p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <Field
                  label={t('register_restaurant.field_owner_name')}
                  name="owner_name"
                  placeholder={t('register_restaurant.field_owner_name_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                />

                <Field
                  label={t('register_restaurant.field_restaurant_name')}
                  name="restaurant_name"
                  placeholder={t('register_restaurant.field_restaurant_name_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                />

                <Field
                  label={t('register_restaurant.field_email')}
                  name="email"
                  type="email"
                  placeholder={t('register_restaurant.field_email_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                />

                <Field
                  label={t('register_restaurant.field_phone')}
                  name="phone"
                  placeholder={t('register_restaurant.field_phone_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                  required={false}
                />

                <Field
                  label={t('register_restaurant.field_id_number')}
                  name="id_number"
                  placeholder={t('register_restaurant.field_id_number_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                  required={false}
                />

                <Field
                  label={t('register_restaurant.field_password')}
                  name="password"
                  placeholder={t('register_restaurant.field_password_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                  show={showPass}
                  toggleShow={() => setShowPass(s => !s)}
                />

                 <Field
                  label={t('register_restaurant.field_confirm_password')}
                  name="password_confirmation"
                  placeholder={t('register_restaurant.field_confirm_password_placeholder')}
                  errors={errors}
                  form={form}
                  onChange={change}
                  show={showConf}
                  toggleShow={() => setShowConf(s => !s)}
                />

                {form.password && (
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3 animate-fade-in mt-2 mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        {form.password.length >= 8 ? (
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
                        <span className="text-slate-400">{t('register.strength') || 'Seguridad:'}</span>
                        <span className={`px-2.5 py-1 rounded-full text-white ${pwdInfo.color}`}>
                          {pwdInfo.text}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${pwdInfo.color}`} 
                          style={{ width: `${form.password.length >= 8 ? (pwdInfo.score + 1) * 33.3 : 15}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF4B3E] text-white rounded-xl font-bold hover:bg-[#e03a2d] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> {t('register_restaurant.creating_account')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-store"></i> {t('register_restaurant.register_button')}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  {t('register_restaurant.info_text')}
                </p>

                <p className="text-center text-sm text-gray-500">
                  {t('register_restaurant.normal_register_text')}{' '}
                  <Link to="/register" className="text-[#FF4B3E] font-bold hover:underline">
                    {t('register_restaurant.normal_register_link')}
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