import React, { Component } from 'react';
import { logException } from '../services/logService';

/**
 * Error Boundary Component
 * 
 * Captura errores de React y muestra UI amigable
 * Evita que un error en un componente derribe toda la app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar state para que el siguiente render muestre fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generar ID único para el error
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Registrar error
    logException(error, {
      componentStack: errorInfo.componentStack,
      error_id: errorId,
      boundary_name: this.props.name || 'ErrorBoundary',
    });

    // Actualizar state con detalles del error
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Enviar a servicio de monitoreo si es necesario
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo, errorId);
    }
  }

  reportErrorToService = async (error, errorInfo, errorId) => {
    try {
      // Aquí se enviaría a un servicio de error tracking (Sentry, etc.)
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     error: error.toString(),
      //     stack: error.stack,
      //     componentStack: errorInfo.componentStack,
      //     errorId,
      //   }),
      // });
    } catch (err) {
      console.error('Error reportando error:', err);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            {/* Icono de error */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Algo salió mal
            </h1>

            {/* Descripción */}
            <p className="text-gray-600 text-center mb-4">
              Disculpa, hemos encontrado un error inesperado. 
              Nuestro equipo ha sido notificado automáticamente.
            </p>

            {/* ID del error */}
            {this.state.errorId && (
              <div className="bg-gray-50 rounded p-3 mb-4">
                <p className="text-xs text-gray-600 font-mono">
                  ID de error: <br />
                  <code>{this.state.errorId}</code>
                </p>
              </div>
            )}

            {/* Detalles del error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 rounded p-3 mb-4 max-h-40 overflow-auto">
                <p className="text-xs font-mono text-red-600 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <p className="text-xs font-mono text-gray-600 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                Intentar de nuevo
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition"
              >
                Ir al inicio
              </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Si el problema persiste, contacta a soporte@appifood.com
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
