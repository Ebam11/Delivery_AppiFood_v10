<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Favorite;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = Restaurant::whereHas('favorites', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->with('restaurantCategories')->get();

        return response()->json([
            'data' => RestaurantResource::collection($favorites),
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'restaurant_id' => ['required', 'exists:restaurants,id'],
        ]);

        $user = $request->user();

        $favorite = Favorite::where('user_id', $user->id)
            ->where('restaurant_id', $request->restaurant_id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['message' => 'Eliminado de favoritos.', 'is_favorite' => false]);
        }

        Favorite::create([
            'user_id'       => $user->id,
            'restaurant_id' => $request->restaurant_id,
        ]);

        return response()->json(['message' => 'Agregado a favoritos.', 'is_favorite' => true]);
    }
}