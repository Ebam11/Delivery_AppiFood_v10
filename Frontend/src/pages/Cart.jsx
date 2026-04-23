// Archivo: src/pages/Cart.jsx | Comentario: logica principal del modulo.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';

export const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    isLoading,
    error,
    fetchCart,
    updateItemQuantity,
    removeItemFromCart,
    clearError,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  if (isLoading) return <Loading />;

  const subtotal = Number(cart?.subtotal || 0);
  const delivery = 5000;
  const total = subtotal + delivery;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f6] via-[#fffdfc] to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase font-black text-[#FF4B3E] mb-2">Tu pedido</p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900">Carrito de Compras</h1>
          <p className="text-gray-500 mt-2">Revisa tus productos antes de continuar al pago.</p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-600 text-xl mb-5">
              Tu carrito está vacío
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] hover:shadow-lg hover:shadow-[#FF4B3E]/25 text-white font-bold py-3 px-7 rounded-xl transition"
            >
              Explorar Restaurantes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
            {/* Carrito de items */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-7">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-4 mb-4 last:mb-0"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      ${Number(item.unit_price || 0).toLocaleString('es-CO')} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 pl-4">
                    {/* Cantidad */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-2 py-1">
                      <button
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity - 1)
                        }
                        disabled={isLoading}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isLoading}
                        className="w-8 h-8 rounded-full bg-[#FF4B3E] hover:bg-[#e03a2d] text-white disabled:opacity-50 font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="w-28 text-right">
                      <p className="font-black text-[#FF4B3E]">
                        ${Number(item.subtotal || 0).toLocaleString('es-CO')}
                      </p>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeItemFromCart(item.id)}
                      disabled={isLoading}
                      className="w-8 h-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 font-bold disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 h-fit sticky top-6">
              <h2 className="text-2xl font-black text-gray-900 mb-4">Resumen</h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    ${subtotal.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío:</span>
                  <span className="font-semibold">${delivery.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Descuento:</span>
                  <span className="font-semibold text-green-600">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-black text-gray-900">Total:</span>
                <span className="text-3xl font-black text-[#FF4B3E]">
                  ${total.toLocaleString('es-CO')}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] hover:shadow-lg hover:shadow-[#FF4B3E]/25 text-white font-bold py-3.5 rounded-xl transition"
              >
                Proceder al Pago
              </button>

              <button
                onClick={() => navigate('/restaurants')}
                className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl transition"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
