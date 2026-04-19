// Archivo: src/components/SubscriptionTab.jsx | Comentario: logica principal del modulo.
import { useState, useEffect } from 'react'
import { fetchJson } from '../api/fetchJson'
import { useTranslation } from 'react-i18next'

export default function SubscriptionTab({ user }) {
  const { t } = useTranslation()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  const SUBSCRIPTION_PLANS = {
    free: { name: t('subscriptionTab.plans.free'),   color: '#gray', features: [t('subscriptionTab.plans.freeFeature')] },
    pro:  { name: t('subscriptionTab.plans.pro'),    color: '#FF4B3E', features: [t('subscriptionTab.plans.proFeature1'), t('subscriptionTab.plans.proFeature2')] },
  }

  useEffect(() => {
    fetchUserSubscription()
  }, [])

  const fetchUserSubscription = async () => {
    try {
      const token = localStorage.getItem('token')
      const data = await fetchJson('/api/user/subscription', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setSubscription(data.data || data)
    } catch (err) {
      console.log('ℹ️ Sin suscripción activa:', err.message)
      setSubscription({ plan: 'free', status: 'active' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId) => {
    setUpgrading(planId)
    try {
      const token = localStorage.getItem('token')
      const data = await fetchJson('/api/user/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: planId }),
      })
      setSubscription(data.data || data)
    } catch (err) {
      alert(`${t('subscriptionTab.errorUpgrade')}: ${err.message}`)
    } finally {
      setUpgrading(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm(t('subscriptionTab.confirmCancel'))) return
    try {
      const token = localStorage.getItem('token')
      await fetchJson('/api/user/subscription/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      setSubscription({ plan: 'free', status: 'cancelled' })
    } catch (err) {
      alert(`${t('subscriptionTab.errorCancel')}: ${err.message}`)
    }
  }

  if (loading) {
    return <div className="text-center py-6">{t('subscriptionTab.loading')}</div>
  }

  const currentPlan = subscription?.plan || 'free'
  const planInfo = SUBSCRIPTION_PLANS[currentPlan] || SUBSCRIPTION_PLANS.free

  return (
    <div className="max-w-2xl">
      {/* Plan Actual */}
      <div className="bg-gradient-to-r from-[#FF4B3E] to-[#e03a2d] rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{t('subscriptionTab.currentPlan')}</p>
            <h3 className="text-3xl font-bold mt-2">{planInfo.name}</h3>
            <p className="mt-2 opacity-90">
              {currentPlan === 'free'
                ? t('subscriptionTab.freeCta')
                : t('subscriptionTab.activeUntil', {
                    date: subscription?.expires_at
                      ? new Date(subscription.expires_at).toLocaleDateString('es-CO')
                      : 'N/A'
                  })}
            </p>
          </div>
          <div className="text-right">
            {currentPlan === 'free' && (
              <span className="text-lg opacity-90">$0</span>
            )}
          </div>
        </div>
      </div>

      {/* Cambiar Plan */}
      <div className="mb-8">
        <h4 className="font-bold text-lg mb-4">{t('subscriptionTab.otherPlans')}</h4>
        <div className="grid grid-cols-2 gap-4">
          {['pro'].map(planId => (
            <div key={planId} className="border rounded-lg p-4 hover:shadow-lg transition">
              <h5 className="font-bold mb-2">{SUBSCRIPTION_PLANS[planId].name}</h5>
              <p className="text-sm text-gray-600 mb-3">
                {planId === 'pro' ? '$24.990/mes' : '$49.990/mes'}
              </p>
              <button
                onClick={() => handleUpgrade(planId)}
                disabled={upgrading === planId || currentPlan === planId}
                className={`w-full py-2 rounded font-bold transition ${
                  currentPlan === planId
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#FF4B3E] text-white hover:bg-[#e03a2d]'
                }`}
              >
                {upgrading === planId
                  ? t('subscriptionTab.processing')
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
              {subscription?.invoices?.length ? (
                subscription.invoices.map((inv, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(inv.date).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3">{inv.description}</td>
                    <td className="px-4 py-3 text-right">${inv.amount}</td>
                  </tr>
                ))
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
      {currentPlan !== 'free' && subscription?.status === 'active' && (
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