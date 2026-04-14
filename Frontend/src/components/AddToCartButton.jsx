// Archivo: src/components/AddToCartButton.jsx | Comentario: logica principal del modulo.
import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { ErrorMessage } from './ErrorMessage';

export const AddToCartButton = ({ restaurantId, product }) => {
  const { addItemToCart, error, clearError } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolvedProductId = product?.id ?? product?.product_id;
  const resolvedRestaurantId = restaurantId ?? product?.restaurant_id ?? product?.restaurantId;
  const isMockProduct = Boolean(product?.isMock);

  const handleAddToCart = async () => {
    if (isMockProduct) {
      return;
    }

    if (!resolvedProductId) {
      console.error('No se pudo identificar el producto a agregar al carrito.', product);
      return;
    }

    setIsSubmitting(true);
    clearError();
    try {
      await addItemToCart(resolvedRestaurantId, resolvedProductId, quantity);
      setShowSuccess(true);
      setQuantity(1);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2.5">
      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl font-semibold text-xs text-center">
          ✅ Agregado al carrito
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity === 1 || isSubmitting || isMockProduct}
            className="h-8 w-8 rounded-full border border-gray-300 text-gray-600 text-sm font-bold hover:border-[#FF4B3E] hover:text-[#FF4B3E] disabled:opacity-50 transition"
          >
            −
          </button>
          <span className="flex-1 text-center font-black text-sm text-gray-800 tracking-wide">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            disabled={isSubmitting || isMockProduct}
            className="h-8 w-8 rounded-full bg-[#FF4B3E] text-white text-sm font-bold hover:bg-[#e03a2d] disabled:opacity-50 transition"
          >
            +
          </button>

          <button
            onClick={handleAddToCart}
            disabled={isSubmitting || isMockProduct}
            className="rounded-lg bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] px-3 py-2 text-[11px] font-bold text-white hover:shadow-md hover:shadow-[#FF4B3E]/25 disabled:opacity-50 transition whitespace-nowrap"
          >
            {isMockProduct ? 'Demo' : isSubmitting ? 'Agregando...' : 'Agregar'}
          </button>
        </div>

        {isMockProduct && (
          <p className="text-[11px] text-gray-500 text-center">
            Este producto es de demostración y no se puede agregar al carrito.
          </p>
        )}
      </div>
    </div>
  );
};
