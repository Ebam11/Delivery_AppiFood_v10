// Archivo: src/pages/Cart.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import '../components/SharedUI.css';

export const Cart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    <div className="page-cart min-h-screen bg-gray-50 dark:bg-slate-950 p-6 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white text-xl"><i className="fas fa-shopping-cart mr-1"></i></span>
          {t('cartPage.title')}
        </h1>

        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-slate-400 text-xl mb-4">
              {t('cartPage.empty')}
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="button-primary"
            >
              {t('cartPage.explore')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 p-6">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg truncate">{item.product_name}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">${item.product_price} {t('cartPage.each')}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-95 text-gray-700 dark:text-slate-200 rounded-full font-bold transition disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-95 text-gray-700 dark:text-slate-200 rounded-full font-bold transition disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Precio Total por Item */}
                    <div className="w-24 text-right">
                      <p className="font-black text-gray-800 dark:text-white text-base">
                        ${Number(item.total || 0).toLocaleString('es-CO')}
                      </p>
                    </div>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => removeItemFromCart(item.id)}
                      disabled={isLoading}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-lg transition disabled:opacity-50"
                    >
                      <i className="fas fa-trash-alt text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-md p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('cartPage.summary')}</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">{t('cartPage.subtotal')}</span>
                  <span className="font-semibold">${Number(cart.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">{t('cartPage.shipping')}</span>
                  <span className="font-semibold">$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">{t('cartPage.discount')}</span>
                  <span className="font-semibold text-green-600">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">{t('cartPage.total')}</span>
                <span className="text-2xl font-bold text-brand">
                  ${Number((cart.total || 0) + (cart.delivery_cost || 5)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={() => navigate('/user/checkout')}
                className="w-full button-primary py-3 rounded-2xl"
              >
                {t('cartPage.checkout')}
              </button>

              <button
                onClick={() => navigate('/restaurants')}
                className="w-full mt-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-850 dark:text-slate-200 font-bold py-3 rounded-2xl transition-all duration-300"
              >
                {t('cartPage.keepShopping')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};