// Archivo: src/components/AddToCartButton.jsx
import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { ErrorMessage } from './ErrorMessage';
import { useTranslation } from 'react-i18next';

export const AddToCartButton = ({ restaurantId, product, compact = false }) => {
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
      console.error('Error agregando producto al carrito:', error?.message || error?.response?.data?.message || 'Error desconocido');
    }
  };

  return (
    <div className={`component-add-to-cart-button ${compact ? 'space-y-1' : 'space-y-2'}`}>
      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      {showSuccess && (
        <div className={`bg-green-50 border-2 border-green-200 text-green-700 rounded-lg font-semibold text-sm text-center ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <i className="fas fa-check-circle mr-1"></i> {t('addToCart.success')}
        </div>
      )}

      <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
        <div className={`flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 ${compact ? 'p-2' : 'p-3'}`}>
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity === 1 || isLoading}
            className={`flex items-center justify-center rounded-full border-2 border-gray-300 font-bold text-gray-600 transition hover:border-[#FF4B3E] hover:text-[#FF4B3E] disabled:opacity-50 ${compact ? 'h-8 w-8 text-sm' : 'h-9 w-9'}`}
          >
            −
          </button>
          <span className={`flex-1 text-center font-bold text-gray-800 ${compact ? 'text-base' : 'text-lg'}`}>
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            disabled={isLoading}
            className={`flex items-center justify-center rounded-full bg-[#FF4B3E] font-bold text-white transition hover:bg-[#e03a2d] disabled:opacity-50 ${compact ? 'h-8 w-8 text-sm' : 'h-9 w-9'}`}
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`w-full rounded-lg bg-gradient-to-r from-[#FF4B3E] to-[#FF6B52] text-white font-bold transition disabled:opacity-50 hover:shadow-lg hover:shadow-[#FF4B3E]/30 ${compact ? 'px-3 py-2 text-sm leading-tight' : 'px-4 py-3 text-base'}`}
        >
          {isLoading ? (
            <span>⏳ {t('addToCart.adding')}</span>
          ) : compact ? (
            <span className="flex items-center justify-center gap-1.5">
              <i className="fas fa-shopping-cart text-xs" /> Agregar
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <i className="fas fa-shopping-cart text-sm" /> {t('addToCart.button')}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};