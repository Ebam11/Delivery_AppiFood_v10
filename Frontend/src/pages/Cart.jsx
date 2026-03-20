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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Carrito de Compras</h1>

        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-xl mb-4">
              Tu carrito está vacío
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Explorar Restaurantes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Carrito de items */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4 mb-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {item.product_name}
                    </h3>
                    <p className="text-gray-600">
                      ${item.product_price} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Cantidad */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity - 1)
                        }
                        disabled={isLoading}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isLoading}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="w-24 text-right">
                      <p className="font-bold text-gray-800">
                        ${item.total.toFixed(2)}
                      </p>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeItemFromCart(item.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 font-bold disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen</h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    ${cart.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span className="font-semibold">$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span className="font-semibold text-green-600">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${(cart.total + 5).toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
              >
                Proceder al Pago
              </button>

              <button
                onClick={() => navigate('/restaurants')}
                className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
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
