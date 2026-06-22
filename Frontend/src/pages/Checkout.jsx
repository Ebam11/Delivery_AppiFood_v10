// Archivo: src/pages/Checkout.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { usePaymentStore } from '../store/paymentStore';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import WompiCheckout from '../components/WompiCheckout';
import '../components/SharedUI.css';

export const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { cart, fetchCart, isLoading: isCartLoading, error: cartError } = useCartStore();
  const { createNewOrder } = useOrderStore();
  const { error: paymentError } = usePaymentStore();

  const [formData, setFormData] = useState({ address: '', notes: '' });
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const paymentStatus = searchParams.get('status');

  useEffect(() => {
    let isMounted = true;

    const loadCart = async () => {
      try {
        await fetchCart();
      } catch {
        // El mensaje de error ya se maneja en el store.
      } finally {
        if (isMounted) setHasLoadedCart(true);
      }
    };

    const fetchSavedAddresses = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/addresses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const list = data?.data || [];
            setSavedAddresses(list);
            // Si hay una dirección default, ponerla por defecto
            const def = list.find(a => a.is_default);
            if (def) {
              setFormData(prev => ({ ...prev, address: def.address }));
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching saved addresses for checkout:', err);
      }
    };

    loadCart();
    fetchSavedAddresses();

    return () => {
      isMounted = false;
    };
  }, [fetchCart]);

  useEffect(() => {
    if (!hasLoadedCart || isCartLoading) return;
    if (!cart || cart.items?.length === 0) navigate('/cart');
  }, [cart, hasLoadedCart, isCartLoading, navigate]);

  useEffect(() => {
    if (paymentStatus === 'failure') {
      setError(t('checkout.payment_failure'));
    } else if (paymentStatus === 'pending') {
      setError(t('checkout.payment_pending'));
    }
  }, [paymentStatus, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      const orderData = {
        delivery_address: formData.address,
        notes: formData.notes || null,
      };
      const orderResponse = await createNewOrder(orderData);
      setOrderId(orderResponse.id);
    } catch (err) {
      const message = err.response?.data?.message || 'Error al crear la orden';
      setError(message);
      setIsProcessing(false);
    }
  };

  if (!hasLoadedCart || isCartLoading) return <Loading />;

  if (!cart) {
    return (
      <div className="page-checkout min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-6 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          <ErrorMessage
            message={cartError || t('checkout.cart_load_error', { defaultValue: 'No se pudo cargar el carrito.' })}
          />
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="px-4 py-3 bg-[#FF4B3E] text-white font-bold rounded-xl hover:shadow-lg transition"
          >
            {t('checkout.back_to_cart')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-checkout min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-6 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">{t('checkout.title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 transition-colors duration-300">{t('checkout.step')}</p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
          {!orderId ? (
            <form onSubmit={handleCreateOrder} className="space-y-6">

              <div>
                <label className="block text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300">
                  {t('checkout.address_label')}
                </label>

                {savedAddresses.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Selecciona una dirección guardada:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData(prev => ({ ...prev, address: e.target.value }));
                        }
                      }}
                      value={formData.address}
                      className="w-full px-4 py-3 bg-gray-55 dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:border-[#FF4B3E] cursor-pointer text-sm"
                    >
                      <option value="">-- Elige una dirección guardada --</option>
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.address}>
                          {addr.name || 'Dirección sin nombre'} ({addr.address})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  type="text"
                  name="address"
                  placeholder={t('checkout.address_placeholder')}
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition text-base"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300">
                  {t('checkout.notes_label')}
                </label>
                <textarea
                  name="notes"
                  placeholder={t('checkout.notes_placeholder')}
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition text-base resize-none"
                />
              </div>

              <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-200 dark:border-slate-600 transition-colors duration-300">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">{t('checkout.order_summary')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('checkout.items')} ({cart.total_items || 0})</span>
                    <span className="font-semibold">COP ${Number(cart.total || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('checkout.shipping')}</span>
                    <span className="font-semibold">COP ${Number(cart.delivery_cost || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 dark:border-slate-500 pt-3 mt-3">
                    <span className="text-gray-800 dark:text-white">{t('checkout.total_to_pay')}</span>
                    <span className="text-[#FF4B3E]">
                      COP ${Number((cart.total || 0) + (cart.delivery_cost || 0)).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 button-outline py-3.5"
                >
                  {t('checkout.back_to_cart')}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 button-primary py-3.5 disabled:opacity-50"
                >
                  {isProcessing ? t('checkout.creating') : t('checkout.continue')}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1 transition-colors duration-300">{t('checkout.complete_payment')}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">
                {t('checkout.order_number')} <span className="font-bold text-[#FF4B3E]">#{orderId}</span>
              </p>

              {paymentError && <ErrorMessage message={paymentError} onDismiss={() => {}} />}

              <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-200 dark:border-slate-600 mb-8 transition-colors duration-300">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">{t('checkout.order_summary_2')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('checkout.subtotal')}</span>
                    <span className="font-semibold">COP ${Number(cart.total || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('checkout.shipping')}</span>
                    <span className="font-semibold">COP ${Number(cart.delivery_cost || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 dark:border-slate-500 pt-3 mt-3">
                    <span className="text-gray-800 dark:text-white">{t('checkout.total_to_pay_2')}</span>
                    <span className="text-[#FF4B3E]">
                      COP ${Number((cart.total || 0) + (cart.delivery_cost || 0)).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              <WompiCheckout orderId={orderId} />

              <button
                onClick={() => {
                  setOrderId(null);
                  setFormData({ address: '', notes: '' });
                }}
                className="w-full mt-6 px-4 py-3 text-[#FF4B3E] font-bold hover:bg-red-50 rounded-xl transition"
              >
                {t('checkout.modify_address')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};