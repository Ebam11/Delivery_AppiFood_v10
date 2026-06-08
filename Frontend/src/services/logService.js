/**
 * Servicio centralizado de logging para Frontend
 * 
 * Reemplaza console.log con un sistema estructurado
 * que permite diferentes niveles y contexto automático
 */

const LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
};

// Contexto global
let globalContext = {};

/**
 * Establece contexto global (user_id, etc.)
 */
export const setGlobalContext = (context) => {
  globalContext = { ...globalContext, ...context };
};

/**
 * Obtiene contexto global
 */
export const getGlobalContext = () => globalContext;

/**
 * Limpia contexto global
 */
export const clearGlobalContext = () => {
  globalContext = {};
};

/**
 * Función interna de logging
 */
const log = (level, message, context = {}) => {
  const fullContext = {
    ...globalContext,
    ...context,
    timestamp: new Date().toISOString(),
    level,
  };

  const logMessage = `[${level}] ${message}`;

  // Enviar a servidor (backend) en producción
  if (process.env.NODE_ENV === 'production') {
    sendToBackend(level, message, fullContext);
  }

  // Log en consola con estilos (solo en desarrollo)
  const style = getConsoleStyle(level);
  try {
    if (!import.meta.env.PROD) {
      console.log(`%c${logMessage}`, style, fullContext);
    }
  } catch (e) {
    // Si `import.meta` no está disponible, caer a process.env
    if (process.env.NODE_ENV !== 'production') {
      console.log(`%c${logMessage}`, style, fullContext);
    }
  }
};

/**
 * Log a nivel DEBUG
 */
export const logDebug = (message, context = {}) => {
  log(LEVELS.DEBUG, message, context);
};

/**
 * Log a nivel INFO
 */
export const logInfo = (message, context = {}) => {
  log(LEVELS.INFO, message, context);
};

/**
 * Log a nivel WARNING
 */
export const logWarning = (message, context = {}) => {
  log(LEVELS.WARNING, message, context);
};

/**
 * Log a nivel ERROR
 */
export const logError = (message, context = {}) => {
  log(LEVELS.ERROR, message, context);
};

/**
 * Log a nivel CRITICAL
 */
export const logCritical = (message, context = {}) => {
  log(LEVELS.CRITICAL, message, context);
};

/**
 * Log de acción de usuario
 */
export const logAction = (action, model, modelId, changes = {}) => {
  const message = `Acción: ${action} en ${model}`;
  const context = {
    action,
    model,
    model_id: modelId,
    changes,
    type: 'user_action',
  };
  logInfo(message, context);
};

/**
 * Log de error de API
 */
export const logApiError = (endpoint, message, statusCode, context = {}) => {
  const fullContext = {
    ...context,
    endpoint,
    status_code: statusCode,
    type: 'api_error',
  };

  if (statusCode >= 500) {
    logError(message, fullContext);
  } else {
    logWarning(message, fullContext);
  }
};

/**
 * Log de excepción
 */
export const logException = (error, context = {}) => {
  const fullContext = {
    ...context,
    error_name: error.name,
    error_message: error.message,
    error_stack: error.stack,
    type: 'exception',
  };

  logError(error.message, fullContext);
};

/**
 * Obtiene estilo de consola según nivel
 */
const getConsoleStyle = (level) => {
  const styles = {
    DEBUG: 'color: #888; font-size: 12px;',
    INFO: 'color: #0066cc; font-weight: bold;',
    WARNING: 'color: #ff9800; font-weight: bold;',
    ERROR: 'color: #d32f2f; font-weight: bold;',
    CRITICAL: 'color: #b71c1c; background: #ffebee; font-weight: bold;',
  };

  return styles[level] || 'color: #000;';
};

/**
 * Envía log al backend (en desarrollo/pruebas)
 */
const sendToBackend = async (level, message, context) => {
  try {
    // Aquí se enviaría al backend si es necesario
    // await fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ level, message, context }),
    // });
  } catch (err) {
    // Silenciar errores de logging
    console.warn('Error enviando log al servidor');
  }
};

export default {
  logDebug,
  logInfo,
  logWarning,
  logError,
  logCritical,
  logAction,
  logApiError,
  logException,
  setGlobalContext,
  getGlobalContext,
  clearGlobalContext,
};
