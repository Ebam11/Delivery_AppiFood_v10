// Archivo: src/components/PaymentMethodSelector.jsx | Comentario: logica principal del modulo.
import React from 'react';
import { usePaymentStore } from '../store/paymentStore';
import { useCartStore } from '../store/cartStore';
import { useTranslation } from 'react-i18next';

export default function PaymentMethodSelector() {
  const { createPayment, loading, error } = usePaymentStore();
  const { cart } = useCartStore();
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = React.useState('pse');

  const paymentMethods = [
    {
      id: 'pse',
      name: t('paymentSelector.pse.name'),
      description: t('paymentSelector.pse.description'),
      icon: '🏦',
      info: t('paymentSelector.pse.info'),
      recommend: true,
    },
    {
      id: 'credit_card',
      name: t('paymentSelector.credit.name'),
      description: t('paymentSelector.credit.description'),
      icon: '<i className="fas fa-credit-card mr-1"></i>',
      info: t('paymentSelector.credit.info'),
      recommend: false,
    },
    {
      id: 'debit_card',
      name: t('paymentSelector.debit.name'),
      description: t('paymentSelector.debit.description'),
      icon: '🏧',
      info: t('paymentSelector.debit.info'),
      recommend: false,
    },
  ];

  return (
    <div className="component-payment-method-selector space-y-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{t('paymentSelector.title')}</h3>

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
                        <i className="fas fa-star mr-1"></i> {t('paymentSelector.recommended')}
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

      {/* Nota sobre PSE */}
      {selectedMethod === 'pse' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <strong><i className="fas fa-lightbulb mr-1"></i> {t('paymentSelector.tip')}:</strong> {t('paymentSelector.pseTip')}
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700 font-semibold">{t('paymentSelector.summary')}</p>
        <div className="flex justify-between mt-2">
          <span className="text-gray-600">{t('paymentSelector.totalLabel')}</span>
          <span className="font-bold text-lg text-blue-600">${(cart?.total + 5 || 5).toFixed(2)}</span>
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        {loading ? `⏳ ${t('paymentSelector.processing')}` : t('paymentSelector.continueBtn')}
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔒 {t('paymentSelector.secureNote')}
      </p>
    </div>
  );
}