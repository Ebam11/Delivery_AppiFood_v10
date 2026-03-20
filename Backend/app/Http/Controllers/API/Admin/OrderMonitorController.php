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
}