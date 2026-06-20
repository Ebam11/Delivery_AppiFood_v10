import React, { useEffect, useRef, useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { fetchJson } from '../api/fetchJson';

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Tarjeta de Crédito / Débito',
    icon: '💳',
    desc: 'Visa, Mastercard, Amex',
  },
  {
    id: 'nequi',
    label: 'Nequi',
    icon: '🟣',
    desc: 'Billetera Nequi',
  },
  {
    id: 'bancolombia',
    label: 'Bancolombia',
    icon: '🏦',
    desc: 'Débito Bancolombia',
  },
  {
    id: 'pse',
    label: 'PSE',
    icon: '🌐',
    desc: 'Transferencia bancaria',
  },
];

export default function WompiCheckout({ orderId }) {
  const { cart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;

    const initWompi = async () => {
      try {
        const res = await fetchJson('/api/payments', {
          method: 'POST',
          body: { order_id: orderId, payment_method: 'wompi' }
        });

        if (!active) return;

        const payment = res.data ?? res;
        const total = (cart?.total || 0) + (cart?.delivery_cost || 0);
        const amountInCents = Math.round(total * 100);
        const reference = payment.external_reference;
        const redirectUrl = `${window.location.origin}/payment/confirmation/${orderId}?transaction_id=${payment.id}&reference_code=${reference}`;

        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget/v1.js';
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', 'pub_test_Q5yDA9zoK754vjSgMR91D1185Gg1N354');
        script.setAttribute('data-reference', reference);
        script.setAttribute('data-amount-in-cents', amountInCents.toString());
        script.setAttribute('data-currency', 'COP');
        script.setAttribute('data-redirect-url', redirectUrl);
        script.async = true;

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(script);
        }
        setLoading(false);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Error al iniciar pasarela de pagos');
        setLoading(false);
      }
    };

    initWompi();
    return () => { active = false; };
  }, [orderId, cart]);

  const handleSimulate = async () => {
    setSimulating(true);
    setError(null);
    try {
      const res = await fetchJson(`/api/payments`, {
        method: 'POST',
        body: { order_id: orderId, payment_method: 'wompi' }
      });
      const payment = res.data ?? res;
      const reference = payment.external_reference;

      await fetchJson('/api/payments/confirm', {
        method: 'POST',
        body: { transaction_id: payment.id, reference_code: reference }
      });

      window.location.href = `/payment/confirmation/${orderId}?transaction_id=${payment.id}&reference_code=${reference}`;
    } catch (err) {
      setError('Error al simular pago: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="wompi-checkout-container bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm mt-4 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">🔒</span>
        <h3 className="text-xl font-black text-gray-800 dark:text-white">Pago Seguro con Wompi</h3>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
        Elige tu método de pago. Tus datos están protegidos con cifrado SSL.
      </p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Selector de métodos de pago */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelectedMethod(method.id)}
            className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
              selectedMethod === method.id
                ? 'border-[#FF4B3E] bg-red-50 dark:bg-red-900/20 shadow-md shadow-red-500/10'
                : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:border-gray-300 dark:hover:border-slate-500'
            }`}
          >
            {selectedMethod === method.id && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-[#FF4B3E] rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white" style={{ fontSize: '8px' }} />
              </span>
            )}
            <span className="text-2xl block mb-1">{method.icon}</span>
            <p className={`text-xs font-black ${selectedMethod === method.id ? 'text-[#FF4B3E]' : 'text-gray-700 dark:text-gray-200'}`}>
              {method.label}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{method.desc}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <div className="w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">Cargando pasarela de pagos...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 justify-center">
          <div ref={containerRef} className="flex justify-center w-full">
            {/* El botón de Wompi se cargará aquí */}
          </div>

          {/* Botón simulador premium con candado */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full max-w-sm py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 text-base"
          >
            {simulating ? (
              <>
                <i className="fas fa-spinner fa-spin text-lg" />
                <span>Procesando pago seguro...</span>
              </>
            ) : (
              <>
                <i className="fas fa-lock text-lg" />
                <span>Pagar con {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label}</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
            Entorno Sandbox · No se realizará un cobro real
          </p>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500 font-semibold">
        <span className="flex items-center gap-1.5"><i className="fas fa-lock text-green-500" /> SSL Seguro</span>
        <span className="flex items-center gap-1.5"><i className="fas fa-shield-alt text-blue-500" /> Datos Cifrados</span>
        <span className="flex items-center gap-1.5"><i className="fas fa-check-circle text-emerald-500" /> Wompi Certificado</span>
      </div>
    </div>
  );
}

