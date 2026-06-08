<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\LogService;
use Ramsey\Uuid\Uuid;

/**
 * Middleware para loguear todas las requests HTTP
 *
 * Genera un request_id único y registra:
 * - Endpoint y método
 * - Usuario autenticado
 * - Status code de respuesta
 * - Tiempo de procesamiento
 */
class LogRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Generar ID único para la request
        $requestId = $request->header('X-Request-ID') ?? (string) Uuid::uuid4();

        // Establecer contexto global
        LogService::setGlobalContext([
            'request_id' => $requestId,
            'user_id' => auth()->id() ?? 'anonymous',
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        // Registrar request entrante
        LogService::debug('Request entrante', [
            'method' => $request->method(),
            'path' => $request->path(),
            'query' => $request->query(),
        ]);

        // Procesar request
        $startTime = microtime(true);
        $response = $next($request);
        $duration = (microtime(true) - $startTime) * 1000; // ms

        // Registrar response
        LogService::info('Request completada', [
            'method' => $request->method(),
            'path' => $request->path(),
            'status_code' => $response->getStatusCode(),
            'duration_ms' => round($duration, 2),
        ]);

        // Agregar request ID al header de response
        $response->header('X-Request-ID', $requestId);

        // Limpiar contexto global
        LogService::clearGlobalContext();

        return $response;
    }
}
