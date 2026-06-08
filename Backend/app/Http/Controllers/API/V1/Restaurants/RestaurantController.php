<?php

namespace App\Http\Controllers\API\V1\Restaurants;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;

/**
 * Restaurant Controller V1
 *
 * Maneja operaciones de lectura de restaurantes
 */
class RestaurantController extends Controller
{
    use ApiResponse;

    /**
     * List All Restaurants
     *
     * @authenticated false
     * @response 200 { "success": true, "data": [...] }
     */
    public function index(): JsonResponse
    {
        try {
            $restaurants = Restaurant::with('products', 'categories')
                ->where('is_active', true)
                ->paginate(20);

            return $this->success(RestaurantResource::collection($restaurants), 'Restaurantes obtenidos');
        } catch (\Exception $e) {
            return $this->error('Error al obtener restaurantes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Restaurant Details
     *
     * @authenticated false
     * @param int $id Restaurant ID
     * @response 200 { "success": true, "data": {...} }
     * @response 404 { "success": false, "message": "Restaurante no encontrado" }
     */
    public function show($id): JsonResponse
    {
        try {
            $restaurant = Restaurant::with('products', 'categories', 'reviews')
                ->where('is_active', true)
                ->findOrFail($id);

            return $this->success(new RestaurantResource($restaurant), 'Restaurante obtenido');
        } catch (\Exception $e) {
            return $this->error('Restaurante no encontrado', 404);
        }
    }
}
