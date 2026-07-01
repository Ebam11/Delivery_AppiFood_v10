<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RestaurantController extends Controller
{
    // Tiempo de caché en segundos (5 minutos)
    private const CACHE_TTL = 300;

    public function index(Request $request): JsonResponse
    {
        // Clave de caché basada en los parámetros del request
        // Así cada combinación de filtros tiene su propia caché
        $cacheKey = 'restaurants:list:' . md5($request->getQueryString() ?? 'all');

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request) {
            $restaurants = Restaurant::with([
                    'restaurantCategories',
                    'schedules',
                    'categories' => fn($q) => $q->active()->ordered(),
                    'categories.products' => fn($q) => $q->available(),
                ])
                ->active()
                ->verified()
                ->included()
                ->filter()
                ->sort()
                ->getOrPaginate();

            return RestaurantResource::collection($restaurants)->response()->getData(true);
        });

        return response()->json($data);
    }

    public function show(int $id): JsonResponse
    {
        // Caché individual por restaurante (10 minutos, se invalida al actualizar)
        $cacheKey = "restaurants:show:{$id}";

        $data = Cache::remember($cacheKey, self::CACHE_TTL * 2, function () use ($id) {
            $restaurant = Restaurant::with([
                'restaurantCategories',
                'schedules',
                'categories' => fn($q) => $q->active()->ordered(),
                'categories.products' => fn($q) => $q->available(),
            ])->findOrFail($id);

            return ['data' => new RestaurantResource($restaurant)];
        });

        return response()->json($data);
    }

    public static function clearRestaurantCache(int $restaurantId): void
    {
        Cache::forget("restaurants:show:{$restaurantId}");
        // Limpiamos toda la caché para forzar la actualización del listado sin fallar por driver de archivo
        Cache::flush();
    }
}
