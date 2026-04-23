// Archivo: src/pages/PaymentConfirmation.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { usePaymentStore } from '../store/paymentStore';
import { useOrderStore } from '../store/orderStore';
import { Loading } from '../components/Loading';

export const PaymentConfirmation = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmPaymentStatus, loading } = usePaymentStore();
  const { fetchOrder } = useOrderStore();

  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Verificando estado del pago...');
  const [orderData, setOrderData] = useState(null);

  // Los parámetros vienen del retorno de PayU
  const transactionId = searchParams.get('transaction_id');
  const referenceCode = searchParams.get('reference_code');

  useEffect(() => {
    let isMounted = true;

    const checkPayment = async () => {
      try {
        if (transactionId && referenceCode) {
          await confirmPaymentStatus(transactionId, referenceCode);
        }
        
        // Obtener orden actualizada
        const updatedOrder = await fetchOrder(orderId);
        setOrderData(updatedOrder);
        
        // Determinar estado basado en la orden
        if (!isMounted) return;

        if (updatedOrder?.status === 'confirmed') {
            setStatus('success');
            setMessage('¡Pago realizado exitosamente! Tu orden ha sido confirmada.');
        } else if (updatedOrder?.status === 'pending') {
            setStatus('pending');
            setMessage('Tu pago está pendiente de confirmación. Te notificaremos pronto.');
          } else {
            setStatus('failed');
            setMessage('El pago fue rechazado. Por favor, intenta nuevamente.');
          }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
          setMessage('Error al verificar el pago. Por favor, contacta soporte.');
          console.error(error);
        }
      }
    };

    if (transactionId && referenceCode && orderId) {
      checkPayment();
    }

    return () => {
      isMounted = false;
    };
  }, [transactionId, referenceCode, orderId, confirmPaymentStatus, fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Exitoso!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-900">Número de Orden:</p>
              <p className="text-xl font-bold text-blue-600">#{orderId}</p>
            </div>
            <button
              onClick={() => navigate(`/user/orders/${orderId}`, { state: { order: orderData } })}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
            >
              Ver Detalles de Orden
            </button>
            <button
              onClick={() => navigate('/restaurants')}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              Continuar Comprando
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Pago Pendiente</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate(`/user/orders/${orderId}`, { state: { order: orderData } })}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition"
            >
              Ver Estado de la Orden
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Pago No Procesado</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate(`/checkout?status=failure`)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
            >
              Intentar Nuevamente
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              Volver al Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
