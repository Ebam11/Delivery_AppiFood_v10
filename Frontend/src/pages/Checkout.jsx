// Archivo: src/pages/Checkout.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { usePaymentStore } from '../store/paymentStore';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import PayUCheckout from '../components/PayUCheckout';

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

    loadCart();

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
      <div className="page-checkout min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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
    <div className="page-checkout min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('checkout.title')}</h1>
          <p className="text-gray-500">{t('checkout.step')}</p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!orderId ? (
            <form onSubmit={handleCreateOrder} className="space-y-6">

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  {t('checkout.address_label')}
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder={t('checkout.address_placeholder')}
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition text-base"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  {t('checkout.notes_label')}
                </label>
                <textarea
                  name="notes"
                  placeholder={t('checkout.notes_placeholder')}
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition text-base resize-none"
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">{t('checkout.order_summary')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">{t('checkout.items')} ({cart.total_items || 0})</span>
                    <span className="font-semibold">COP ${(cart.total || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">{t('checkout.shipping')}</span>
                    <span className="font-semibold">COP $5.000</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-3 mt-3">
                    <span className="text-gray-800">{t('checkout.total_to_pay')}</span>
                    <span className="text-[#FF4B3E]">
                      COP ${((cart.total || 0) + 5000).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  {t('checkout.back_to_cart')}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#FF4B3E]/30 transition disabled:opacity-50"
                >
                  {isProcessing ? t('checkout.creating') : t('checkout.continue')}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">{t('checkout.complete_payment')}</h2>
              <p className="text-gray-500 mb-8">
                {t('checkout.order_number')} <span className="font-bold text-[#FF4B3E]">#{orderId}</span>
              </p>

              {paymentError && <ErrorMessage message={paymentError} onDismiss={() => {}} />}

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <h3 className="font-bold text-lg text-gray-800 mb-4">{t('checkout.order_summary_2')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">{t('checkout.subtotal')}</span>
                    <span className="font-semibold">COP ${(cart.total || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">{t('checkout.shipping')}</span>
                    <span className="font-semibold">COP $5.000</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-3">
                    <span className="text-gray-800">{t('checkout.total_to_pay_2')}</span>
                    <span className="text-[#FF4B3E]">
                      COP ${((cart.total || 0) + 5000).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              <PayUCheckout orderId={orderId} />

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