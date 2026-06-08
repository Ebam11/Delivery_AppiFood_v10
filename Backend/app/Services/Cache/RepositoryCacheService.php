<?php

namespace App\Services\Cache;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Repository Cache Service
 *
 * Para cachear resultados completos de queries complejas
 */
class RepositoryCacheService
{
    /**
     * Cache restaurants con productos
     */
    public static function getRestaurantsWithProducts(int $ttl = 60): Collection
    {
        return QueryCacheService::remember(
            'restaurants_with_products',
            fn() => \App\Models\Restaurant::with('products', 'categories')
                ->where('is_active', true)
                ->orderBy('rating', 'desc')
                ->limit(100)
                ->get(),
            $ttl,
            'all'
        );
    }

    /**
     * Cache categorías
     */
    public static function getAllCategories(int $ttl = 1440): Collection
    {
        return QueryCacheService::remember(
            'categories',
            fn() => \App\Models\Category::where('is_active', true)->get(),
            $ttl,
            'all'
        );
    }

    /**
     * Cache productos populares
     */
    public static function getPopularProducts(int $limit = 20, int $ttl = 60): Collection
    {
        return QueryCacheService::remember(
            'popular_products',
            fn() => \App\Models\Product::with('restaurant', 'category')
                ->where('is_available', true)
                ->orderBy('rating', 'desc')
                ->limit($limit)
                ->get(),
            $ttl,
            "limit:{$limit}"
        );
    }

    /**
     * Cache productos por restaurante
     */
    public static function getRestaurantProducts(int $restaurantId, int $ttl = 60): Collection
    {
        return QueryCacheService::remember(
            'restaurant_products',
            fn() => \App\Models\Product::where('restaurant_id', $restaurantId)
                ->where('is_available', true)
                ->get(),
            $ttl,
            "restaurant:{$restaurantId}"
        );
    }

    /**
     * Cache productos por categoría
     */
    public static function getCategoryProducts(int $categoryId, int $ttl = 60): Collection
    {
        return QueryCacheService::remember(
            'category_products',
            fn() => \App\Models\Product::where('category_id', $categoryId)
                ->where('is_available', true)
                ->get(),
            $ttl,
            "category:{$categoryId}"
        );
    }

    /**
     * Cache ubicaciones de entrega
     */
    public static function getDeliveryZones(int $ttl = 1440): Collection
    {
        return QueryCacheService::remember(
            'delivery_zones',
            fn() => \App\Models\DeliveryZone::where('is_active', true)->get(),
            $ttl,
            'all'
        );
    }

    /**
     * Cache métodos de pago
     */
    public static function getPaymentMethods(int $ttl = 1440): Collection
    {
        return QueryCacheService::remember(
            'payment_methods',
            fn() => \App\Models\PaymentMethod::where('is_active', true)->get(),
            $ttl,
            'all'
        );
    }

    /**
     * Flush all repository cache
     */
    public static function flushAll(): void
    {
        QueryCacheService::flush('restaurants_with_products');
        QueryCacheService::flush('categories');
        QueryCacheService::flush('popular_products');
        QueryCacheService::flush('restaurant_products');
        QueryCacheService::flush('category_products');
        QueryCacheService::flush('delivery_zones');
        QueryCacheService::flush('payment_methods');

        Log::info('All repository cache flushed');
    }
}
