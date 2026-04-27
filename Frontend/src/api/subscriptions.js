// Archivo: src/api/subscriptions.js | Comentario: logica principal del modulo.
import client from './client';

export const getSubscriptionPlans = async () => {
  return Promise.resolve({
    data: [
      { id: 'free', name: 'Gratis', price: 0 },
      { id: 'premium', name: 'Premium Ahorro', price: 7900 },
    ],
  });
};

export const getCurrentSubscription = async () => {
  const response = await client.get('/subscriptions');
  return response.data;
};

export const createSubscription = async (planId) => {
  const response = await client.post('/subscriptions', {
    plan: planId,
  });
  return response.data;
};

export const confirmSubscription = async (subscriptionId, paymentReference) => {
  const response = await client.post(`/subscriptions/${subscriptionId}/confirm`, {
    payment_reference: paymentReference,
  });
  return response.data;
};

export const cancelSubscription = async (subscriptionId) => {
  const response = await client.patch(`/subscriptions/${subscriptionId}/cancel`);
  return response.data;
};