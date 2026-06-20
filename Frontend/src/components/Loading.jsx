// Archivo: src/components/Loading.jsx | Comentario: logica principal del modulo.
import React from 'react';

export const Loading = () => {
  return (
    <div className="component-loading fixed top-16 bottom-0 left-0 right-0 z-40 flex justify-center items-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-[6px] transition-all duration-300">
      <div className="relative h-32 w-32 flex items-center justify-center">
        <div className="animated-burger-loader">
          <div className="burger-layer burger-bun-top" />
          <div className="burger-layer burger-lettuce" />
          <div className="burger-layer burger-cheese" />
          <div className="burger-layer burger-patty" />
          <div className="burger-layer burger-bun-bottom" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
