<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

/**
 * Servicio centralizado para logging estructurado
 *
 * Proporciona logs consistentes con contexto automático
 * (user_id, request_id, timestamp, etc.)
 */
class LogService
{
    /**
     * Niveles de log disponibles
     */
    public const LEVEL_DEBUG = 'debug';
    public const LEVEL_INFO = 'info';
    public const LEVEL_WARNING = 'warning';
    public const LEVEL_ERROR = 'error';
    public const LEVEL_CRITICAL = 'critical';

    /**
     * Contexto compartido para todos los logs
     */
    private static array $globalContext = [];

    /**
     * Establece contexto global (user_id, request_id, etc.)
     */
    public static function setGlobalContext(array $context): void
    {
        self::$globalContext = array_merge(self::$globalContext, $context);
    }

    /**
     * Obtiene el contexto global
     */
    public static function getGlobalContext(): array
    {
        return self::$globalContext;
    }

    /**
     * Limpia el contexto global
     */
    public static function clearGlobalContext(): void
    {
        self::$globalContext = [];
    }

    /**
     * Log a nivel DEBUG
     *
     * @param string $message Mensaje a registrar
     * @param array $context Contexto adicional
     */
    public static function debug(string $message, array $context = []): void
    {
        self::log(self::LEVEL_DEBUG, $message, $context);
    }

    /**
     * Log a nivel INFO
     *
     * @param string $message Mensaje a registrar
     * @param array $context Contexto adicional
     */
    public static function info(string $message, array $context = []): void
    {
        self::log(self::LEVEL_INFO, $message, $context);
    }

    /**
     * Log a nivel WARNING
     *
     * @param string $message Mensaje a registrar
     * @param array $context Contexto adicional
     */
    public static function warning(string $message, array $context = []): void
    {
        self::log(self::LEVEL_WARNING, $message, $context);
    }

    /**
     * Log a nivel ERROR
     *
     * @param string $message Mensaje a registrar
     * @param array $context Contexto adicional (puede incluir Exception)
     */
    public static function error(string $message, array $context = []): void
    {
        self::log(self::LEVEL_ERROR, $message, $context);
    }

    /**
     * Log a nivel CRITICAL
     *
     * @param string $message Mensaje a registrar
     * @param array $context Contexto adicional
     */
    public static function critical(string $message, array $context = []): void
    {
        self::log(self::LEVEL_CRITICAL, $message, $context);
    }

    /**
     * Registra una acción de usuario
     *
     * @param string $action Acción realizada (create, update, delete, view)
     * @param string $model Modelo afectado (Order, Product, User, etc.)
     * @param int $modelId ID del modelo
     * @param array $changes Cambios realizados
     */
    public static function logAction(string $action, string $model, int $modelId, array $changes = []): void
    {
        $message = "Acción: {$action} en {$model}";

        $context = [
            'action' => $action,
            'model' => $model,
            'model_id' => $modelId,
            'changes' => $changes,
        ];

        self::info($message, $context);
    }

    /**
     * Registra un error de API
     *
     * @param string $endpoint Endpoint que falló
     * @param string $message Mensaje de error
     * @param int $statusCode Código HTTP
     * @param array $context Contexto adicional
     */
    public static function logApiError(string $endpoint, string $message, int $statusCode, array $context = []): void
    {
        $context = array_merge($context, [
            'endpoint' => $endpoint,
            'status_code' => $statusCode,
            'type' => 'api_error',
        ]);

        if ($statusCode >= 500) {
            self::error($message, $context);
        } else {
            self::warning($message, $context);
        }
    }

    /**
     * Registra una excepción
     *
     * @param \Throwable $exception Excepción a registrar
     * @param array $context Contexto adicional
     */
    public static function logException(\Throwable $exception, array $context = []): void
    {
        $context = array_merge($context, [
            'exception' => get_class($exception),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ]);

        self::error($exception->getMessage(), $context);
    }

    /**
     * Registra una transacción de base de datos
     *
     * @param string $type Tipo (insert, update, delete, query)
     * @param string $table Tabla afectada
     * @param array $data Datos
     */
    public static function logDatabaseTransaction(string $type, string $table, array $data = []): void
    {
        $message = "Transacción BD: {$type} en {$table}";

        $context = [
            'type' => $type,
            'table' => $table,
            'data_keys' => array_keys($data),
        ];

        self::debug($message, $context);
    }

    /**
     * Log interno - Combina contexto global con contexto adicional
     *
     * @param string $level Nivel de log
     * @param string $message Mensaje
     * @param array $context Contexto adicional
     */
    private static function log(string $level, string $message, array $context = []): void
    {
        // Combinar contexto global con contexto adicional
        $fullContext = array_merge(
            self::$globalContext,
            $context,
            [
                'timestamp' => now()->toIso8601String(),
            ]
        );

        // Registrar en Laravel Log
        Log::$level($message, $fullContext);
    }
}
