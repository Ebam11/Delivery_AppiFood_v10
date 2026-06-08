<?php

namespace App\Traits;

use App\Services\Cache\QueryCacheService;
use Illuminate\Support\Collection;

/**
 * Cacheable Trait
 *
 * Proporciona métodos de caching a los modelos
 *
 * Uso:
 * use Cacheable;
 *
 * protected $cachePrefix = 'products';
 * protected $cacheTime = 60; // minutos
 *
 * // En queries
 * Product::withCache()->get();
 * Product::findCached(1);
 */
trait Cacheable
{

    /**
     * Get cache prefix
     */
    public function getCachePrefix(): string
    {
        if (isset($this->cachePrefix) && $this->cachePrefix) {
            return $this->cachePrefix;
        }

        return strtolower(class_basename($this));
    }

    /**
     * Get cache time in minutes
     */
    public function getCacheTime(): int
    {
        return isset($this->cacheTime) ? (int) $this->cacheTime : QueryCacheService::CACHE_TTL;
    }

    /**
     * Scope: Get with cache
     */
    public function scopeWithCache($query, int $ttl = null)
    {
        // Este scope retorna el query sin modificar
        // El caché se implementa en el nivel de aplicación
        return $query;
    }

    /**
     * Find by ID with cache
     */
    public static function findCached($id)
    {
        $instance = new static();
        $prefix = $instance->getCachePrefix();
        $ttl = $instance->getCacheTime();

        return QueryCacheService::remember(
            $prefix,
            fn() => static::find($id),
            $ttl,
            "id:{$id}"
        );
    }

    /**
     * Find all with cache
     */
    public static function getAllCached(int $ttl = null)
    {
        $instance = new static();
        $prefix = $instance->getCachePrefix();
        $ttl = $ttl ?? $instance->getCacheTime();

        return QueryCacheService::remember(
            $prefix,
            fn() => static::all(),
            $ttl,
            'all'
        );
    }

    /**
     * Flush all cache for this model
     */
    public static function flushCache(): void
    {
        $instance = new static();
        $prefix = $instance->getCachePrefix();
        QueryCacheService::flush($prefix);
    }

    /**
     * Flush specific cache entry
     */
    public static function forgetCache($identifier): void
    {
        $instance = new static();
        $prefix = $instance->getCachePrefix();
        QueryCacheService::forget($prefix, $identifier);
    }

    /**
     * After model is saved, flush cache
     */
    public static function bootCacheable(): void
    {
        static::created(function ($model) {
            $model::flushCache();
        });

        static::updated(function ($model) {
            $model::flushCache();
        });

        static::deleted(function ($model) {
            $model::flushCache();
        });

        // Registrar `restored` solo si el modelo usa SoftDeletes
        $uses = array_keys(class_uses_recursive(static::class));
        if (in_array('Illuminate\\Database\\Eloquent\\SoftDeletes', $uses, true)) {
            static::restored(function ($model) {
                $model::flushCache();
            });
        }
    }
}
