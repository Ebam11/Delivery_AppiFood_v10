<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'current' => [
                    'is_premium' => (bool) $request->user()->is_premium,
                    'plan' => $request->user()->is_premium ? [
                        'id' => 'premium',
                        'name' => 'Premium',
                        'monthly_price' => 7900,
                    ] : null,
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update(['is_premium' => true]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Suscripción activada',
            'message' => 'Ya eres Premium. Ahora tienes acceso a beneficios exclusivos para ahorrar en tus pedidos.',
            'type' => 'subscription',
            'data' => [
                'user_id' => $user->id,
                'status' => 'active',
                'plan' => 'premium',
            ],
        ]);

        return response()->json([
            'message' => 'Suscripción activada correctamente.',
            'data' => [
                'is_premium' => true,
                'plan' => [
                    'id' => 'premium',
                    'name' => 'Premium',
                    'monthly_price' => 7900,
                ],
            ],
        ], 201);
    }

    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['is_premium' => false]);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Suscripción cancelada',
            'message' => 'Tu plan Premium se canceló correctamente.',
            'type' => 'subscription',
            'data' => [
                'user_id' => $user->id,
                'status' => 'cancelled',
                'plan' => 'premium',
            ],
        ]);

        return response()->json([
            'message' => 'Suscripción cancelada correctamente.',
            'data' => [
                'is_premium' => false,
                'plan' => null,
            ],
        ]);
    }
}
