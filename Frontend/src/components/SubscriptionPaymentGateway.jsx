// Archivo: src/components/SubscriptionPaymentGateway.jsx | Comentario: Pasarela de pago para suscripciones
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { confirmSubscription } from '../api/subscriptions'
import { getUserPaymentMethods } from '../api/payment'

const PAYMENT_CHOICES = [
  { id: 'card', label: 'Tarjeta', icon: '<i className="fas fa-credit-card mr-1"></i>', description: 'Crédito o débito' },
  { id: 'wallet', label: 'Nequi', icon: '🟣', description: 'Billetera digital' },
  { id: 'transfer', label: 'Bancolombia', icon: '🏦', description: 'Cuenta bancaria / transferencia' },
  { id: 'pse', label: 'PSE', icon: '🌐', description: 'Pago seguro por banco' },
]

const getSavedMethodMeta = (method) => {
  const type = String(method?.type || 'card')
  const provider = String(method?.provider || '').toLowerCase()

  if (type === 'wallet') {
    return { icon: '🟣', title: 'Nequi', description: method.wallet_phone ? `Cuenta ${method.wallet_phone}` : 'Billetera digital' }
  }

  if (type === 'transfer') {
    return { icon: '🏦', title: provider === 'bancolombia' ? 'Bancolombia' : 'Transferencia', description: method.wallet_phone ? `Cuenta ${method.wallet_phone}` : 'Cuenta bancaria' }
  }

  if (type === 'pse') {
    return { icon: '🌐', title: 'PSE', description: 'Pago por banco' }
  }

  return {
    icon: provider === 'mastercard' ? '🟠' : provider === 'amex' ? '🔷' : provider === 'diners' ? '<i className="fas fa-star mr-1"></i>' : '<i className="fas fa-credit-card mr-1"></i>',
    title: 'Tarjeta',
    description: `${provider.toUpperCase() || 'CARD'} •••• ${method.last_four || '0000'}`,
  }
}

