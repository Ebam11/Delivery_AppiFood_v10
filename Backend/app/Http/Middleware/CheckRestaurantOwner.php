<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRestaurantOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $restaurant = $request->route('restaurant');

        if (!$user || !$restaurant) {
            return response()->json([
                'message' => 'Recurso no disponible.',
            ], 404);
        }

        if ((int) $restaurant->user_id !== (int) $user->id) {
            return response()->json([
                'message' => 'No autorizado para gestionar este restaurante.',
            ], 403);
        }

        return $next($request);
    }
}
