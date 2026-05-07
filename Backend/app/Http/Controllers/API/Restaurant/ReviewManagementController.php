<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant;
        
        if (!$restaurant) {
            return response()->json(['message' => 'Restaurante no encontrado.'], 404);
        }

        $reviews = Review::with(['user:id,name,avatar', 'order:id,total'])
            ->where('restaurant_id', $restaurant->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($reviews);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reply' => ['required', 'string', 'max:500'],
        ]);

        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurante no encontrado.'], 404);
        }

        $review = Review::where('id', $id)
            ->where('restaurant_id', $restaurant->id)
            ->firstOrFail();

        $review->update([
            'restaurant_reply' => $request->reply,
        ]);

        return response()->json([
            'message' => 'Respuesta guardada correctamente.',
            'data' => $review
        ]);
    }
}