export default function SubscriptionPaymentGateway({ subscription, onSuccess, onCancel }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [savedMethods, setSavedMethods] = useState([])
  const [savedMethodsLoading, setSavedMethodsLoading] = useState(true)
  const [error, setError] = useState(null)

  const planName = useMemo(() => subscription?.plan_name || subscription?.plan?.name || 'Premium Ahorro', [subscription])
  const planPrice = useMemo(() => subscription?.monthly_price || subscription?.plan?.monthly_price || 7900, [subscription])
  const selectedPaymentLabel = useMemo(() => {
    const selectedSavedMethod = savedMethods.find((method) => `saved-${method.id}` === paymentMethod)

    if (selectedSavedMethod) {
      const meta = getSavedMethodMeta(selectedSavedMethod)
      return `${meta.title} · ${meta.description}`
    }

    return PAYMENT_CHOICES.find((choice) => choice.id === paymentMethod)?.label || paymentMethod
  }, [paymentMethod, savedMethods])

  useEffect(() => {
    let mounted = true

    const loadMethods = async () => {
      try {
        const response = await getUserPaymentMethods()
        if (!mounted) return
        setSavedMethods(response?.data || [])
      } catch {
        if (!mounted) return
        setSavedMethods([])
      } finally {
        if (mounted) setSavedMethodsLoading(false)
      }
    }

    loadMethods()

    return () => {
      mounted = false
    }
  }, [])

  const stepItems = [
    { id: 1, label: 'Plan' },
    { id: 2, label: 'Pago' },
    { id: 3, label: 'Confirmación' },
  ]

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const paymentReference = `SUB-${subscription?.id}-${Date.now()}`

      const response = await confirmSubscription(subscription?.id, paymentReference)

      if (response?.data) {
        // Actualizar usuario en localStorage
        const user = localStorage.getItem('user')
        if (user) {
          const parsed = JSON.parse(user)
          parsed.is_premium = true
          localStorage.setItem('user', JSON.stringify(parsed))
          window.dispatchEvent(new Event('user-updated'))
        }

        onSuccess?.(response.data)
      }
    } catch (err) {
      console.error('Error confirmando suscripción:', err)
      setError(err.message || 'Error procesando el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="component-subscription-payment-gateway fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirmar Suscripción</h2>

        <div className="flex items-center gap-2 mb-6">
          {stepItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= item.id ? 'bg-[#FF4B3E] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {item.id}
              </div>
              <span className={`text-sm font-semibold ${step >= item.id ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</span>
              {item.id < 3 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Plan</span>
            <span className="font-semibold text-gray-900">{planName}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Precio mensual</span>
            <span className="font-semibold text-gray-900">${Number(planPrice).toLocaleString('es-CO')}</span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-gray-900 font-semibold">Total</span>
            <span className="text-2xl font-bold text-[#FF4B3E]">${Number(planPrice).toLocaleString('es-CO')}</span>
          </div>
          </div>
        )}

        {step === 2 && (
          <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Método de pago
          </label>
          <div className="grid gap-3">
            {PAYMENT_CHOICES.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-3 p-4 border-2 rounded-2xl text-left transition ${paymentMethod === method.id ? 'border-[#FF4B3E] bg-[#fff5f4]' : 'border-gray-200 bg-white hover:border-[#FF4B3E]/40'}`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF4B3E] to-[#ff8a65] text-white flex items-center justify-center shadow-sm">
                  <span className="text-xl">{method.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
                <span className={`w-4 h-4 rounded-full border-2 ${paymentMethod === method.id ? 'border-[#FF4B3E] bg-[#FF4B3E]' : 'border-gray-300 bg-white'}`} />
              </button>
            ))}

            {!savedMethodsLoading && savedMethods.length > 0 && (
              <div className="pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Guardados</p>
                <div className="space-y-2">
                  {savedMethods.map((method) => {
                    const savedId = `saved-${method.id}`
                    const meta = getSavedMethodMeta(method)
                    return (
                      <button
                        key={savedId}
                        type="button"
                        onClick={() => setPaymentMethod(savedId)}
                        className={`w-full flex items-center gap-3 p-4 border-2 rounded-2xl text-left transition ${paymentMethod === savedId ? 'border-[#FF4B3E] bg-[#fff5f4]' : 'border-gray-200 bg-white hover:border-[#FF4B3E]/40'}`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF4B3E] to-[#ff8a65] text-white flex items-center justify-center shadow-sm">
                          <span className="text-xl">{meta.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{method.label || method.holder_name || meta.title}</p>
                          <p className="text-xs text-gray-500">{meta.description}</p>
                        </div>
                        <span className={`w-4 h-4 rounded-full border-2 ${paymentMethod === savedId ? 'border-[#FF4B3E] bg-[#FF4B3E]' : 'border-gray-300 bg-white'}`} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Plan</span>
              <span className="font-semibold text-gray-900">{planName}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Método</span>
              <span className="font-semibold text-gray-900">{selectedPaymentLabel}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-gray-900 font-semibold">Total</span>
              <span className="text-2xl font-bold text-[#FF4B3E]">${Number(planPrice).toLocaleString('es-CO')}</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-bold bg-[#FF4B3E] text-white hover:bg-[#e03a2d] transition disabled:opacity-50"
            >
              Continuar
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-bold border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-bold border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-bold bg-[#FF4B3E] text-white hover:bg-[#e03a2d] transition disabled:opacity-50"
            >
              Revisar compra
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-bold border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Volver
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-bold bg-[#FF4B3E] text-white hover:bg-[#e03a2d] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Procesando...
                </>
              ) : (
                <>
                  <i className="fas fa-lock"></i>
                  Confirmar pago
                </>
              )}
            </button>
          </div>
        )}
        <div className="mb-6 flex items-start gap-2 mt-6">
          <input type="checkbox" id="terms" defaultChecked className="w-4 h-4 mt-1" />
          <label htmlFor="terms" className="text-xs text-gray-600">
            Acepto los términos de servicio y autorizo el cobro mensual recurrente de $7.900.
            Podré cancelar en cualquier momento.
          </label>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Tu pago es 100% seguro con cifrado SSL
        </p>
      </div>
    </div>
  )
}
