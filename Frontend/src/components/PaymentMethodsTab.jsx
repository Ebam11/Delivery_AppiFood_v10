// Archivo: src/components/PaymentMethodsTab.jsx | Comentario: logica principal del modulo.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getUserPaymentMethods,
  createUserPaymentMethod,
  updateUserPaymentMethod,
  deleteUserPaymentMethod,
} from '../api/payment'

export default function PaymentMethodsTab() {
  const { t } = useTranslation()
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'card',
    provider: 'visa',
    label: '',
    holder_name: '',
    card_number: '',
    exp_month: '',
    exp_year: '',
    wallet_phone: '',
    cvv: '',
    is_default: false,
  })

  const methodTypes = [
    { value: 'card', label: 'Tarjeta', icon: '💳', hint: 'Crédito o débito en una sola opción' },
    { value: 'wallet', label: 'Nequi', icon: '🟣', hint: 'Billetera digital' },
    { value: 'transfer', label: 'Bancolombia', icon: '🏦', hint: 'Transferencia / cuenta bancaria' },
    { value: 'pse', label: 'PSE', icon: '🌐', hint: 'Pago por banco en línea' },
  ]

  const providerOptions = {
    card: [
      { value: 'visa', label: 'Visa', icon: '💙' },
      { value: 'mastercard', label: 'Mastercard', icon: '🟠' },
      { value: 'amex', label: 'American Express', icon: '🔷' },
      { value: 'diners', label: 'Diners', icon: '⭐' },
    ],
    wallet: [
      { value: 'nequi', label: 'Nequi', icon: '🟣' },
      { value: 'daviplata', label: 'Daviplata', icon: '💜' },
      { value: 'paypal', label: 'PayPal', icon: '🅿️' },
    ],
    transfer: [
      { value: 'bancolombia', label: 'Bancolombia', icon: '🟡' },
      { value: 'davivienda', label: 'Davivienda', icon: '🔴' },
      { value: 'bbva', label: 'BBVA', icon: '🔵' },
    ],
    pse: [
      { value: 'pse', label: 'PSE', icon: '🌐' },
    ],
  }

  const getMethodMeta = (method) => {
    const type = String(method?.type || 'card')
    const provider = String(method?.provider || '').toLowerCase()

    if (type === 'wallet') {
      return { icon: '🟣', title: 'Nequi', description: method.wallet_phone ? `Cuenta ${method.wallet_phone}` : 'Billetera digital' }
    }

    if (type === 'transfer') {
      return { icon: '🏦', title: provider === 'bancolombia' ? 'Bancolombia' : 'Transferencia', description: method.wallet_phone ? `Cuenta ${method.wallet_phone}` : 'Cuenta bancaria' }
    }

    if (type === 'pse') {
      return { icon: '🌐', title: 'PSE', description: 'Pago seguro por banco' }
    }

    return {
      icon: provider === 'mastercard' ? '🟠' : provider === 'amex' ? '🔷' : provider === 'diners' ? '⭐' : '💳',
      title: method.label || method.holder_name || 'Tarjeta',
      description: `${provider.toUpperCase() || 'CARD'} •••• ${method.last_four || '0000'}`,
    }
  }

  // Cargar métodos de pago al montar
  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    setLoading(true)
    try {
      const response = await getUserPaymentMethods()
      setMethods(response?.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching payment methods:', err)
      setError(t('paymentMethodsTab.errorFetch', { defaultValue: 'Error al cargar los métodos de pago' }))
      setMethods([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      ...formData,
      card_number: formData.type === 'card' ? formData.card_number : undefined,
      exp_month: formData.type === 'card' ? formData.exp_month : undefined,
      exp_year: formData.type === 'card' ? formData.exp_year : undefined,
      cvv: formData.type === 'card' ? formData.cvv : undefined,
      wallet_phone: formData.type === 'wallet' ? formData.wallet_phone : undefined,
    }

    try {
      if (editingId) {
        await updateUserPaymentMethod(editingId, payload)
        setSuccess(t('paymentMethodsTab.successUpdate', { defaultValue: 'Método de pago actualizado' }))
      } else {
        await createUserPaymentMethod(payload)
        setSuccess(t('paymentMethodsTab.successCreate', { defaultValue: 'Método de pago agregado' }))
      }
      await fetchPaymentMethods()
      resetForm()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || t('paymentMethodsTab.errorSubmit', { defaultValue: 'Error al guardar' }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('paymentMethodsTab.confirmDelete', { defaultValue: '¿Estás seguro?' }))) return

    try {
      await deleteUserPaymentMethod(id)
      setSuccess(t('paymentMethodsTab.successDelete', { defaultValue: 'Método de pago eliminado' }))
      await fetchPaymentMethods()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || t('paymentMethodsTab.errorDelete', { defaultValue: 'Error al eliminar' }))
    }
  }

  const handleEdit = (method) => {
    setFormData({
      type: method.type || 'card',
      provider: method.provider || 'visa',
      label: method.label || '',
      holder_name: method.holder_name || '',
      card_number: '',
      exp_month: method.exp_month || '',
      exp_year: method.exp_year || '',
      wallet_phone: method.wallet_phone || '',
      cvv: '',
      is_default: method.is_default || false,
    })
    setEditingId(method.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      type: 'card',
      provider: 'visa',
      label: '',
      holder_name: '',
      card_number: '',
      exp_month: '',
      exp_year: '',
      wallet_phone: '',
      cvv: '',
      is_default: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const maskCardNumber = (value) => {
    return value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim()
  }

  if (loading) {
    return (
      <div className="component-payment-methods-tab flex justify-center py-8">
        <div className="animate-spin">⏳</div>
      </div>
    )
  }

  return (
    <div className="component-payment-methods-tab max-w-2xl">
      {/* Mensajes */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* Botón para agregar nuevo método */}
      <div className="mb-6">
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="px-4 py-2 bg-[#FF4B3E] text-white rounded-lg hover:bg-[#e03a2d] transition font-bold shadow-sm"
        >
          {showForm ? t('paymentMethodsTab.cancel', { defaultValue: '✕ Cancelar' }) : t('paymentMethodsTab.add_method', { defaultValue: '+ Agregar Método de Pago' })}
        </button>
      </div>

      {/* Formulario para agregar/editar */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-lg mb-4">
            {editingId ? t('paymentMethodsTab.edit_method', { defaultValue: 'Editar Método de Pago' }) : t('paymentMethodsTab.new_method', { defaultValue: 'Nuevo Método de Pago' })}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('paymentMethodsTab.method_type', { defaultValue: 'Tipo de método' })}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {methodTypes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: option.value, provider: providerOptions[option.value]?.[0]?.value || prev.provider }))}
                    className={`text-left p-4 rounded-xl border-2 transition ${formData.type === option.value ? 'border-[#FF4B3E] bg-[#fff5f4]' : 'border-gray-200 bg-white hover:border-[#FF4B3E]/40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.hint}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('paymentMethodsTab.label_name', { defaultValue: 'Etiqueta' })}
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="Método principal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('paymentMethodsTab.provider', { defaultValue: 'Proveedor / banco' })}
                </label>
                <select
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
                >
                  {(providerOptions[formData.type] || providerOptions.card).map((option) => (
                    <option key={option.value} value={option.value}>{option.icon} {option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('paymentMethodsTab.holder_name', { defaultValue: 'Nombre del Titular *' })}
              </label>
              <input
                type="text"
                name="holder_name"
                value={formData.holder_name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
              />
            </div>

            {formData.type === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('paymentMethodsTab.card_number', { defaultValue: 'Número de Tarjeta' })} {editingId && t('paymentMethodsTab.last_4', { defaultValue: '(últimos 4 dígitos)' })} *
                  </label>
                  <input
                    type="text"
                    name="card_number"
                    value={maskCardNumber(formData.card_number)}
                    onChange={(e) => setFormData(prev => ({ ...prev, card_number: e.target.value.replace(/\s/g, '') }))}
                    placeholder="1234 5678 9101 1121"
                    required={!editingId}
                    maxLength={19}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('paymentMethodsTab.month', { defaultValue: 'Mes *' })}
                    </label>
                    <input
                      type="number"
                      name="exp_month"
                      value={formData.exp_month}
                      onChange={handleChange}
                      placeholder="01"
                      min="1"
                      max="12"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('paymentMethodsTab.year', { defaultValue: 'Año *' })}
                    </label>
                    <input
                      type="number"
                      name="exp_year"
                      value={formData.exp_year}
                      onChange={handleChange}
                      placeholder="2025"
                      min={new Date().getFullYear()}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CVV {editingId && t('paymentMethodsTab.new_cvv', { defaultValue: '(nuevo)' })}
                    </label>
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.type === 'wallet' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('paymentMethodsTab.phone_account', { defaultValue: 'Número de teléfono / cuenta' })}
                </label>
                <input
                  type="text"
                  name="wallet_phone"
                  value={formData.wallet_phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B3E]"
                />
              </div>
            )}

            {formData.type === 'transfer' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                {t('paymentMethodsTab.transfer_hint', { defaultValue: 'La transferencia quedará registrada como método guardado para usar en compras futuras.' })}
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
                className="w-4 h-4 text-[#FF4B3E] rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {t('paymentMethodsTab.set_default', { defaultValue: 'Usar como método de pago predeterminado' })}
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-[#FF4B3E] text-white rounded-lg hover:bg-[#e03a2d] transition font-bold disabled:opacity-50"
            >
              {submitting ? t('paymentMethodsTab.saving', { defaultValue: 'Guardando...' }) : t('paymentMethodsTab.save_method', { defaultValue: 'Guardar Método de Pago' })}
            </button>
          </form>
        </div>
      )}

      {/* Lista de métodos de pago */}
      <div>
        <h3 className="font-bold text-lg mb-4">
          {t('paymentMethodsTab.my_methods', { defaultValue: 'Mis Métodos de Pago' })} {methods.length > 0 && `(${methods.length})`}
        </h3>

        {methods.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
            <p>{t('paymentMethodsTab.no_methods', { defaultValue: 'No tienes métodos de pago registrados' })}</p>
            <p className="text-sm mt-2">{t('paymentMethodsTab.add_one', { defaultValue: 'Agrega uno para comprar más rápido' })}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map(method => (
              <div
                key={method.id}
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF4B3E] to-[#ff8a65] text-white flex items-center justify-center shadow-sm">
                        <span className="text-lg">{getMethodMeta(method).icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {getMethodMeta(method).title}
                          {method.is_default && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                              {t('paymentMethodsTab.default', { defaultValue: 'Predeterminado' })}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getMethodMeta(method).description}
                        </p>
                        {method.type === 'card' && (
                          <p className="text-xs text-gray-500">
                            {t('paymentMethodsTab.expires', { defaultValue: 'Vence:' })} {method.exp_month}/{method.exp_year}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(method)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                    >
                      {t('paymentMethodsTab.edit', { defaultValue: 'Editar' })}
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      {t('paymentMethodsTab.delete', { defaultValue: 'Eliminar' })}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
