<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->filled('sort')) {
            $request->merge(['sort' => '-created_at']);
        }

        $restaurants = Restaurant::with('owner', 'restaurantCategories')
            ->included()
            ->filter()
            ->sort()
            ->getOrPaginate();

        return response()->json(
            RestaurantResource::collection($restaurants)->response()->getData(true)
        );
    }

    public function show(int $id): JsonResponse
    {
        $restaurant = Restaurant::with([
            'owner', 'restaurantCategories',
            'subscription.plan', 'reviews',
        ])->included()->findOrFail($id);

        return response()->json(['data' => new RestaurantResource($restaurant)]);
    }

    public function verify(int $id): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update(['is_verified' => !$restaurant->is_verified]);

        return response()->json([
            'message'     => $restaurant->is_verified ? 'Restaurante verificado.' : 'Verificación removida.',
            'is_verified' => $restaurant->is_verified,
        ]);
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update(['is_active' => !$restaurant->is_active]);

        return response()->json([
            'message'   => $restaurant->is_active ? 'Restaurante activado.' : 'Restaurante desactivado.',
            'is_active' => $restaurant->is_active,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Restaurant::findOrFail($id)->delete();
        return response()->json(['message' => 'Restaurante eliminado.']);
    }
}
