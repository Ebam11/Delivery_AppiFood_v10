// Archivo: src/api/payment.js | Comentario: logica principal del modulo.
import client from './client';

// Crear transacción en PayU
export const createPayment = async (orderId, paymentMethod = 'PSE') => {
  const response = await client.post('/payments', { 
    order_id: orderId,
    payment_method: paymentMethod 
  });
  return response.data;
};

// Confirmar pago después del callback de PayU
export const confirmPayment = async (transactionId, referenceCode) => {
  const response = await client.post('/payments/confirm', { 
    transaction_id: transactionId,
    reference_code: referenceCode 
  });
  return response.data;
};

// Obtener métodos de pago disponibles
export const getPaymentMethods = async () => {
  const response = await client.get('/payments/methods');
  return response.data;
};

// Obtener estado de pago
export const getPaymentStatus = async (paymentId) => {
  const response = await client.get(`/payments/${paymentId}`);
  return response.data;
};
