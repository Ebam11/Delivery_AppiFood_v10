// Archivo: src/components/PaymentMethodSelector.jsx | Comentario: logica principal del modulo.
import React from 'react';
import { usePaymentStore } from '../store/paymentStore';
import { useCartStore } from '../store/cartStore';

export default function PaymentMethodSelector({ orderId }) {
  const { createPayment, loading, error } = usePaymentStore();
  const { cart } = useCartStore();
  const cartSubtotal = Number(cart?.subtotal || 0);
  const cartTotalWithDelivery = cartSubtotal + 5000;
  const [selectedMethod, setSelectedMethod] = React.useState('pse');

  const paymentMethods = [
    {
      id: 'pse',
      name: 'PSE (Pagos Seguros en Línea)',
      description: 'El método más rápido y seguro en Colombia',
      icon: '🏦',
      info: 'Confirma directamente desde tu app de banca móvil',
      recommend: true,
    },
    {
      id: 'credit_card',
      name: 'Tarjeta de Crédito',
      description: 'VISA, Mastercard, American Express',
      icon: '💳',
      info: 'Pago seguro con encriptación',
      recommend: false,
    },
    {
      id: 'debit_card',
      name: 'Tarjeta Débito',
      description: 'Débito directo de tu cuenta bancaria',
      icon: '🏧',
      info: 'Fondos se debitan inmediatamente',
      recommend: false,
    },
  ];

  const handlePayment = async () => {
    try {
      if (!orderId) {
        throw new Error('No se encontró la orden para iniciar el pago.');
      }

      const response = await createPayment(orderId, selectedMethod);

      if (response?.payment_url) {
        window.location.href = response.payment_url;
        return;
      }

      throw new Error('No se recibió URL de pago desde el servidor.');
    } catch (err) {
      console.error('Error al procesar pago:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Selecciona tu Método de Pago</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <input
              type="radio"
              id={method.id}
              name="payment-method"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => setSelectedMethod(method.id)}
              className="sr-only"
            />
            <label
              htmlFor={method.id}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start">
                <div className="text-3xl mr-4">{method.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-800">{method.name}</h4>
                    {method.recommend && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">{method.info}</p>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Nota sobre PSE */}
      {selectedMethod === 'pse' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> PSE es el metodo mas popular en Colombia. Una vez autorices el pago, 
            recibirás una notificación en tu app de banca móvil para confirmar.
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700 font-semibold">Resumen</p>
        <div className="flex justify-between mt-2">
          <span className="text-gray-600">Total a pagar:</span>
          <span className="font-bold text-lg text-blue-600">COP ${cartTotalWithDelivery.toLocaleString('es-CO')}</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        {loading ? '⏳ Procesando...' : 'Continuar al Pago'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔒 Tu información está protegida por Mercado Pago
      </p>
    </div>
  );
}
