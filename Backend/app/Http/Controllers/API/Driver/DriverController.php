<?php

namespace App\Http\Controllers\API\Driver;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Notification;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador para la gestión de entregas por parte del repartidor (driver).
 * Permite listar pedidos disponibles, aceptarlos, actualizar ubicación GPS
 * y completar la entrega otorgando puntos de fidelidad al cliente.
 */
class DriverController extends Controller
{
    /**
     * Lista los pedidos confirmados o en preparación que aún no tienen repartidor asignado.
     * Estos son los pedidos que el driver puede tomar.
     */
    public function availableOrders(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'user', 'restaurant'])
            ->whereNull('driver_id')
            ->whereIn('status', [
                OrderStatus::CONFIRMED->value,
                OrderStatus::PREPARING->value,
            ])
            ->latest()
            ->paginate(20);

        return response()->json(
            OrderResource::collection($orders)->response()->getData(true)
        );
    }

    /**
     * Lista los pedidos activos del repartidor (asignados y no completados).
     */
    public function myOrders(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'user', 'restaurant'])
            ->where('driver_id', $request->user()->id)
            ->whereNotIn('status', [
                OrderStatus::DELIVERED->value,
                OrderStatus::CANCELLED->value,
            ])
            ->latest()
            ->get();

        return response()->json(['data' => OrderResource::collection($orders)]);
    }

    /**
     * Historial de pedidos entregados por el repartidor.
     */
    public function history(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'user', 'restaurant'])
            ->where('driver_id', $request->user()->id)
            ->whereIn('status', [
                OrderStatus::DELIVERED->value,
                OrderStatus::CANCELLED->value,
            ])
            ->latest()
            ->paginate(20);

        return response()->json(
            OrderResource::collection($orders)->response()->getData(true)
        );
    }

    /**
     * El repartidor acepta un pedido disponible.
     * Se asigna el driver_id y se cambia el estado a 'on_the_way'.
     */
    public function acceptOrder(Request $request, int $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);

        // Verificar que el pedido no tenga ya un repartidor asignado
        if ($order->driver_id !== null) {
            return response()->json([
                'message' => 'Este pedido ya fue tomado por otro repartidor.',
            ], 409);
        }

        // Solo se pueden aceptar pedidos confirmados o en preparación
        if (!in_array($order->status, [OrderStatus::CONFIRMED, OrderStatus::PREPARING])) {
            return response()->json([
                'message' => 'Este pedido no está disponible para ser aceptado.',
            ], 422);
        }

        // Asignar el repartidor
        $order->update([
            'driver_id' => $request->user()->id,
        ]);

        // Transicionar a "en camino" si está en estado PREPARING
        if ($order->status === OrderStatus::PREPARING) {
            $order->transitionTo(OrderStatus::ON_THE_WAY);
        }

        // Notificar al cliente
        Notification::create([
            'user_id' => $order->user_id,
            'title'   => 'Repartidor asignado',
            'message' => "Un repartidor ha sido asignado a tu pedido #{$order->id}. ¡Tu pedido va en camino!",
            'type'    => 'order_status',
            'data'    => [
                'order_id'    => $order->id,
                'driver_name' => $request->user()->name,
                'status'      => $order->fresh()->status->value,
            ],
        ]);

        return response()->json([
            'message' => 'Pedido aceptado exitosamente.',
            'data'    => new OrderResource($order->fresh()->load(['items.product', 'user', 'restaurant'])),
        ]);
    }

    /**
     * Actualiza las coordenadas GPS del repartidor para un pedido en curso.
     * El cliente puede usar estos datos para ver la ubicación en tiempo real.
     */
    public function updateLocation(Request $request, int $orderId): JsonResponse
    {
        $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $order = Order::where('driver_id', $request->user()->id)
            ->where('id', $orderId)
            ->firstOrFail();

        // Solo actualizar ubicación para pedidos en camino
        if ($order->status !== OrderStatus::ON_THE_WAY) {
            return response()->json([
                'message' => 'Solo se puede actualizar la ubicación de pedidos en camino.',
            ], 422);
        }

        $order->update([
            'driver_lat' => $request->lat,
            'driver_lng' => $request->lng,
        ]);

        return response()->json([
            'message' => 'Ubicación actualizada.',
            'data'    => [
                'driver_lat' => $order->driver_lat,
                'driver_lng' => $order->driver_lng,
            ],
        ]);
    }

    /**
     * Obtener la ubicación del repartidor para un pedido (endpoint público para el cliente).
     */
    public function getLocation(int $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);

        if ($order->status !== OrderStatus::ON_THE_WAY || $order->driver_id === null) {
            return response()->json([
                'message' => 'No hay ubicación disponible para este pedido.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'driver_lat'  => $order->driver_lat,
                'driver_lng'  => $order->driver_lng,
                'updated_at'  => $order->updated_at->toDateTimeString(),
            ],
        ]);
    }

    /**
     * El repartidor marca un pedido como entregado.
     * Se cambia el estado a 'delivered' y se otorgan puntos de fidelidad al cliente.
     * Regla de puntos: 1 punto por cada $1.000 del total del pedido.
     */
    public function completeOrder(Request $request, int $orderId): JsonResponse
    {
        $order = Order::where('driver_id', $request->user()->id)
            ->where('id', $orderId)
            ->firstOrFail();

        // Verificar que el pedido esté en camino
        if ($order->status !== OrderStatus::ON_THE_WAY) {
            return response()->json([
                'message' => 'Solo se puede completar un pedido que esté en camino.',
            ], 422);
        }

        // Transicionar a entregado
        $order->transitionTo(OrderStatus::DELIVERED);

        // Calcular y otorgar puntos de fidelidad al cliente
        $pointsEarned = (int) floor($order->total / 1000);
        if ($pointsEarned > 0) {
            $customer = $order->user;
            $customer->increment('points', $pointsEarned);
        }

        // Notificar al cliente que su pedido fue entregado
        Notification::create([
            'user_id' => $order->user_id,
            'title'   => '¡Pedido entregado!',
            'message' => "Tu pedido #{$order->id} ha sido entregado exitosamente." .
                         ($pointsEarned > 0 ? " ¡Ganaste {$pointsEarned} puntos de fidelidad!" : ''),
            'type'    => 'order_status',
            'data'    => [
                'order_id'      => $order->id,
                'status'        => OrderStatus::DELIVERED->value,
                'points_earned' => $pointsEarned,
            ],
        ]);

        return response()->json([
            'message'       => 'Pedido entregado exitosamente.',
            'points_earned' => $pointsEarned,
            'data'          => new OrderResource($order->fresh()->load(['items.product', 'user', 'restaurant'])),
        ]);
    }

    /**
     * Obtiene las estadísticas del repartidor (entregas hoy, total, puntos otorgados).
     */
    public function stats(Request $request): JsonResponse
    {
        $driverId = $request->user()->id;

        $deliveriesToday = Order::where('driver_id', $driverId)
            ->byStatus(OrderStatus::DELIVERED)
            ->whereDate('updated_at', today())
            ->count();

        $deliveriesTotal = Order::where('driver_id', $driverId)
            ->byStatus(OrderStatus::DELIVERED)
            ->count();

        $activeOrders = Order::where('driver_id', $driverId)
            ->whereNotIn('status', [
                OrderStatus::DELIVERED->value,
                OrderStatus::CANCELLED->value,
            ])
            ->count();

        $earningsToday = Order::where('driver_id', $driverId)
            ->byStatus(OrderStatus::DELIVERED)
            ->whereDate('updated_at', today())
            ->sum('delivery_cost');

        return response()->json([
            'data' => [
                'deliveries_today' => $deliveriesToday,
                'deliveries_total' => $deliveriesTotal,
                'active_orders'    => $activeOrders,
                'earnings_today'   => (float) $earningsToday,
            ],
        ]);
    }
}
