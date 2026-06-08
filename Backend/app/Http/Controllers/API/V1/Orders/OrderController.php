<?php

namespace App\Http\Controllers\API\V1\Orders;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Order Controller V1
 *
 * Maneja operaciones CRUD de órdenes
 */
class OrderController extends Controller
{
    use ApiResponse;

    /**
     * List User Orders
     *
     * @authenticated true
     * @response 200 { "success": true, "data": [...] }
     */
    public function index(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $orders = Order::where('user_id', $user->id)
                ->with('restaurant', 'items')
                ->latest()
                ->paginate(15);

            return $this->success(OrderResource::collection($orders), 'Órdenes obtenidas');
        } catch (\Exception $e) {
            return $this->error('Error al obtener órdenes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Order Details
     *
     * @authenticated true
     * @param int $id Order ID
     * @response 200 { "success": true, "data": {...} }
     * @response 404 { "success": false, "message": "Orden no encontrada" }
     */
    public function show($id): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $order = Order::where('user_id', $user->id)
                ->with('restaurant', 'items', 'payment')
                ->findOrFail($id);

            return $this->success(new OrderResource($order), 'Orden obtenida');
        } catch (\Exception $e) {
            return $this->error('Orden no encontrada', 404);
        }
    }

    /**
     * Create Order
     *
     * @authenticated true
     * @bodyParam restaurant_id integer El ID del restaurante
     * @bodyParam items array Los items de la orden
     * @bodyParam address_id integer El ID de la dirección
     * @response 201 { "success": true, "data": {...} }
     * @response 422 { "success": false, "message": "Validation errors" }
     */
    public function store(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $validated = $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'items'         => 'required|array',
                'address_id'    => 'required|exists:addresses,id',
                'notes'         => 'nullable|string',
                'payment_method' => 'required|in:cash,card,wallet',
            ]);

            // Lógica para crear orden (simplificada)
            $order = Order::create([
                'user_id'       => $user->id,
                'restaurant_id' => $validated['restaurant_id'],
                'address_id'    => $validated['address_id'],
                'notes'         => $validated['notes'] ?? null,
                'status'        => 'pending',
                'total'         => 0, // Calcular desde items
            ]);

            return $this->success(new OrderResource($order), 'Orden creada exitosamente', 201);
        } catch (\Exception $e) {
            return $this->error('Error al crear orden: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update Order
     *
     * @authenticated true
     * @param int $id Order ID
     * @response 200 { "success": true, "data": {...} }
     * @response 404 { "success": false, "message": "Orden no encontrada" }
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $order = Order::where('user_id', $user->id)->findOrFail($id);

            $validated = $request->validate([
                'notes' => 'sometimes|string',
            ]);

            $order->update($validated);

            return $this->success(new OrderResource($order), 'Orden actualizada exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al actualizar orden: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel Order
     *
     * @authenticated true
     * @param int $id Order ID
     * @response 200 { "success": true, "message": "Orden cancelada" }
     * @response 404 { "success": false, "message": "Orden no encontrada" }
     */
    public function destroy($id): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $order = Order::where('user_id', $user->id)->findOrFail($id);

            if ($order->status !== 'pending') {
                return $this->error('Solo se pueden cancelar órdenes pendientes', 422);
            }

            $order->update(['status' => 'cancelled']);

            return $this->success(null, 'Orden cancelada exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al cancelar orden: ' . $e->getMessage(), 500);
        }
    }
}
