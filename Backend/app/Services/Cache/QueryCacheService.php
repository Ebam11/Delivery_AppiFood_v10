<?php

namespace App\Services\Cache;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Query Cache Service
 *
 * Centralized service for managing query caching with automatic invalidation
 */
class QueryCacheService
{
    /**
     * Cache TTL en minutos
     */
    const CACHE_TTL = 60; // 1 hora por defecto
    const SHORT_CACHE_TTL = 5; // 5 minutos para datos que cambian frecuentemente
    const LONG_CACHE_TTL = 1440; // 24 horas para datos estáticos

    /**
     * Generar clave de caché
     */
    public static function key(string $prefix, mixed $identifier = null): string
    {
        $key = "query:{$prefix}";

        if ($identifier) {
            $key .= ":{$identifier}";
        }

        return $key;
    }

    /**
     * Guardar en caché
     */
    public static function remember(
        string $prefix,
        callable $callback,
        int $ttl = self::CACHE_TTL,
        mixed $identifier = null
    ) {
        $key = self::key($prefix, $identifier);

        try {
            return Cache::remember($key, now()->addMinutes($ttl), $callback);
        } catch (\Exception $e) {
            Log::warning("Cache remember failed for key: {$key}", ['error' => $e->getMessage()]);
            return $callback();
        }
    }

    /**
     * Obtener del caché
     */
    public static function get(string $prefix, mixed $identifier = null)
    {
        $key = self::key($prefix, $identifier);

        try {
            return Cache::get($key);
        } catch (\Exception $e) {
            Log::warning("Cache get failed for key: {$key}", ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Guardar en caché
     */
    public static function put(
        string $prefix,
        mixed $value,
        int $ttl = self::CACHE_TTL,
        mixed $identifier = null
    ): void {
        $key = self::key($prefix, $identifier);

        try {
            Cache::put($key, $value, now()->addMinutes($ttl));
        } catch (\Exception $e) {
            Log::warning("Cache put failed for key: {$key}", ['error' => $e->getMessage()]);
        }
    }

    /**
     * Invalidar caché por patrón
     */
    public static function flush(string $prefix): void
    {
        try {
            // Para Redis, puede usar Pattern Matching
            $pattern = "query:{$prefix}*";
            Cache::tags([$prefix])->flush();

            Log::info("Cache flushed for prefix: {$prefix}");
        } catch (\Exception $e) {
            Log::warning("Cache flush failed for prefix: {$prefix}", ['error' => $e->getMessage()]);
        }
    }

    /**
     * Invalidar caché específico
     */
    public static function forget(string $prefix, mixed $identifier = null): void
    {
        $key = self::key($prefix, $identifier);

        try {
            Cache::forget($key);
            Log::info("Cache forgotten for key: {$key}");
        } catch (\Exception $e) {
            Log::warning("Cache forget failed for key: {$key}", ['error' => $e->getMessage()]);
        }
    }

    /**
     * Obtener estadísticas de caché
     */
    public static function stats(): array
    {
        return [
            'driver' => config('cache.default'),
            'ttl' => self::CACHE_TTL,
            'timestamp' => now(),
        ];
    }
}
