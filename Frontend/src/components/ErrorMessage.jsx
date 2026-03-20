// Archivo: src/components/ErrorMessage.jsx | Comentario: logica principal del modulo.
import React from 'react';

export const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <span className="block sm:inline">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 right-0 px-4 py-3"
        >
          ✕
        </button>
      )}
    </div>
  );
};
