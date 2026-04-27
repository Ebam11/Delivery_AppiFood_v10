<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\UserSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $currentSubscription = UserSubscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->first();

        $history = UserSubscription::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'current' => $currentSubscription ? [
                'id' => $currentSubscription->id,
                'plan' => $currentSubscription->plan,
                'status' => $currentSubscription->status,
                'price' => $currentSubscription->price,
                'starts_at' => $currentSubscription->starts_at,
                'ends_at' => $currentSubscription->ends_at,
                'days_remaining' => $currentSubscription->getDaysRemaining(),
                'is_active' => $currentSubscription->isActive(),
            ] : null,
            'history' => $history->map(fn($sub) => [
                'id' => $sub->id,
                'plan' => $sub->plan,
                'status' => $sub->status,
                'price' => $sub->price,
                'starts_at' => $sub->starts_at,
                'ends_at' => $sub->ends_at,
                'cancelled_at' => $sub->cancelled_at,
                'duration_days' => $sub->getDurationInDays(),
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $subscription = UserSubscription::create([
            'user_id' => $user->id,
            'plan' => 'premium',
            'status' => 'pending_payment',
            'price' => 7900,
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        return response()->json([
            'message' => 'Suscripción iniciada. Por favor completa el pago.',
            'data' => [
                'id' => $subscription->id,
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'price' => $subscription->price,
                'starts_at' => $subscription->starts_at,
                'ends_at' => $subscription->ends_at,
            ],
        ], 201);
    }

    public function confirm(Request $request, $subscriptionId): JsonResponse
    {
        $user = $request->user();

        $subscription = UserSubscription::where('id', $subscriptionId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $subscription->update([
            'status' => 'active',
            'payment_reference' => $request->input('payment_reference'),
        ]);

        $user->update(['is_premium' => true]);

        Notification::create([
            'user_id' => $user->id,
            'title' => '¡Bienvenido a Premium!',
            'message' => 'Tu suscripción está activa. Comienza a ahorrar en tus pedidos.',
            'type' => 'subscription',
            'data' => [
                'subscription_id' => $subscription->id,
                'plan' => 'premium',
                'status' => 'active',
            ],
        ]);

        return response()->json([
            'message' => 'Suscripción confirmada correctamente.',
            'data' => [
                'id' => $subscription->id,
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'starts_at' => $subscription->starts_at,
                'ends_at' => $subscription->ends_at,
                'is_premium' => true,
            ],
        ]);
    }

    public function cancel(Request $request, $subscriptionId): JsonResponse
    {
        $user = $request->user();

        $subscription = UserSubscription::where('id', $subscriptionId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $activeSubscriptions = UserSubscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->exists();

        if (!$activeSubscriptions) {
            $user->update(['is_premium' => false]);
        }

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Suscripción cancelada',
            'message' => 'Tu plan Premium se canceló. Podrás reactivarlo cuando quieras.',
            'type' => 'subscription',
            'data' => [
                'subscription_id' => $subscription->id,
                'status' => 'cancelled',
            ],
        ]);

        return response()->json([
            'message' => 'Suscripción cancelada correctamente.',
            'data' => [
                'id' => $subscription->id,
                'status' => $subscription->status,
            ],
        ]);
    }
}
