// Archivo: src/components/PayUCheckout.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useState } from 'react';
import { usePaymentStore } from '../store/paymentStore';
import { useCartStore } from '../store/cartStore';
import { useTranslation } from 'react-i18next';
import { getUserPaymentMethods } from '../api/payment';

export default function PayUCheckout({ orderId }) {
  const { createPayment, loading, error } = usePaymentStore();
  const { cart } = useCartStore();
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState('PSE');
  const [savedMethods, setSavedMethods] = useState([]);
  const [savedMethodsLoading, setSavedMethodsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSavedMethods = async () => {
      try {
        const response = await getUserPaymentMethods();
        if (!mounted) return;
        setSavedMethods(response?.data || []);
      } catch {
        if (!mounted) return;
        setSavedMethods([]);
      } finally {
        if (mounted) setSavedMethodsLoading(false);
      }
    };

    loadSavedMethods();

    return () => {
      mounted = false;
    };
  }, []);

  const paymentMethods = [
    {
      id: 'PSE',
      name: t('payuCheckout.pse.name'),
      description: t('payuCheckout.pse.description'),
      icon: '🏦',
      info: t('payuCheckout.pse.info'),
      recommend: true,
    },
    {
      id: 'VISA',
      name: t('payuCheckout.visa.name'),
      description: t('payuCheckout.visa.description'),
      icon: '💳',
      info: t('payuCheckout.visa.info'),
      recommend: false,
    },
    {
      id: 'MASTERCARD',
      name: t('payuCheckout.mastercard.name'),
      description: t('payuCheckout.mastercard.description'),
      icon: '💳',
      info: t('payuCheckout.mastercard.info'),
      recommend: false,
    },
  ];

  const handlePayment = async () => {
    try {
      const savedMethod = savedMethods.find((method) => `saved-${method.id}` === selectedMethod);
      const paymentMethod = savedMethod?.provider ? savedMethod.provider.toUpperCase() : selectedMethod;
      const response = await createPayment(orderId, paymentMethod);
      if (response?.payment_url) {
        window.location.href = response.payment_url;
      }
    } catch (err) {
      console.error('Error al procesar pago:', err);
    }
  };

  return (
    <div className="component-payu-checkout space-y-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🇨🇴 {t('payuCheckout.title')}</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <input
              type="radio"
              id={method.id}
              name="payment-method"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => setSelectedMethod(method.id)}
              className="sr-only"
            />
            <label
              htmlFor={method.id}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start">
                <div className="text-3xl mr-4">{method.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-800">{method.name}</h4>
                    {method.recommend && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                        ⭐ {t('payuCheckout.recommended')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">ℹ️ {method.info}</p>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <h4 className="font-bold text-gray-800 mb-3">{t('payuCheckout.savedMethods', { defaultValue: 'Métodos guardados' })}</h4>
        {savedMethodsLoading ? (
          <div className="text-sm text-gray-500">{t('payuCheckout.loadingMethods', { defaultValue: 'Cargando métodos guardados...' })}</div>
        ) : savedMethods.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
            {t('payuCheckout.noSavedMethods', { defaultValue: 'No tienes métodos guardados. Puedes agregarlos desde tu perfil.' })}
          </div>
        ) : (
          <div className="space-y-3">
            {savedMethods.map((method) => {
              const methodId = `saved-${method.id}`;
              return (
                <div key={method.id} className="relative">
                  <input
                    type="radio"
                    id={methodId}
                    name="payment-method-saved"
                    value={methodId}
                    checked={selectedMethod === methodId}
                    onChange={() => setSelectedMethod(methodId)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={methodId}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedMethod === methodId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="text-3xl mr-4">💳</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800">
                            {method.label || method.holder_name || t('payuCheckout.savedCard', { defaultValue: 'Tarjeta guardada' })}
                          </h4>
                          {method.is_default && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                              ⭐ {t('payuCheckout.recommended')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {method.provider?.toUpperCase() || 'CARD'} •••• {method.last_four || '0000'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-semibold">
                          ℹ️ {method.exp_month}/{method.exp_year}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nota sobre PSE */}
      {selectedMethod === 'PSE' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <strong>💡 {t('payuCheckout.tip')}:</strong> {t('payuCheckout.pseTip')}
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700 font-semibold">{t('payuCheckout.summary')}</p>
        <div className="flex justify-between mt-2">
          <span className="text-gray-600">{t('payuCheckout.totalLabel')}</span>
          <span className="font-bold text-lg text-blue-600">
            COP ${Number(cart?.total || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        {loading
          ? `⏳ ${t('payuCheckout.processing')}`
          : t('payuCheckout.payBtn', { method: selectedMethod })}
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔒 {t('payuCheckout.secureNote')}
      </p>
    </div>
  );
}