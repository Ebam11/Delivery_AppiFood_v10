// Archivo: src/pages/PaymentConfirmation.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

  return (
    <div className="page-payment-confirmation min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        {status === 'checking' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Loading />
            <p className="mt-4 text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('payment_confirmation.success_title')}</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-900">{t('payment_confirmation.order_number')}</p>
              <p className="text-xl font-bold text-blue-600">#{verifiedOrder?.id || orderId}</p>
            </div>
            <button
              onClick={() => navigate(`/orders/${verifiedOrder?.id || orderId}`)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
            >
              {t('payment_confirmation.view_order')}
            </button>
            <button
              onClick={() => navigate('/restaurants')}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              {t('payment_confirmation.continue_shopping')}
            </button>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('payment_confirmation.pending_title')}</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate(`/orders/${verifiedOrder?.id || orderId}`)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition"
            >
              {t('payment_confirmation.view_order_status')}
            </button>
          </div>
        )}

        {(status === 'failed' || status === 'error') && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('payment_confirmation.failed_title')}</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate(`/checkout?status=failure`)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
            >
              {t('payment_confirmation.try_again')}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              {t('payment_confirmation.back_to_cart')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};