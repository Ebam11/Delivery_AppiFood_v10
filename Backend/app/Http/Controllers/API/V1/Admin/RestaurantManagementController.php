<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin Restaurant Management Controller V1
 *
 * Maneja operaciones CRUD de restaurantes para administradores
 */
class RestaurantManagementController extends Controller
{
    use ApiResponse;

    /**
     * List All Restaurants (Admin View)
     *
     * @authenticated true
     * @response 200 { "success": true, "data": [...] }
     */
    public function index(): JsonResponse
    {
        try {
            $restaurants = Restaurant::with('user', 'products')
                ->paginate(20);

            return $this->success(RestaurantResource::collection($restaurants), 'Restaurantes obtenidos');
        } catch (\Exception $e) {
            return $this->error('Error al obtener restaurantes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Restaurant Details
     *
     * @authenticated true
     * @param int $id
     * @response 200 { "success": true, "data": {...} }
     */
    public function show($id): JsonResponse
    {
        try {
            $restaurant = Restaurant::with('user', 'products', 'reviews')
                ->findOrFail($id);

            return $this->success(new RestaurantResource($restaurant), 'Restaurante obtenido');
        } catch (\Exception $e) {
            return $this->error('Restaurante no encontrado', 404);
        }
    }

    /**
     * Approve/Reject Restaurant
     *
     * @authenticated true
     * @param int $id
     * @response 200 { "success": true, "message": "Restaurante actualizado" }
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $restaurant = Restaurant::findOrFail($id);

            $validated = $request->validate([
                'is_active'   => 'sometimes|boolean',
                'is_verified' => 'sometimes|boolean',
                'notes'       => 'sometimes|string',
            ]);

            $restaurant->update($validated);

            return $this->success(new RestaurantResource($restaurant), 'Restaurante actualizado exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al actualizar restaurante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete Restaurant
     *
     * @authenticated true
     * @param int $id
     * @response 200 { "success": true, "message": "Restaurante eliminado" }
     */
    public function destroy($id): JsonResponse
    {
        try {
            $restaurant = Restaurant::findOrFail($id);
            $restaurant->delete();

            return $this->success(null, 'Restaurante eliminado exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al eliminar restaurante: ' . $e->getMessage(), 500);
        }
    }
}
