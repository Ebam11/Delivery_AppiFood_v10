<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderMonitorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'restaurant', 'payment'])->latest();

        if ($request->filled('status')) {
            $query->byStatus(OrderStatus::from($request->status));
        }

        if ($request->filled('restaurant_id')) {
            $query->forRestaurant($request->restaurant_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $orders = $query->paginate(20);

        return response()->json(
            OrderResource::collection($orders)->response()->getData(true)
        );
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with([
            'user', 'restaurant', 'items.product',
            'payment.method', 'tracking',
        ])->findOrFail($id);

        return response()->json(['data' => new OrderResource($order)]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:' . implode(',', OrderStatus::values())]
        ]);

        $order = Order::findOrFail($id);

        $newStatus = OrderStatus::from($request->status);

        if (!$order->canTransitionTo($newStatus)) {
            return response()->json([
                'message' => 'Transición de estado no permitida.',
                'current_status' => $order->status->value,
                'requested_status' => $newStatus->value
            ], 422);
        }

        $order->transitionTo($newStatus);

        return response()->json([
            'message' => 'Estado actualizado correctamente.',
            'data' => new OrderResource($order->fresh(['user', 'restaurant', 'payment']))
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Orden eliminada correctamente.']);
    }
}