<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de Rate Limiting avanzado para la API.
 *
 * Implementa rate limiting por IP + usuario (autenticado o no),
 * con ventanas deslizantes y respuestas 429 detalladas.
 *
 * Perfiles predefinidos de límites:
 *   - 'strict'   → 10 req/min  (login, registro, recuperación de contraseña)
 *   - 'normal'   → 60 req/min  (endpoints autenticados estándar)
 *   - 'relaxed'  → 200 req/min (endpoints de solo lectura públicos)
 *   - 'critical' → 3 req/min   (acciones sensibles: pagos, pedidos)
 *
 * Uso en rutas:
 *   ->middleware('rate.limit')           → perfil 'normal' (60/min)
 *   ->middleware('rate.limit:strict')    → 10/min
 *   ->middleware('rate.limit:relaxed')   → 200/min
 *   ->middleware('rate.limit:critical')  → 3/min
 *   ->middleware('rate.limit:30,2')      → 30 req cada 2 min (custom)
 */
class RateLimitMiddleware
{
    /**
     * Perfiles de límite predefinidos [intentos, minutos].
     */
    private const PROFILES = [
        'strict'   => [10,  1],
        'normal'   => [60,  1],
        'relaxed'  => [200, 1],
        'critical' => [3,   1],
    ];

    public function __construct(protected RateLimiter $limiter)
    {
    }

    public function handle(
        Request $request,
        Closure $next,
        string  $profile = 'normal',
        int     $decayMinutes = 1
    ): Response {
        // Resolver configuración del perfil
        [$maxAttempts, $decay] = $this->resolveProfile($profile, $decayMinutes);

        // Construir clave única por IP + usuario autenticado (o solo IP si es invitado)
        $key = $this->buildKey($request, $profile);

        // Verificar si ya superó el límite
        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            return $this->buildThrottleResponse($request, $key, $maxAttempts, $decay);
        }

        // Registrar intento con ventana deslizante
        $this->limiter->hit($key, $decay * 60);

        // Procesar la petición normal
        $response = $next($request);

        // Agregar headers de rate limit a toda respuesta
        return $this->addRateLimitHeaders($response, $key, $maxAttempts);
    }

    /**
     * Resolver el perfil de límite: puede ser nombre predefinido o "N,M" (intentos,minutos).
     *
     * @return array{0: int, 1: int}
     */
    private function resolveProfile(string $profile, int $defaultDecay): array
    {
        // Formato numérico personalizado "intentos,minutos"
        if (is_numeric($profile)) {
            return [(int) $profile, $defaultDecay];
        }

        // Nombre de perfil predefinido
        if (isset(self::PROFILES[$profile])) {
            return self::PROFILES[$profile];
        }

        // Fallback al perfil normal
        Log::warning("[RateLimit] Perfil desconocido: '{$profile}', usando 'normal'.");
        return self::PROFILES['normal'];
    }

    /**
     * Construir clave de rate limit única por IP + usuario.
     * Los usuarios autenticados tienen un bucket propio (no compartido con otros).
     */
    private function buildKey(Request $request, string $profile): string
    {
        $userId = $request->user()?->id
            ? "user:{$request->user()->id}"
            : "ip:{$request->ip()}";

        return "rate_limit:{$profile}:{$userId}";
    }

    /**
     * Construir respuesta 429 con información detallada y headers estándar.
     */
    private function buildThrottleResponse(Request $request, string $key, int $maxAttempts, int $decayMinutes): Response
    {
        $retryAfter  = $this->limiter->availableIn($key);
        $ip          = $request->ip();
        $path        = $request->path();
        $userId      = $request->user()?->id ?? 'guest';

        Log::warning('[RateLimit] Límite superado', [
            'ip'     => $ip,
            'user'   => $userId,
            'path'   => $path,
            'key'    => $key,
        ]);

        return response()->json([
            'success'     => false,
            'message'     => 'Demasiadas solicitudes. Por favor espera antes de intentarlo de nuevo.',
            'retry_after' => $retryAfter,
            'limit'       => $maxAttempts,
            'window'      => "{$decayMinutes} min",
        ], Response::HTTP_TOO_MANY_REQUESTS)->withHeaders([
            'X-RateLimit-Limit'     => $maxAttempts,
            'X-RateLimit-Remaining' => 0,
            'X-RateLimit-Reset'     => now()->addSeconds($retryAfter)->timestamp,
            'Retry-After'           => $retryAfter,
        ]);
    }

    /**
     * Agregar headers estándar de rate limit a respuestas exitosas.
     */
    private function addRateLimitHeaders(Response $response, string $key, int $maxAttempts): Response
    {
        $remaining = max(0, $maxAttempts - $this->limiter->attempts($key));

        $response->headers->set('X-RateLimit-Limit',     $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', $remaining);

        return $response;
    }
}
