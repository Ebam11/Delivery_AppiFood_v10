// Archivo: src/pages/PaymentConfirmation.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { usePaymentStore } from '../store/paymentStore';
import { useOrderStore } from '../store/orderStore';
import { Loading } from '../components/Loading';

export const PaymentConfirmation = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirmPaymentStatus, loading } = usePaymentStore();
  const { fetchOrder, currentOrder } = useOrderStore();

  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState(t('payment_confirmation.checking'));
  const [verifiedOrder, setVerifiedOrder] = useState(null);

  const transactionId = searchParams.get('transaction_id');
  const referenceCode = searchParams.get('reference_code');

  useEffect(() => {
    let mounted = true;

    const checkPayment = async () => {
      try {
        if (transactionId && referenceCode) {
          await confirmPaymentStatus(transactionId, referenceCode);
        }
        
        const orderData = await fetchOrder(orderId);
        if (!mounted) return;
        setVerifiedOrder(orderData);
        
        const orderStatus = String(orderData?.status || '').toLowerCase();
        if (orderStatus === 'confirmed') {
          setStatus('success');
          setMessage(t('payment_confirmation.success_message'));
        } else if (orderStatus === 'pending') {
          setStatus('pending');
          setMessage(t('payment_confirmation.pending_message'));
        } else {
          setStatus('failed');
          setMessage(t('payment_confirmation.failed_message'));
        }
      } catch (error) {
        setStatus('error');
        setMessage(t('payment_confirmation.error_verifying'));
        console.error(error);
      }
    };

    if (orderId) {
      checkPayment();
    }
    return () => { mounted = false };
  }, [transactionId, referenceCode, orderId, confirmPaymentStatus, fetchOrder, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const order = verifiedOrder?.data || verifiedOrder;
  const subtotal = Number(order?.subtotal || 0);
  const deliveryCost = Number(order?.delivery_cost || 0);
  const discount = Number(order?.discount || 0);
  const total = Number(order?.total || 0);

  const fmt = (n) => `$${n.toLocaleString('es-CO')}`;

  return (
    <div className="page-payment-confirmation min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6">
      <div className="max-w-lg mx-auto">

        {/* Estado: verificando */}
        {status === 'checking' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10 text-center border border-gray-100 dark:border-slate-700">
            <Loading />
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">{message}</p>
          </div>
        )}

        {/* Estado: ÉXITO — resumen detallado */}
        {status === 'success' && (
          <div className="space-y-4">
            {/* Header zona segura */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl shadow-emerald-500/20 p-6 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-shield-alt text-3xl" />
              </div>
              <h1 className="text-2xl font-black mb-1">¡Pago Confirmado! 🎉</h1>
              <p className="text-emerald-100 text-sm font-medium">{message}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-xs font-bold">
                <i className="fas fa-lock" /> Transacción segura verificada
              </div>
            </div>

            {/* Tarjeta de resumen de la orden */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              {/* Número de pedido */}
              <div className="bg-gray-50 dark:bg-slate-700/50 px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedido</span>
                <span className="font-black text-gray-800 dark:text-white text-base">#{order?.id || orderId}</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Restaurante */}
                {order?.restaurant_name && (
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-store text-[#FF4B3E]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Restaurante</p>
                      <p className="font-black text-gray-800 dark:text-white">{order.restaurant_name}</p>
                    </div>
                  </div>
                )}

                {/* Ítems del pedido */}
                {order?.items && order.items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Productos</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          <span className="text-[#FF4B3E] font-black mr-1">×{item.quantity}</span>
                          {item.product_name}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          {fmt(Number(item.quantity * item.unit_price))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resumen financiero */}
                <div className="border-t border-gray-100 dark:border-slate-700 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-semibold">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Envío</span>
                    <span className="font-semibold">{fmt(deliveryCost)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Descuento</span>
                      <span>-{fmt(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base text-gray-800 dark:text-white border-t border-gray-200 dark:border-slate-600 pt-2 mt-2">
                    <span>Total pagado</span>
                    <span className="text-[#FF4B3E]">{fmt(total)}</span>
                  </div>
                </div>

                {/* Dirección de entrega */}
                {order?.delivery_address && (
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 flex items-start gap-3 text-sm">
                    <i className="fas fa-map-marker-alt text-[#FF4B3E] mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-0.5">Entrega en</p>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">{order.delivery_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción seguros */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/user/orders/${order?.id || orderId}`)}
                className="w-full py-4 bg-gradient-to-r from-[#FF4B3E] to-[#FF7A59] hover:from-[#e03a2d] hover:to-[#e03a2d] text-white font-black rounded-2xl shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
              >
                <i className="fas fa-box-open" /> Ver mi pedido
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 hover:border-[#FF4B3E] hover:text-[#FF4B3E] text-gray-700 dark:text-gray-300 font-black rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
              >
                <i className="fas fa-home" /> Volver al inicio
              </button>
            </div>

            {/* Sello de seguridad */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500 font-semibold pt-2">
              <span className="flex items-center gap-1.5"><i className="fas fa-lock text-green-500" /> SSL Seguro</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-shield-alt text-blue-500" /> Datos Cifrados</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-check-circle text-emerald-500" /> Wompi</span>
            </div>
          </div>
        )}

        {/* Estado: PENDIENTE */}
        {status === 'pending' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 text-center border border-gray-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('payment_confirmation.pending_title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">{message}</p>
            <button
              onClick={() => navigate(`/user/orders/${order?.id || orderId}`)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition mb-3"
            >
              {t('payment_confirmation.view_order_status')}
            </button>
            <button onClick={() => navigate('/')} className="w-full text-gray-500 dark:text-gray-400 font-bold py-2 text-sm hover:text-[#FF4B3E] transition">
              Volver al inicio
            </button>
          </div>
        )}

        {/* Estado: FALLIDO / ERROR */}
        {(status === 'failed' || status === 'error') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 text-center border border-gray-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('payment_confirmation.failed_title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">{message}</p>
            <button
              onClick={() => navigate(`/user/checkout?status=failure`)}
              className="w-full bg-[#FF4B3E] hover:bg-[#e03a2d] text-white font-bold py-3 rounded-xl transition mb-3"
            >
              {t('payment_confirmation.try_again')}
            </button>
            <button onClick={() => navigate('/')} className="w-full text-gray-500 dark:text-gray-400 font-bold py-2 text-sm hover:text-[#FF4B3E] transition">
              Volver al inicio
            </button>
          </div>
        )}

      </div>
    </div>
  );
};