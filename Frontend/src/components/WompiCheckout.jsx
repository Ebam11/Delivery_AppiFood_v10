import React, { useEffect, useRef, useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { fetchJson } from '../api/fetchJson';

export default function WompiCheckout({ orderId }) {
  const { cart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;

    const initWompi = async () => {
      try {
        // Prepara el pago en backend (PENDING)
        const res = await fetchJson('/api/payments', {
          method: 'POST',
          body: {
            order_id: orderId,
            payment_method: 'wompi'
          }
        });

        if (!active) return;

        const payment = res.data ?? res;
        const total = (cart?.total || 0) + (cart?.delivery_cost || 0);
        const amountInCents = Math.round(total * 100);
        const reference = payment.external_reference;
        const redirectUrl = `${window.location.origin}/payment/confirmation/${orderId}?transaction_id=${payment.id}&reference_code=${reference}`;

        // Carga el widget de Wompi
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

    return () => {
      active = false;
    };
  }, [orderId, cart]);

  return (
    <div className="wompi-checkout-container bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm mt-4 text-center transition-colors duration-300">
      <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2 transition-colors duration-300">Pago Seguro con Wompi</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 transition-colors duration-300">Paga de forma segura con tarjeta de crédito, PSE, Nequi o Bancolombia.</p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm font-semibold transition-colors duration-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-bold transition-colors duration-300">Cargando pasarela de pagos...</span>
        </div>
      ) : (
        <div className="flex justify-center" ref={containerRef}>
          {/* El botón de Wompi se cargará aquí */}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-semibold transition-colors duration-300">
        <span>🔒 Pagos procesados por Wompi Sandbox</span>
      </div>
    </div>
  );
}
