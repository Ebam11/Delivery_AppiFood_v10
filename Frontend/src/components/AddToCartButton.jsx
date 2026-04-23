// Archivo: src/components/AddToCartButton.jsx | Comentario: logica principal del modulo.
import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { ErrorMessage } from './ErrorMessage';
import { useTranslation } from 'react-i18next';

export const AddToCartButton = ({ restaurantId, product }) => {
  const { addItemToCart, isLoading, error, clearError } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useTranslation();

  const handleAddToCart = async () => {
    clearError();
    try {
      await addItemToCart(restaurantId, product.id, quantity);
      setShowSuccess(true);
      setQuantity(1);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-2">
      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg font-semibold text-sm text-center">
          ✅ {t('addToCart.success')}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity === 1 || isLoading}
            className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 font-bold hover:border-[#FF4B3E] hover:text-[#FF4B3E] disabled:opacity-50 transition"
          >
            −
          </button>
          <span className="flex-1 text-center font-bold text-lg text-gray-800">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-[#FF4B3E] text-white flex items-center justify-center font-bold hover:bg-[#e03a2d] disabled:opacity-50 transition"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] hover:shadow-lg hover:shadow-[#FF4B3E]/30 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 text-base"
        >
          {isLoading
            ? `⏳ ${t('addToCart.adding')}`
            : `🛒 ${t('addToCart.button')}`}
        </button>
      </div>
    </div>
  );
};