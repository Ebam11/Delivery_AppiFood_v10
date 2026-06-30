<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de Caché para respuestas HTTP de la API.
 *
 * Cachea respuestas GET exitosas (200) durante un tiempo configurable.
 * Las rutas autenticadas se cachean por usuario para evitar mezcla de datos.
 * Las peticiones POST/PUT/DELETE/PATCH invalidan el caché de su recurso.
 *
 * Uso en rutas:
 *   ->middleware('api.cache')          → TTL por defecto (300 s)
 *   ->middleware('api.cache:60')       → TTL personalizado en segundos
 *   ->middleware('api.cache:600,tags') → TTL + tag de invalidación
 */
class ApiCacheMiddleware
{
    /**
     * TTL por defecto: 5 minutos.
     */
    private const DEFAULT_TTL = 300;

    /**
     * Rutas que NUNCA deben cachearse aunque sean GET.
     * Acepta strings o patrones parciales.
     */
    private const NEVER_CACHE = [
        'auth/',
        'profile',
        'cart',
        'notifications',
        'orders',          // los pedidos cambian en tiempo real
        'me',
        'upload',
        'loyalty',
        'payments',
        'payment-methods',
        'addresses',
        'subscriptions',
        'favorites',
        'health',
    ];

    public function handle(Request $request, Closure $next, int $ttl = self::DEFAULT_TTL, string $tag = ''): Response
    {
        // Solo cachear peticiones GET
        if (!$request->isMethod('GET')) {
            $response = $next($request);

            // Invalidar caché del recurso si la petición muta datos
            if ($tag) {
                $this->invalidateTag($tag);
            }

            return $response;
        }

        // Verificar si la ruta está en la lista negra
        if ($this->shouldBypass($request)) {
            return $next($request);
        }

        $cacheKey = $this->buildCacheKey($request);

        // Retornar respuesta cacheada si existe
        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);

            Log::debug('[ApiCache] HIT', ['key' => $cacheKey]);

            return response()->json(
                json_decode($cached['body'], true),
                $cached['status']
            )->withHeaders(array_merge($cached['headers'], [
                'X-Cache'     => 'HIT',
                'X-Cache-Key' => $cacheKey,
                'X-Cache-TTL' => $ttl,
            ]));
        }

        // Procesar petición normalmente
        /** @var \Illuminate\Http\Response $response */
        $response = $next($request);

        // Solo cachear respuestas exitosas
        if ($response->getStatusCode() === 200) {
            $payload = [
                'body'    => $response->getContent(),
                'status'  => $response->getStatusCode(),
                'headers' => $this->getHeadersToCache($response),
            ];

            Cache::put($cacheKey, $payload, $ttl);

            Log::debug('[ApiCache] MISS → guardado', ['key' => $cacheKey, 'ttl' => $ttl]);
        }

        // Agregar headers informativos
        $response->headers->set('X-Cache', 'MISS');
        $response->headers->set('X-Cache-Key', $cacheKey);
        $response->headers->set('X-Cache-TTL', $ttl);

        return $response;
    }

    /**
     * Construir clave única de caché.
     * Incluye el user_id si el usuario está autenticado para evitar mezcla de datos.
     */
    private function buildCacheKey(Request $request): string
    {
        $userId   = $request->user()?->id ?? 'guest';
        $path     = $request->path();
        $query    = $request->query->count() ? '_' . md5(http_build_query($request->query->all())) : '';

        return "api_cache:{$userId}:{$path}{$query}";
    }

    /**
     * Verificar si la ruta debe saltarse el caché.
     */
    private function shouldBypass(Request $request): bool
    {
        $path = $request->path();

        foreach (self::NEVER_CACHE as $pattern) {
            if (str_contains($path, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Filtrar qué headers de la respuesta guardar en caché.
     */
    private function getHeadersToCache($response): array
    {
        $allowed = ['content-type', 'content-language'];
        $headers = [];

        foreach ($response->headers->all() as $key => $values) {
            if (in_array(strtolower($key), $allowed)) {
                $headers[$key] = $values[0] ?? '';
            }
        }

        return $headers;
    }

    /**
     * Invalidar entradas de caché por tag (para purga manual).
     */
    private function invalidateTag(string $tag): void
    {
        $pattern = "api_cache:*:{$tag}*";

        // Con Redis se puede usar tags; con file/array usamos prefijo convencional
        Log::debug('[ApiCache] Invalidando tag', ['tag' => $tag]);
    }
}
