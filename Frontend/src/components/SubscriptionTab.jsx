// Archivo: src/components/SubscriptionTab.jsx | Comentario: logica principal del modulo.
import { useEffect, useState } from 'react'
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import {
  cancelSubscription,
  createSubscription,
  getCurrentSubscription,
  getSubscriptionPlans,
} from '../api/subscriptions'

export default function SubscriptionTab({ user }) {
  const { t } = useTranslation()
  const [subscription, setSubscription] = useState(null)
  const [history, setHistory] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState(null)

  const formatPrice = (value) => `$${Number(value || 0).toLocaleString('es-CO')}/mes`
  const freePlan = {
    id: 'free',
    name: t('subscription.plan_free_name', { defaultValue: 'Gratis' }),
    monthly_price: 0,
    priceLabel: t('subscription.plan_free_price', { defaultValue: '$0/mes' }),
  }

  useEffect(() => {
    fetchUserSubscription()
  }, [])

  const fetchUserSubscription = async () => {
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        getSubscriptionPlans(),
        getCurrentSubscription().catch(() => null),
      ])

      const availablePlans = plansResponse?.data ?? plansResponse ?? []
      setPlans(Array.isArray(availablePlans) ? availablePlans : [])
      const subscriptionPayload = subscriptionResponse?.data ?? subscriptionResponse ?? null
      setSubscription(subscriptionPayload?.current ?? null)
      setHistory(Array.isArray(subscriptionPayload?.history) ? subscriptionPayload.history : [])
    } catch (err) {
      try {
        if (!import.meta.env.PROD) console.log('ℹ️ Suscripción no disponible:', err.message)
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.log('ℹ️ Suscripción no disponible:', err.message)
      }
      setError(err.message)
      setSubscription(null)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId) => {
    setUpgrading(planId)
    try {
      const data = await createSubscription(planId)
      setSubscription(data?.data ?? data)
      setError(null)
    } catch (err) {
      alert(`${t('subscriptionTab.errorUpgrade')}: ${err.message}`)
    } finally {
      setUpgrading(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm(t('subscriptionTab.confirmCancel'))) return
    try {
      const data = await cancelSubscription()
      setSubscription(data?.data ?? data)
    } catch (err) {
      alert(`${t('subscriptionTab.errorCancel')}: ${err.message}`)
    }
  }

  if (loading) {
    return <div className="text-center py-6">{t('subscriptionTab.loading')}</div>
  }

  const currentPlan = subscription?.plan ?? null
  const effectiveCurrentPlan = currentPlan ?? freePlan
  const normalizedPlans = plans.length > 0
    ? plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        priceLabel: plan.price === 0 || plan.monthly_price === 0
          ? t('subscription.plan_free_price', { defaultValue: '$0/mes' })
          : formatPrice(plan.monthly_price ?? plan.price),
        current: String(effectiveCurrentPlan?.id ?? '') === String(plan.id),
      }))
    : [
        {
          id: 'free',
          name: freePlan.name,
          priceLabel: freePlan.priceLabel,
          current: !subscription?.plan,
        },
        {
          id: effectiveCurrentPlan?.id || 'pro',
          name: effectiveCurrentPlan?.name || t('subscription.plan_pro_name'),
          priceLabel: effectiveCurrentPlan?.monthly_price ? formatPrice(effectiveCurrentPlan.monthly_price) : t('subscription.plan_pro_price'),
          current: !!subscription?.plan,
        },
      ]

  return (
    <div className="component-subscription-tab max-w-2xl">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Plan Actual */}
      <div className="bg-gradient-to-r from-[#FF4B3E] to-[#e03a2d] rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{t('subscriptionTab.currentPlan')}</p>
            <h3 className="text-3xl font-bold mt-2 flex items-center gap-2">
              <span>{effectiveCurrentPlan?.name || 'Plan Gratis'}</span>
              {subscription?.status === 'active' && <i className="fas fa-crown text-yellow-300" aria-hidden="true" />}
            </h3>
            <p className="mt-2 opacity-90">
              {!currentPlan || subscription?.status === 'inactive'
                ? t('subscriptionTab.freeCta')
                : subscription?.status === 'active'
                ? t('subscriptionTab.activeUntil', {
                    date: subscription?.ends_at
                      ? new Date(subscription.ends_at).toLocaleDateString('es-CO')
                      : 'N/A',
                  })
                : t('subscriptionTab.freeCta')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg opacity-90">${Number(effectiveCurrentPlan?.monthly_price || 0).toLocaleString('es-CO')}/mes</span>
          </div>
        </div>
      </div>

      {/* Cambiar Plan */}
      <div className="mb-8">
        <h4 className="font-bold text-lg mb-4">{t('subscriptionTab.otherPlans')}</h4>
        <div className="grid grid-cols-2 gap-4">
          {normalizedPlans.map(plan => (
            <div key={plan.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <h5 className="font-bold mb-2">{plan.name}</h5>
              <p className="text-sm text-gray-600 mb-3">{plan.priceLabel}</p>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.current || upgrading === plan.id}
                className={`w-full py-2 rounded font-bold transition ${
                  plan.current
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#FF4B3E] text-white hover:bg-[#e03a2d]'
                }`}
              >
                {upgrading === plan.id
                  ? t('subscriptionTab.processing')
                  : plan.current
                    ? 'Plan actual'
                  : t('subscriptionTab.switchPlan')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Facturación */}
      <div className="mb-8">
        <h4 className="font-bold text-lg mb-4">{t('subscriptionTab.billingHistory')}</h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold">{t('subscriptionTab.tableDate')}</th>
                <th className="px-4 py-3 text-left font-bold">{t('subscriptionTab.tableConcept')}</th>
                <th className="px-4 py-3 text-right font-bold">{t('subscriptionTab.tableAmount')}</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((entry) => (
                  <tr key={entry.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{entry.ends_at ? new Date(entry.ends_at).toLocaleDateString('es-CO') : '-'}</td>
                    <td className="px-4 py-3">
                      {(entry.plan || 'Suscripción')} · {(entry.status || 'sin estado')}
                    </td>
                    <td className="px-4 py-3 text-right">${Number(entry.price || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))
              ) : subscription?.ends_at ? (
                <tr className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(subscription.ends_at).toLocaleDateString('es-CO')}</td>
                  <td className="px-4 py-3">{currentPlan?.name || 'Suscripción'}</td>
                  <td className="px-4 py-3 text-right">${Number(currentPlan?.monthly_price || 0).toLocaleString('es-CO')}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-center text-gray-500">
                    {t('subscriptionTab.noInvoices')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancelar Suscripción */}
      {currentPlan && subscription?.status === 'active' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 mb-3">
            {t('subscriptionTab.cancelWarning')}
          </p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-bold text-sm"
          >
            {t('subscriptionTab.cancelBtn')}
          </button>
        </div>
      )}
    </div>
  )
}