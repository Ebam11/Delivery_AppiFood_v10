// Archivo: src/pages/Checkout.jsx | Comentario: logica principal del modulo.
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { usePaymentStore } from '../store/paymentStore';
import { useAuthStore } from '../store/authStore';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import PayUCheckout from '../components/PayUCheckout';

export const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, clearCartItems } = useCartStore();
  const { createNewOrder, currentOrder } = useOrderStore();
  const { loading, error: paymentError } = usePaymentStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    address: '',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Verificar si hay un error/status de pago en la URL
  const paymentStatus = searchParams.get('status');

  useEffect(() => {
    if (!cart || cart.items?.length === 0) {
      navigate('/cart');
    }
  }, [cart]);

  useEffect(() => {
    if (paymentStatus === 'failure') {
      setError('El pago fue rechazado. Por favor, intenta nuevamente.');
    } else if (paymentStatus === 'pending') {
      setError('Tu pago está pendiente de confirmación. Te notificaremos cuando sea completado.');
    }
  }, [paymentStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Crear orden
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

  if (!cart) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Confirma tu orden</h1>
          <p className="text-gray-500">Paso 1 de 2 — Datos de entrega</p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!orderId ? (
            <form onSubmit={handleCreateOrder} className="space-y-6">
              {/* Datos de envío */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  📍 Dirección de entrega
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Ej: Cra 1 #123-45, Apto 201"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition text-base"
                />
              </div>

              {/* Notas especiales */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  📝 Notas especiales (Opcional)
                </label>
                <textarea
                  name="notes"
                  placeholder="Ej: Sin picante, sin cebolla..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition text-base resize-none"
                />
              </div>

              {/* Resumen del pedido */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  🛒 Resumen del Pedido
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Artículos ({cart.total_items || 0})</span>
                    <span className="font-semibold">COP ${(cart.total || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Envío</span>
                    <span className="font-semibold">COP $5.000</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-3 mt-3">
                    <span className="text-gray-800">Total a pagar</span>
                    <span className="text-[#FF4B3E]">
                      COP ${((cart.total || 0) + 5000).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  ← Volver al carrito
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#FF4B3E]/30 transition disabled:opacity-50"
                >
                  {isProcessing ? '⏳ Creando orden...' : '✓ Continuar al pago'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">
                💳 Completar Pago
              </h2>
              <p className="text-gray-500 mb-8">Orden <span className="font-bold text-[#FF4B3E]">#{orderId}</span></p>
              
              {paymentError && (
                <ErrorMessage message={paymentError} onDismiss={() => {}} />
              )}

              {/* Resumen del pedido */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  🛒 Resumen de tu Orden
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">COP ${(cart.total || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Envío</span>
                    <span className="font-semibold">COP $5.000</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-3">
                    <span className="text-gray-800">Total a Pagar</span>
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
                ← Modificar datos de envío
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
