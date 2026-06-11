// Archivo: src/pages/Subscription.jsx | Comentario: logica principal del modulo.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { createSubscription, getCurrentSubscription, getSubscriptionPlans } from '../api/subscriptions'
import SubscriptionPaymentGateway from '../components/SubscriptionPaymentGateway'

export default function SubscriptionPage({ user, isAuth }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [error, setError] = useState(null)
  const [subscribingPlanId, setSubscribingPlanId] = useState(null)
  const [pendingSubscription, setPendingSubscription] = useState(null)
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()

  const isPremium = Boolean(user?.is_premium || storedUser?.is_premium || currentSubscription?.is_premium)

  const formatPrice = (value) => Number(value || 0).toLocaleString('es-CO')

  const visiblePlans = [
    {
      id: 'free',
      name: 'Plan Gratis',
      price: '$0',
      period: '/siempre',
      description: 'Seguir comprando sin pagar membresía. Perfecto si estás ajustando gastos.',
      features: [
        'Acceso a restaurantes y promociones normales',
        'Sin costo fijo mensual',
        'Ideal para presupuestos ajustados',
        'Pagas solo lo que pides',
      ],
      cta: 'Seguir gratis',
      popular: false,
      isSelected: !isPremium,
    },
    {
      id: 'premium',
      name: 'Premium Ahorro',
      price: '$7.900',
      period: '/mes',
      description: 'Gasta menos en cada pedido y encuentra ofertas pensadas para cuidar tu bolsillo.',
      features: [
        'Descuentos exclusivos en comidas seleccionadas',
        'Beneficios que suelen costar menos que un domicilio',
        'Prioridad en promociones de bajo costo',
        'Ahorra más si pides varias veces al mes',
        'Ideal para comer bien sin gastar de más',
      ],
      cta: 'Comprar Premium',
      popular: true,
      isSelected: isPremium,
    },
  ]

  const FAQS = [
    { q: t('subscription.faq_1_q'), a: t('subscription.faq_1_a') },
    { q: t('subscription.faq_2_q'), a: t('subscription.faq_2_a') },
    { q: t('subscription.faq_3_q'), a: t('subscription.faq_3_a') },
    { q: t('subscription.faq_4_q'), a: t('subscription.faq_4_a') },
  ]

  useEffect(() => {
    let mounted = true

    const loadSubscriptionData = async () => {
      setLoading(true)
      setError(null)

      try {
        const plansResponse = await getSubscriptionPlans()
        if (!mounted) return

        setPlans(plansResponse?.data ?? plansResponse ?? [])

        if (isAuth) {
          try {
            const subscriptionResponse = await getCurrentSubscription()
            if (!mounted) return
            setCurrentSubscription(subscriptionResponse?.data?.current ?? subscriptionResponse?.data ?? null)
          } catch {
            if (mounted) setCurrentSubscription(null)
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || t('subscription.error'))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadSubscriptionData()

    return () => { mounted = false }
  }, [isAuth, t])

  const handleSubscribe = async (planId) => {
    if (!isAuth) { navigate('/login'); return }

    if (planId === 'free') return

    setSubscribingPlanId(planId)
    setError(null)
    try {
      const response = await createSubscription(planId)
      const newSubscription = response?.data ?? response
      setPendingSubscription(newSubscription)
      setShowPaymentGateway(true)
    } catch (err) {
      setError(err.message || t('subscription.error'))
    } finally {
      setSubscribingPlanId(null)
    }
  }

  const handlePaymentSuccess = (data) => {
    setCurrentSubscription(data)
    setShowPaymentGateway(false)
    setPendingSubscription(null)

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        const updatedUser = {
          ...parsedUser,
          is_premium: true,
          subscription: data,
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        window.dispatchEvent(new Event('user-updated'))
      } catch {
        // Si el usuario guardado no se puede parsear, seguimos sin bloquear la compra.
      }
    }

    setTimeout(() => {
      navigate('/user/profile?tab=subscription')
    }, 1500)
  }

  const handlePaymentCancel = () => {
    setShowPaymentGateway(false)
    setPendingSubscription(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="page-subscription min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 py-12 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('subscription.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {currentSubscription?.plan && (
          <div className="mb-8 max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-green-200 dark:border-green-900/30 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Plan actual</p>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Premium Ahorro</h3>
                <p className="text-gray-600 dark:text-slate-400 mt-1">
                  {isPremium ? 'Activo' : 'Inactivo'} · pensado para pedir más por menos
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-slate-400">Cobro mensual</p>
                <p className="text-2xl font-bold text-[#FF4B3E]">$7.900</p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">
          {visiblePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl transition transform hover:scale-105 ${
                plan.popular 
                  ? 'ring-2 ring-[#FF4B3E] shadow-2xl bg-white dark:bg-slate-900' 
                  : 'bg-white dark:bg-slate-900 shadow-lg border border-transparent dark:border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#FF4B3E] text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    Más ahorro por mes
                  </span>
                </div>
              )}

              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h2>
                <p className="text-gray-600 dark:text-slate-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                    <span className="text-lg text-gray-600 dark:text-slate-400 font-normal ml-2">{plan.period}</span>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-gray-700 dark:text-slate-300">
                      <span className="text-[#FF4B3E] font-bold">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.isSelected || subscribingPlanId === plan.id}
                  className={`w-full py-3 rounded-lg font-bold transition ${
                    plan.popular
                      ? 'bg-[#FF4B3E] text-white hover:bg-[#e03a2d]'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700'
                  } ${(plan.isSelected || subscribingPlanId === plan.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {subscribingPlanId === plan.id ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>{t('subscription.processing')}</>
                  ) : plan.isSelected ? (
                    'Plan actual'
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('subscription.faq_title')}
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow border border-transparent dark:border-slate-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{faq.q}</h3>
                <p className="text-gray-600 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-[#FF4B3E] rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ahorra sin dejar de comer rico</h2>
          <p className="text-lg mb-6 opacity-90">El plan Premium está pensado para quien quiere pedir comida sin que el presupuesto se dispare.</p>
          <button
            onClick={() => handleSubscribe('premium')}
            className="bg-white text-[#FF4B3E] font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Comprar Premium
          </button>
        </div>
      </div>

      {showPaymentGateway && pendingSubscription && (
        <SubscriptionPaymentGateway
          subscription={pendingSubscription}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  )
}