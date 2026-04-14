import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { ApiError, fetchJson } from '../api/fetchJson'

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
    if (errors[name]) {
      setErrors(er => ({ ...er, [name]: null }))
    }
  }

  const submit = async e => {
    e.preventDefault()

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Las contraseñas no coinciden.' })
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.owner_name,
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
      console.log('respuesta completa del backend', JSON.stringify(data)) //linea provisional, problema de registro de restaurante con login de usuario

      localStorage.setItem('token', data.token)
      console.log('data.user:', data.user)
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
        setErrors({ email: 'Error de conexión. Intenta de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 relative flex items-center" style={{ minHeight: '100vh' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg,rgba(0,0,0,0.6),rgba(20,20,20,0.55)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop) center/cover no-repeat',
          }}
        />
        //apartado para boton de inicio de sesion y logo
        <div className="fixed top-0 left-0 right-0 h-[68px] bg-white shadow-md flex items-center justify-center px-8 z-50">
          <Link to="/" className="font-['Satisfy'] text-3xl text-[#FF4B3E]">AppiFood</Link>
          <Link
            to="/restaurant/login"
            className="absolute right-8 px-4 py-2 rounded-full border-2 border-[#FF4B3E] text-[#FF4B3E] font-bold text-xs hover:bg-red-50 transition"
          >
            Iniciar sesión
          </Link>
        </div>

        <div className="relative z-10 w-full max-w-[1300px] mx-auto px-[10%] py-24 flex items-center justify-between gap-10 flex-wrap min-h-screen">
          <div className="text-white max-w-md hidden md:block">
            <h1 className="text-5xl font-black leading-tight mb-4">Registra tu restaurante</h1>
            <p className="text-xl font-semibold opacity-90 leading-relaxed">
              Crea tu acceso como restaurante para empezar a vender en AppiFood.
            </p>
          </div>

          <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-7">
              <div className="text-center mb-5">
                <span className="font-['Satisfy'] text-3xl text-[#FF4B3E]">AppiFood</span>
                <p className="text-[#FF4B3E] font-bold text-lg mt-1">Registro de restaurante</p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <Field
                  label="Nombre del responsable"
                  name="owner_name"
                  placeholder="Ej: Camilo Acosta"
                  errors={errors}
                  form={form}
                  onChange={change}
                />

                <Field
                  label="Nombre del restaurante"
                  name="restaurant_name"
                  placeholder="Ej: Sabor del Valle"
                  errors={errors}
                  form={form}
                  onChange={change}
                />

                <Field
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  placeholder="restaurante@email.com"
                  errors={errors}
                  form={form}
                  onChange={change}
                />

                <Field
                  label="Teléfono"
                  name="phone"
                  placeholder="3001234567"
                  errors={errors}
                  form={form}
                  onChange={change}
                  required={false}
                />

                <Field
                  label="Número de documento"
                  name="id_number"
                  placeholder="123456789"
                  errors={errors}
                  form={form}
                  onChange={change}
                  required={false}
                />

                <Field
                  label="Contraseña"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  errors={errors}
                  form={form}
                  onChange={change}
                  show={showPass}
                  toggleShow={() => setShowPass(s => !s)}
                />

                <Field
                  label="Confirmar contraseña"
                  name="password_confirmation"
                  placeholder="Repite tu contraseña"
                  errors={errors}
                  form={form}
                  onChange={change}
                  show={showConf}
                  toggleShow={() => setShowConf(s => !s)}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF4B3E] text-white rounded-xl font-bold hover:bg-[#e03a2d] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Creando cuenta...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-store"></i> Registrar mi restaurante
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Esta vista solo crea cuentas con rol restaurante.
                </p>

                <p className="text-center text-sm text-gray-500">
                  ¿Quieres registro normal?{' '}
                  <Link to="/register" className="text-[#FF4B3E] font-bold hover:underline">Ir a registro de usuario</Link>
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