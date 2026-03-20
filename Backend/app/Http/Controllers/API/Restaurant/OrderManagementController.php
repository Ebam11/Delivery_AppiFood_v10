<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Notification;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.product', 'user', 'payment'])
            ->forRestaurant($request->user()->restaurant->id)
            ->latest();

        if ($request->filled('status')) {
            $query->byStatus(OrderStatus::from($request->status));
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        return response()->json(
            OrderResource::collection($query->paginate(15))->response()->getData(true)
        );
    }

    public function active(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'user'])
            ->forRestaurant($request->user()->restaurant->id)
            ->whereNotIn('status', [OrderStatus::DELIVERED->value, OrderStatus::CANCELLED->value])
            ->latest()
            ->get();

        return response()->json(['data' => OrderResource::collection($orders)]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['items.product', 'user', 'payment.method', 'tracking'])
            ->forRestaurant($request->user()->restaurant->id)
            ->findOrFail($id);

        return response()->json(['data' => new OrderResource($order)]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status'  => ['required', 'in:' . implode(',', OrderStatus::values())],
            'comment' => ['nullable', 'string', 'max:200'],
        ]);

        $order     = Order::forRestaurant($request->user()->restaurant->id)->findOrFail($id);
        $newStatus = OrderStatus::from($request->status);

        if (!$order->canTransitionTo($newStatus)) {
            return response()->json([
                'message' => "No se puede cambiar de {$order->status->label()} a {$newStatus->label()}.",
            ], 422);
        }

        $order->transitionTo($newStatus);

        // Notificar al usuario
        Notification::create([
            'user_id' => $order->user_id,
            'title'   => 'Estado de tu pedido actualizado',
            'message' => "Tu pedido #{$order->id} ahora está: {$newStatus->label()}",
            'type'    => 'order_status',
            'data'    => ['order_id' => $order->id, 'status' => $newStatus->value],
        ]);

        return response()->json([
            'message' => "Pedido actualizado a: {$newStatus->label()}",
            'data'    => new OrderResource($order->fresh()),
        ]);
    }
}