// Archivo: src/components/ConfirmModal.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center text-red-500 mb-6">
            <i className="fas fa-exclamation-triangle text-2xl" />
          </div>
          
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">
            {title}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex w-full gap-4">
            <button
              onClick={onCancel}
              className="flex-1 border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-3.5 rounded-xl transition text-sm"
            >
              {cancelText || t('modal.cancel') || 'Cancelar'}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-red-500/20"
            >
              {confirmText || t('modal.confirm') || 'Aceptar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
