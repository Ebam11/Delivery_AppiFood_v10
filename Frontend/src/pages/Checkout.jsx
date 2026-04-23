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
  const DEFAULT_PAYMENT_METHOD_ID = 1;
  const cartSubtotal = Number(cart?.subtotal || 0);
  const cartTotalWithDelivery = cartSubtotal + 5000;

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
        payment_method_id: DEFAULT_PAYMENT_METHOD_ID,
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
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f6] via-[#fffdfc] to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase font-black text-[#FF4B3E] mb-2">Checkout</p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2">Confirma tu orden</h1>
          <p className="text-gray-500 font-medium">Paso 1 de 2: datos de entrega y verificación</p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {!orderId ? (
            <form onSubmit={handleCreateOrder} className="space-y-6">
              {/* Datos de envío */}
              <div>
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Direccion de entrega
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Ej: Cra 1 #123-45, Apto 201"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition text-base"
                />
              </div>

              {/* Notas especiales */}
              <div>
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Notas especiales (Opcional)
                </label>
                <textarea
                  name="notes"
                  placeholder="Ej: Sin picante, sin cebolla..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF4B3E] focus:ring-2 focus:ring-[#FF4B3E]/10 transition text-base resize-none"
                />
              </div>

              {/* Resumen del pedido */}
              <div className="bg-[#fffaf9] p-6 rounded-2xl border border-[#ffd9d4]">
                <h3 className="font-black text-xl text-gray-900 mb-4">
                  Resumen del Pedido
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Artículos ({cart.total_items || 0})</span>
                    <span className="font-semibold">COP ${cartSubtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Envío</span>
                    <span className="font-semibold">COP $5.000</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t-2 border-[#ffd9d4] pt-3 mt-3">
                    <span className="text-gray-900">Total a pagar</span>
                    <span className="text-[#FF4B3E] text-xl">
                      COP ${cartTotalWithDelivery.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-800 font-bold rounded-2xl hover:bg-gray-50 transition"
                >
                  ← Volver al carrito
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-[#FF4B3E]/30 transition disabled:opacity-50"
                >
                  {isProcessing ? '⏳ Creando orden...' : '✓ Continuar al pago'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">
                Completar Pago
              </h2>
              <p className="text-gray-500 mb-8">Orden <span className="font-bold text-[#FF4B3E]">#{orderId}</span></p>
              
              {paymentError && (
                <ErrorMessage message={paymentError} onDismiss={() => {}} />
              )}

              {/* Resumen del pedido */}
              <div className="bg-[#fffaf9] p-6 rounded-2xl border border-[#ffd9d4] mb-8">
                <h3 className="font-black text-xl text-gray-900 mb-4">
                  Resumen de tu Orden
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">COP ${cartSubtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Envío</span>
                    <span className="font-semibold">COP $5.000</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t-2 border-[#ffd9d4] pt-3">
                    <span className="text-gray-900">Total a Pagar</span>
                    <span className="text-[#FF4B3E] text-xl">
                      COP ${cartTotalWithDelivery.toLocaleString('es-CO')}
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
                className="w-full mt-6 px-4 py-3 text-[#FF4B3E] font-bold hover:bg-red-50 rounded-2xl transition"
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
