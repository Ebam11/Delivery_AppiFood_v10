<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LoyaltyController extends Controller
{
    public function redeem(Request $request): JsonResponse
    {
        $request->validate([
            'reward_type' => ['required', 'string', 'in:bronze,silver,gold,diamond'],
        ]);

        $user = $request->user();

        // Define options for rewards
        $rewards = [
            'bronze' => [
                'points' => 100,
                'value' => 5000,
                'type' => 'fixed',
                'label' => 'Cupón de $5,000 COP'
            ],
            'silver' => [
                'points' => 250,
                'value' => 15000,
                'type' => 'fixed',
                'label' => 'Cupón de $15,000 COP'
            ],
            'gold' => [
                'points' => 500,
                'value' => 35000,
                'type' => 'fixed',
                'label' => 'Cupón de $35,000 COP'
            ],
            'diamond' => [
                'points' => 1000,
                'value' => 80000,
                'type' => 'fixed',
                'label' => 'Cupón de $80,000 COP'
            ],
        ];

        $selected = $rewards[$request->reward_type];

        if ($user->points < $selected['points']) {
            return response()->json([
                'message' => 'No tienes suficientes puntos para reclamar este cupón.',
            ], 422);
        }

        // Deduct points
        $user->decrement('points', $selected['points']);

        // Generate unique coupon code
        $code = 'LOYAL-' . Str::upper(Str::random(8));

        // Create coupon in DB (restaurant_id is null for global platform coupons)
        $coupon = Coupon::create([
            'restaurant_id' => null,
            'code' => $code,
            'type' => $selected['type'],
            'value' => $selected['value'],
            'minimum_order' => 0,
            'max_uses' => 1,
            'used_count' => 0,
            'starts_at' => now(),
            'expires_at' => now()->addDays(30),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => '¡Cupón redimido correctamente!',
            'data' => [
                'code' => $code,
                'value' => $selected['value'],
                'expires_at' => $coupon->expires_at->toDateString(),
                'user_points' => $user->fresh()->points,
            ],
        ]);
    }
}
