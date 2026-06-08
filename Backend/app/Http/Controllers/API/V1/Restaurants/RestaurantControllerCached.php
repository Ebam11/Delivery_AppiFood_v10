<?php

namespace App\Http\Controllers\API\V1\Restaurants;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Services\Cache\RepositoryCacheService;
use Illuminate\Http\JsonResponse;

/**
 * Restaurant Controller V1 - WITH CACHING
 *
 * Maneja operaciones de lectura de restaurantes con caché
 */
class RestaurantController extends Controller
{
    use ApiResponse;

    /**
     * List All Restaurants (CACHED)
     *
     * @authenticated false
     * @response 200 { "success": true, "data": [...] }
     */
    public function index(): JsonResponse
    {
        try {
            // Usar caché para restaurantes con productos
            $restaurants = RepositoryCacheService::getRestaurantsWithProducts(ttl: 60);

            return $this->success(
                RestaurantResource::collection($restaurants),
                'Restaurantes obtenidos (desde caché)'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener restaurantes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Restaurant Details (CACHED)
     *
     * @authenticated false
     * @param int $id Restaurant ID
     * @response 200 { "success": true, "data": {...} }
     * @response 404 { "success": false, "message": "Restaurante no encontrado" }
     */
    public function show($id): JsonResponse
    {
        try {
            // Usar caché para restaurante individual
            $restaurant = Restaurant::findCached($id);

            if (!$restaurant || !$restaurant->is_active) {
                return $this->error('Restaurante no encontrado', 404);
            }

            return $this->success(
                new RestaurantResource($restaurant),
                'Restaurante obtenido (desde caché)'
            );
        } catch (\Exception $e) {
            return $this->error('Restaurante no encontrado', 404);
        }
    }
}
