// Archivo: src/components/Loading.jsx | Comentario: logica principal del modulo.
import React from 'react';

export const Loading = () => {
  return (
    <div className="component-loading flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default Loading;
