<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador para obtener las estadísticas rápidas del Dashboard del restaurante.
 */
class DashboardController extends Controller
{
    /**
     * Retorna un resumen de métricas clave (pedidos, ingresos, productos y rating).
     */
    public function __invoke(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant;

        // Verificamos que el usuario tenga un restaurante asociado
        if (!$restaurant) {
            return response()->json(['message' => 'No tienes un restaurante registrado.'], 404);
        }

        $restaurantId = $restaurant->id;

        // Recopilamos las estadísticas de forma estructurada
        $stats = [
            'orders' => [
                'total'    => Order::forRestaurant($restaurantId)->count(),
                'today'    => Order::forRestaurant($restaurantId)->whereDate('created_at', today())->count(),
                'pending'  => Order::forRestaurant($restaurantId)->byStatus(OrderStatus::PENDING)->count(),
                'preparing'=> Order::forRestaurant($restaurantId)->byStatus(OrderStatus::PREPARING)->count(),
            ],
            'revenue' => [
                'total'      => Order::forRestaurant($restaurantId)->byStatus(OrderStatus::DELIVERED)->sum('total'),
                'today'      => Order::forRestaurant($restaurantId)->byStatus(OrderStatus::DELIVERED)->whereDate('created_at', today())->sum('total'),
                'this_month' => Order::forRestaurant($restaurantId)->byStatus(OrderStatus::DELIVERED)->whereMonth('created_at', now()->month)->sum('total'),
            ],
            'products' => [
                'total'     => $restaurant->products()->count(),
                'available' => $restaurant->products()->where('is_available', true)->count(),
            ],
            'rating' => [
                'average' => $restaurant->average_rating,
                'total'   => $restaurant->total_reviews,
            ],
        ];

        return response()->json(['data' => $stats]);
    }
}