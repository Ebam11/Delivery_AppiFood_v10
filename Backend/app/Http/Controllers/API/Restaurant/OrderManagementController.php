<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Notification;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador para la gestión de pedidos por parte del restaurante.
 * Permite listar, filtrar y actualizar el estado de las órdenes.
 */
class OrderManagementController extends Controller
{
    /**
     * Obtiene el listado de todos los pedidos del restaurante.
     * Permite filtrar por estado y fecha.
     */
    public function index(Request $request): JsonResponse
    {
        // Iniciamos la consulta cargando las relaciones necesarias
        $query = Order::with(['items.product', 'user', 'payment'])
            ->forRestaurant($request->user()->restaurant->id)
            ->latest();

        // Filtramos por estado si se proporciona en la petición
        if ($request->filled('status')) {
            $query->byStatus(OrderStatus::from($request->status));
        }

        // Filtramos por fecha si se proporciona
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Retornamos los resultados paginados para mejorar el rendimiento
        return response()->json(
            OrderResource::collection($query->paginate(15))->response()->getData(true)
        );
    }

    /**
     * Obtiene los pedidos que están actualmente en proceso (no entregados ni cancelados).
     */
    public function active(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'user'])
            ->forRestaurant($request->user()->restaurant->id)
            ->whereNotIn('status', [
                OrderStatus::PENDING->value,
                OrderStatus::DELIVERED->value,
                OrderStatus::CANCELLED->value
            ])
            ->latest()
            ->get();

        return response()->json(['data' => OrderResource::collection($orders)]);
    }

    /**
     * Muestra el detalle completo de un pedido específico.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        // Buscamos el pedido asegurándonos que pertenezca al restaurante autenticado
        $order = Order::with(['items.product', 'user', 'payment.method', 'tracking'])
            ->forRestaurant($request->user()->restaurant->id)
            ->findOrFail($id);

        return response()->json(['data' => new OrderResource($order)]);
    }

    /**
     * Actualiza el estado de un pedido (ej: de 'preparando' a 'en camino').
     * También envía una notificación al cliente final.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        // Validamos que el estado recibido sea válido según nuestro Enum
        $request->validate([
            'status'  => ['required', 'in:' . implode(',', OrderStatus::values())],
            'comment' => ['nullable', 'string', 'max:200'],
        ]);

        $order     = Order::forRestaurant($request->user()->restaurant->id)->findOrFail($id);
        $newStatus = OrderStatus::from($request->status);

        // Verificamos si el cambio de estado es lógico (ej: no se puede cancelar algo ya entregado)
        if (!$order->canTransitionTo($newStatus)) {
            return response()->json([
                'message' => "No se puede cambiar de {$order->status->label()} a {$newStatus->label()}.",
            ], 422);
        }

        // Aplicamos el cambio
        $order->transitionTo($newStatus);

        // Enviamos una notificación en tiempo real al usuario que hizo el pedido
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