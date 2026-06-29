import client from './client';

export const createPayment = async (orderId, paymentMethod = 'co_pse_bank') => {
  const response = await client.post('/payments', { 
    order_id: orderId,
    payment_method: paymentMethod 
  });
  return response.data;
};

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


// Obtener métodos de pago guardados del usuario
export const getUserPaymentMethods = async () => {
  const response = await client.get('/payment-methods');
  return response.data;
};

// Crear nuevo método de pago
export const createUserPaymentMethod = async (methodData) => {
  const response = await client.post('/payment-methods', methodData);
  return response.data;
};

// Actualizar método de pago existente
export const updateUserPaymentMethod = async (paymentMethodId, methodData) => {
  const response = await client.put(`/payment-methods/${paymentMethodId}`, methodData);
  return response.data;
};

// Eliminar método de pago
export const deleteUserPaymentMethod = async (paymentMethodId) => {
  const response = await client.delete(`/payment-methods/${paymentMethodId}`);
  return response.data;
};
