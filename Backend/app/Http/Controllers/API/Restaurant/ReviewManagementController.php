<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

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

    public function toggleVisibility(Request $request, int $id): JsonResponse
    {
        $restaurant = $request->user()->restaurant;
        if (!$restaurant) {
            return response()->json(['message' => 'Restaurante no encontrado.'], 404);
        }

        $review = Review::where('id', $id)
            ->where('restaurant_id', $restaurant->id)
            ->firstOrFail();

        // Si la columna is_visible o status existe
        if (Schema::hasColumn('reviews', 'is_visible')) {
            $review->update(['is_visible' => !$review->is_visible]);
        } else {
            $review->update(['comment' => $review->comment ? null : '[Comentario ocultado por el restaurante]']);
        }

        return response()->json([
            'message' => 'Visibilidad de reseña actualizada.',
            'data' => $review
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $restaurant = $request->user()->restaurant;
        if (!$restaurant) {
            return response()->json(['message' => 'Restaurante no encontrado.'], 404);
        }

        $review = Review::where('id', $id)
            ->where('restaurant_id', $restaurant->id)
            ->firstOrFail();

        $review->delete();

        return response()->json(['message' => 'Reseña eliminada correctamente.']);
    }
}
