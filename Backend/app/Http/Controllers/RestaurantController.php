<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    /**
     * Obtener lista de restaurantes con sus horarios
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Restaurant::query()
                ->where('is_active', true)
                ->where('is_verified', true)
                ->with(['schedules']);

            $restaurants = $query->get();

            // Transformar datos
            $data = $restaurants->map(function ($restaurant) {
                return [
                    'id' => $restaurant->id,
                    'name' => $restaurant->name,
                    'description' => $restaurant->description,
                    'address' => $restaurant->address,
                    'phone' => $restaurant->phone,
                    'email' => $restaurant->email,
                    'logo' => $restaurant->logo,
                    'banner' => $restaurant->banner,
                    'image' => $restaurant->banner ?? $restaurant->logo,
                    'rating' => $restaurant->average_rating ?? 0,
                    'average_rating' => $restaurant->average_rating ?? 0,
                    'delivery_cost' => $restaurant->delivery_cost ?? 0,
                    'delivery' => $restaurant->delivery_cost ?? 0,
                    'delivery_time_min' => $restaurant->delivery_time_min ?? 20,
                    'delivery_time_max' => $restaurant->delivery_time_max ?? 30,
                    'time' => ($restaurant->delivery_time_min ?? 20) . '-' . ($restaurant->delivery_time_max ?? 30) . ' min',
                    'is_open' => $this->isRestaurantOpen($restaurant),
                    'is_active' => $restaurant->is_active,
                    'is_verified' => $restaurant->is_verified,
                    'lat' => $restaurant->latitude,
                    'lng' => $restaurant->longitude,
                    'latitude' => $restaurant->latitude,
                    'longitude' => $restaurant->longitude,
                    'categories' => $restaurant->categories ?? [],
                    'schedule' => $restaurant->schedules?->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'day' => $item->day,
                            'opening_time' => $item->opening_time,
                            'closing_time' => $item->closing_time,
                            'is_closed' => (bool)$item->is_closed,
                        ];
                    })->toArray() ?? [],
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'data' => $data,
                'count' => count($data),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener restaurantes: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener detalle de un restaurante
     */
    public function show(int $id): JsonResponse
    {
        try {
            $restaurant = Restaurant::with(['schedules', 'products', 'reviews'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $restaurant->id,
                    'name' => $restaurant->name,
                    'description' => $restaurant->description,
                    'address' => $restaurant->address,
                    'phone' => $restaurant->phone,
                    'email' => $restaurant->email,
                    'logo' => $restaurant->logo,
                    'banner' => $restaurant->banner,
                    'image' => $restaurant->banner ?? $restaurant->logo,
                    'rating' => $restaurant->average_rating ?? 0,
                    'average_rating' => $restaurant->average_rating ?? 0,
                    'delivery_cost' => $restaurant->delivery_cost ?? 0,
                    'delivery' => $restaurant->delivery_cost ?? 0,
                    'delivery_time_min' => $restaurant->delivery_time_min ?? 20,
                    'delivery_time_max' => $restaurant->delivery_time_max ?? 30,
                    'is_open' => $this->isRestaurantOpen($restaurant),
                    'is_active' => $restaurant->is_active,
                    'is_verified' => $restaurant->is_verified,
                    'lat' => $restaurant->latitude,
                    'lng' => $restaurant->longitude,
                    'categories' => $restaurant->categories ?? [],
                    'schedule' => $restaurant->schedules?->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'day' => $item->day,
                            'opening_time' => $item->opening_time,
                            'closing_time' => $item->closing_time,
                            'is_closed' => (bool)$item->is_closed,
                        ];
                    })->toArray() ?? [],
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurante no encontrado',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener restaurante: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verificar si un restaurante está abierto ahora
     */
    private function isRestaurantOpen(Restaurant $restaurant): bool
    {
        if (!$restaurant->schedules || $restaurant->schedules->isEmpty()) {
            return true; // Si no tiene horario, asumimos que está abierto
        }

        $now = new \DateTime();
        $dayOfWeek = (int)$now->format('w'); // 0 = domingo, 6 = sábado

        // Mapear a los nombres de días usados en la base de datos
        $daysNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $todayDayName = $daysNames[$dayOfWeek];

        $currentTime = $now->format('H:i');

        $todaySchedule = $restaurant->schedules->firstWhere('day', $todayDayName);

        if (!$todaySchedule || $todaySchedule->is_closed) {
            return false;
        }

        return $currentTime >= $todaySchedule->opening_time &&
               $currentTime <= $todaySchedule->closing_time;
    }
}
