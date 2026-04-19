<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
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

        return response()->json(
            RestaurantResource::collection($restaurants)->response()->getData(true)
        );
    }

    public function show(int $id): JsonResponse
    {
        $restaurant = Restaurant::with([
            'restaurantCategories',
            'schedules',
            'categories' => fn($q) => $q->active()->ordered(),
            'categories.products' => fn($q) => $q->available(),
        ])->findOrFail($id);

        return response()->json([
            'data' => new RestaurantResource($restaurant),
        ]);
    }
}
