<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function indexPublic(int $restaurantId): JsonResponse
    {
        $reviews = Review::with('user:id,name,avatar')
            ->included()
            ->filter()
            ->where('restaurant_id', $restaurantId)
            ->sort()
            ->getOrPaginate();

        return $this->respondCollection($reviews);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id'  => ['required', 'exists:orders,id'],
            'rating'    => ['required', 'integer', 'min:1', 'max:5'],
            'comment'   => ['nullable', 'string', 'max:500'],
        ]);

        $order = Order::where('id', $request->order_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Verificar que el pedido fue entregado
        if ($order->status->value !== 'delivered') {
            return response()->json([
                'message' => 'Solo puedes reseñar pedidos entregados.',
            ], 422);
        }

        // Verificar que no haya reseña previa
        if ($order->review) {
            return response()->json([
                'message' => 'Ya dejaste una reseña para este pedido.',
            ], 422);
        }

        // 1. Filtro de palabras altisonantes (Profanity Filter)
        if (!empty($request->comment)) {
            $badWords = [
                'puta', 'puto', 'mierda', 'pendejo', 'pendeja', 'idiota', 'estupido', 'estúpido', 'estupida', 'estúpida',
                'imbecil', 'imbécil', 'cabron', 'cabrón', 'maricon', 'maricón', 'malparido', 'gonorrea', 'hijueputa',
                'pirobo', 'carechimba', 'perra', 'zorra', 'bastardo', 'culero', 'chinga', 'verga', 'pene', 'culo',
                'matar', 'muerte', 'amenaza', 'golpear', 'sangre', 'asqueroso', 'basura'
            ];

            $commentLower = strtolower($request->comment);
            foreach ($badWords as $word) {
                // Buscamos la palabra exacta o como subcadena dependiendo del nivel de estrictez
                if (preg_match('/\b' . preg_quote($word, '/') . '\b/i', $commentLower)) {
                    return response()->json([
                        'message' => 'Tu comentario contiene lenguaje inapropiado o palabras prohibidas y fue rechazado. Por favor, mantén un lenguaje respetuoso.',
                    ], 422);
                }
            }
        }

        $review = Review::create([
            'user_id'       => $request->user()->id,
            'restaurant_id' => $order->restaurant_id,
            'order_id'      => $order->id,
            'rating'        => $request->rating,
            'comment'       => $request->comment,
        ]);

        // 2. Actualizar el promedio del restaurante
        $order->restaurant->updateRating();

        return response()->json([
            'message' => 'Reseña enviada. ¡Gracias por tu opinión!',
            'data'    => $review,
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $review = Review::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $restaurant = $review->restaurant;
        
        $review->delete();

        // Actualizar el promedio del restaurante al eliminar una reseña
        if ($restaurant) {
            $restaurant->updateRating();
        }

        return response()->json(['message' => 'Reseña eliminada.']);
    }

    private function respondCollection($result): JsonResponse
    {
        if ($result instanceof Paginator) {
            return response()->json($result);
        }

        return response()->json(['data' => $result]);
    }
}
