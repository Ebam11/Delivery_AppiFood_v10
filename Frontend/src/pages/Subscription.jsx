// Archivo: src/pages/Subscription.jsx | Comentario: logica principal del modulo.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchJson } from '../api/fetchJson'

export default function SubscriptionPage({ user, isAuth }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const PLANS = [
    {
      id: 'free',
      name: t('subscription.plan_free_name'),
      price: t('subscription.plan_free_price'),
      period: t('subscription.plan_free_period'),
      description: t('subscription.plan_free_desc'),
      features: [
        t('subscription.plan_free_f1'),
        t('subscription.plan_free_f2'),
        t('subscription.plan_free_f3'),
        t('subscription.plan_free_f4'),
      ],
      cta: t('subscription.plan_free_cta'),
      popular: false,
    },
    {
      id: 'pro',
      name: t('subscription.plan_pro_name'),
      price: t('subscription.plan_pro_price'),
      period: t('subscription.plan_pro_period'),
      description: t('subscription.plan_pro_desc'),
      features: [
        t('subscription.plan_pro_f1'),
        t('subscription.plan_pro_f2'),
        t('subscription.plan_pro_f3'),
        t('subscription.plan_pro_f4'),
        t('subscription.plan_pro_f5'),
        t('subscription.plan_pro_f6'),
      ],
      cta: t('subscription.plan_pro_cta'),
      popular: true,
    },
  ]

  const FAQS = [
    { q: t('subscription.faq_1_q'), a: t('subscription.faq_1_a') },
    { q: t('subscription.faq_2_q'), a: t('subscription.faq_2_a') },
    { q: t('subscription.faq_3_q'), a: t('subscription.faq_3_a') },
    { q: t('subscription.faq_4_q'), a: t('subscription.faq_4_a') },
  ]

  const handleSubscribe = async (planId) => {
    if (!isAuth) { navigate('/login'); return }
    if (planId === 'free') return
    setLoading(planId)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const data = await fetchJson('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: planId }),
      })
      navigate('/checkout', { state: { subscription: data } })
    } catch (err) {
      setError(err.message || t('subscription.error'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('subscription.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subscription.subtitle')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl transition transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-[#FF4B3E] shadow-2xl' : 'bg-white shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#FF4B3E] text-white px-4 py-1 rounded-full text-sm font-bold">
                    {t('subscription.most_popular')}
                  </span>
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'bg-white rounded-2xl' : ''}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-lg text-gray-600 font-normal ml-2">{plan.period}</span>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[#FF4B3E] font-bold">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-lg font-bold transition ${
                    plan.popular
                      ? 'bg-[#FF4B3E] text-white hover:bg-[#e03a2d]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } ${loading === plan.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {loading === plan.id ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>{t('subscription.processing')}</>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('subscription.faq_title')}
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-[#FF4B3E] rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">{t('subscription.cta_title')}</h2>
          <p className="text-lg mb-6 opacity-90">{t('subscription.cta_subtitle')}</p>
          <button className="bg-white text-[#FF4B3E] font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition">
            {t('subscription.cta_button')}
          </button>
        </div>
      </div>
    </div>
  )
}