// Archivo: src/pages/Register.jsx | Comentario: logica principal del modulo.
// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { ApiError, fetchJson } from '../api/fetchJson'

// Campo reutilizable - DEFINIDO FUERA para evitar re-renders
const Field = ({ label, name, type='text', placeholder, show, toggleShow, errors, form, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input type={show !== undefined ? (show ? 'text' : 'password') : type}
        name={name} value={form[name]} onChange={onChange}
        placeholder={placeholder} required
        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition pr-${toggleShow ? '11' : '4'}
          ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#FF4B3E]'}
          focus:ring-2 focus:ring-[#FF4B3E]/20`} />
      {toggleShow && (
        <button type="button" onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4B3E] transition">
          <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
      )}
    </div>
    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
  </div>
)

export default function RegisterPage() {
  const [form, setForm]        = useState({ name:'', email:'', password:'', password_confirmation:'', id_type:'cc', id_number:'' })
  const [errors, setErrors]    = useState({})
  const [showPass, setShowPass]  = useState(false)
  const [showConf, setShowConf]  = useState(false)
  const [loading, setLoading]    = useState(false)
  const navigate = useNavigate()

  const change = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    // Solo limpia el error para este campo cuando el usuario empiece a corregirlo
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
      await fetchJson('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      navigate('/login', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const errs = {}
        if (error.data?.errors) Object.entries(error.data.errors).forEach(([k, v]) => { errs[k] = v[0] })
        else errs.email = error.message
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
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.55),rgba(20,20,20,0.55)), url(https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1600&h=900&fit=crop) center/cover no-repeat' }} />

        {/* Barra superior - Sticky */}
        <div className="fixed top-0 left-0 right-0 h-[68px] bg-white shadow-md flex items-center justify-center z-50">
          <Link to="/" className="font-['Satisfy'] text-3xl text-[#FF4B3E]">AppiFood</Link>
        </div>

        <div className="relative z-10 w-full max-w-[1300px] mx-auto px-[10%] pt-16 pb-12 flex items-center justify-between gap-10 flex-wrap">
          {/* Texto izquierdo */}
          <div className="text-white max-w-md hidden md:block">
            <h1 className="text-5xl font-black leading-tight mb-4">Únete a AppiFood</h1>
            <p className="text-xl font-semibold opacity-90 leading-relaxed">
              Crea tu cuenta gratis y empieza a pedir tu comida favorita en minutos.
            </p>
          </div>

          {/* Card */}
          <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-7">
              <div className="text-center mb-5">
                <span className="font-['Satisfy'] text-3xl text-[#FF4B3E]">AppiFood</span>
                <p className="text-[#FF4B3E] font-bold text-lg mt-1">Crear cuenta</p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <Field label="Nombre completo" name="name" placeholder="Tu nombre" errors={errors} form={form} onChange={change} />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
                    <select name="id_type" value={form.id_type} onChange={change}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition border-gray-300 focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/20">
                      <option value="cc">Cédula</option>
                      <option value="ti">Tarjeta de Identidad</option>
                      <option value="ce">Cédula de Extranjería</option>
                      <option value="pp">Pasaporte</option>
                    </select>
                  </div>
                  <Field label="Número de documento" name="id_number" placeholder="123456789" errors={errors} form={form} onChange={change} />
                </div>
                
                <Field label="Correo electrónico" name="email" type="email" placeholder="tucorreo@email.com" errors={errors} form={form} onChange={change} />
                <Field label="Contraseña" name="password" placeholder="Mínimo 8 caracteres" errors={errors} form={form} onChange={change}
                  show={showPass} toggleShow={() => setShowPass(s => !s)} />
                <Field label="Confirmar contraseña" name="password_confirmation" placeholder="Repite tu contraseña" errors={errors} form={form} onChange={change}
                  show={showConf} toggleShow={() => setShowConf(s => !s)} />

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#FF4B3E] text-white rounded-xl font-bold hover:bg-[#e03a2d] transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Creando cuenta...</> : <><i className="fas fa-user-plus"></i> Crear cuenta gratis</>}
                </button>

                <p className="text-center text-xs text-gray-500">
                  El rol de administrador lo asigna un super admin desde el panel interno.
                </p>

                <p className="text-center text-sm text-gray-500">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-[#FF4B3E] font-bold hover:underline">Inicia sesión</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
