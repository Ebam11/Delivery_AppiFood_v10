import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { fetchJson } from '../api/fetchJson';

const PAYMENT_METHODS = [
  {
    id: 'co_pse_bank',
    label: 'PSE',
    icon: '🏦',
    desc: 'Débito bancario PSE',
    recommend: true,
  },
  {
    id: 'co_nequi_bank',
    label: 'Nequi',
    icon: '🟣',
    desc: 'Billetera Nequi',
    recommend: false,
  },
  {
    id: 'co_efecty_cash',
    label: 'Efecty',
    icon: '🟡',
    desc: 'Pago en efectivo Efecty',
    recommend: false,
  },
  {
    id: 'card',
    label: 'Tarjeta',
    icon: '💳',
    desc: 'Visa, Mastercard, Amex',
    recommend: false,
  },
];

export default function RapydCheckout({ orderId }) {
  const { cart } = useCartStore();
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('co_pse_bank');
  const [savedMethods, setSavedMethods]   = useState([]);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(null);

  const total = (cart?.total || 0) + (cart?.delivery_cost || 0);

  // Cargar métodos de pago guardados del usuario
  React.useEffect(() => {
    const loadSaved = async () => {
      try {
        const response = await fetchJson('/api/payment-methods');
        const list = Array.isArray(response) ? response : response?.data || [];
        setSavedMethods(list);
        if (list.length > 0) {
          const def = list.find(m => m.is_default) || list[0];
          setSelectedSavedMethod(def);
          setSelectedMethod('saved_' + def.id);
        }
      } catch (err) {
        console.warn('Error al cargar métodos de pago guardados:', err);
      }
    };
    loadSaved();
  }, []);

  const getMethodToSend = () => {
    if (selectedMethod.startsWith('saved_') && selectedSavedMethod) {
      if (selectedSavedMethod.type === 'card') return 'card';
      if (selectedSavedMethod.provider) return selectedSavedMethod.provider;
      return 'co_pse_bank';
    }
    return selectedMethod;
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    const methodToSend = getMethodToSend();

    try {
      const res = await fetchJson('/api/payments', {
        method: 'POST',
        body: { order_id: orderId, payment_method: methodToSend },
      });

      const payment = res?.data ?? res;
      const paymentUrl = res?.payment_url;

      if (paymentUrl) {
        // Si la URL es una redirección interna para confirmación dev/sandbox
        if (paymentUrl.includes('/payment/confirmation/')) {
          const reference = payment?.external_reference;
          await fetchJson('/api/payments/confirm', {
            method: 'POST',
            body: { transaction_id: payment?.id, reference_code: reference },
          });
          window.location.href = `/payment/confirmation/${orderId}?transaction_id=${payment?.id}&reference_code=${encodeURIComponent(reference)}&status=APPROVED`;
        } else {
          // Si Rapyd devolvió una URL real de checkout, redirigir
          window.location.href = paymentUrl;
        }
      } else {
        setError('No se pudo obtener la URL de pago. Intenta de nuevo.');
      }
    } catch (err) {
      setError(err?.message || 'Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Pago de prueba interno (sandbox dev sin Rapyd configurado)
  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    const methodToSend = getMethodToSend();
    try {
      const res = await fetchJson('/api/payments', {
        method: 'POST',
        body: { order_id: orderId, payment_method: methodToSend },
      });
      const payment   = res?.data ?? res;
      const reference = payment?.external_reference;

      await fetchJson('/api/payments/confirm', {
        method: 'POST',
        body: { transaction_id: payment?.id, reference_code: reference },
      });

      window.location.href = `/payment/confirmation/${orderId}?transaction_id=${payment?.id}&reference_code=${encodeURIComponent(reference)}&status=APPROVED`;
    } catch (err) {
      setError('Error al simular pago: ' + (err?.message || 'Desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const getActiveMethodLabel = () => {
    if (selectedMethod.startsWith('saved_') && selectedSavedMethod) {
      return selectedSavedMethod.type === 'card' ? 'Tarjeta guardada' : 'Cuenta guardada';
    }
    return PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label || 'Método seleccionado';
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm mt-4 transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <i className="fas fa-bolt text-white text-sm" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-800 dark:text-white">Pago Seguro con Rapyd</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Plataforma global de pagos</p>
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 mt-2">
        Elige tu método de pago. Tus datos están protegidos con cifrado SSL.
      </p>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
          <i className="fas fa-exclamation-triangle mr-2" />{error}
        </div>
      )}

      {/* Métodos guardados */}
      {savedMethods.length > 0 && (
        <div className="mb-6 border-b border-gray-100 dark:border-slate-700 pb-5">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
            <i className="fas fa-wallet mr-1.5 text-violet-500" /> Tus métodos de pago guardados
          </h4>
          <div className="space-y-2">
            {savedMethods.map((method) => {
              const isSelected = selectedMethod === 'saved_' + method.id;
              const displayLabel = method.type === 'card' 
                ? `💳 **** **** **** ${method.last_four} (${(method.provider || 'card').toUpperCase()})`
                : `🟣 ${method.label || method.provider || 'Billetera'} (${method.wallet_phone})`;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setSelectedSavedMethod(method);
                    setSelectedMethod('saved_' + method.id);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 text-left text-sm ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md shadow-violet-500/10'
                      : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{displayLabel}</span>
                    {method.is_default && (
                      <span className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        Predeterminado
                      </span>
                    )}
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-violet-500' : 'border-gray-300'}`}>
                    {isSelected && <div className="w-2 h-2 bg-violet-500 rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Métodos de pago estándar */}
      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
        <i className="fas fa-credit-card mr-1.5 text-violet-500" /> Otros métodos de pago
      </h4>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelectedMethod(method.id)}
            className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
              selectedMethod === method.id
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md shadow-violet-500/10'
                : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:border-gray-300 dark:hover:border-slate-500'
            }`}
          >
            {selectedMethod === method.id && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white" style={{ fontSize: '8px' }} />
              </span>
            )}
            {method.recommend && (
              <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                ★ TOP
              </span>
            )}
            <span className="text-2xl block mb-1 mt-1">{method.icon}</span>
            <p className={`text-xs font-black ${selectedMethod === method.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-200'}`}>
              {method.label}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{method.desc}</p>
          </button>
        ))}
      </div>

      {/* Resumen del total */}
      <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Total a pagar</span>
          <span className="font-black text-lg text-violet-600 dark:text-violet-400">
            COP ${Number(total).toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* Botón principal — Rapyd real */}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-black rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 text-base mb-3"
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin text-lg" />
            <span>Conectando con Rapyd...</span>
          </>
        ) : (
          <>
            <i className="fas fa-lock text-lg" />
            <span>Pagar con {getActiveMethodLabel()}</span>
          </>
        )}
      </button>


      {/* Sellos de seguridad */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500 font-semibold">
        <span className="flex items-center gap-1.5"><i className="fas fa-lock text-green-500" /> SSL Seguro</span>
        <span className="flex items-center gap-1.5"><i className="fas fa-shield-alt text-blue-500" /> Datos Cifrados</span>
        <span className="flex items-center gap-1.5"><i className="fas fa-check-circle text-violet-500" /> Rapyd Certified</span>
      </div>
    </div>
  );
}
