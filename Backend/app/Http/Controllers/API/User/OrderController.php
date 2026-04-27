<?php

namespace App\Http\Controllers\API\User;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Coupon;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTracking;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Restaurant;
use App\Models\ShoppingCart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['restaurant', 'items.product', 'payment'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json(
            OrderResource::collection($orders)->response()->getData(true)
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with([
            'restaurant', 'items.product',
            'payment.method', 'tracking', 'review',
        ])->where('user_id', $request->user()->id)
          ->findOrFail($id);

        return response()->json(['data' => new OrderResource($order)]);
    }

    public function store(Request $request): JsonResponse
    {
        $defaultPaymentMethodId = PaymentMethod::active()->value('id');

        if (!$request->filled('payment_method_id') && $defaultPaymentMethodId) {
            $request->merge([
                'payment_method_id' => $defaultPaymentMethodId,
            ]);
        }

        $request->validate([
            'delivery_address'  => ['required', 'string', 'max:255'],
            'delivery_lat'      => ['nullable', 'numeric'],
            'delivery_lng'      => ['nullable', 'numeric'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'coupon_code'       => ['nullable', 'string'],
            'notes'             => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $cart = ShoppingCart::with('items.product', 'restaurant.schedules')
            ->where('user_id', $user->id)
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'El carrito está vacío.'], 422);
        }

        if (!$cart->restaurant || !$this->isRestaurantOpen($cart->restaurant)) {
            return response()->json([
                'message' => 'El restaurante está cerrado en este momento. Intenta nuevamente dentro del horario de atención.',
            ], 422);
        }

        try {
            $order = DB::transaction(function () use ($user, $cart, $request) {
                $subtotal = $cart->getTotal();

                // Aplicar cupón
                $discount = 0;
                $couponId = null;
                if ($request->filled('coupon_code')) {
                    $coupon = Coupon::where('code', $request->coupon_code)->first();
                    if (!$coupon || !$coupon->isValid()) {
                        throw new \Exception('Cupón inválido o expirado.');
                    }
                    $discount = $coupon->calculateDiscount($subtotal);
                    $couponId = $coupon->id;
                    $coupon->increment('used_count');
                }

                $deliveryCost = $cart->restaurant->delivery_cost ?? 0;
                $total        = $subtotal + $deliveryCost - $discount;

                // Crear pedido
                $order = Order::create([
                    'user_id'          => $user->id,
                    'restaurant_id'    => $cart->restaurant_id,
                    'coupon_id'        => $couponId,
                    'delivery_address' => $request->delivery_address,
                    'delivery_lat'     => $request->delivery_lat,
                    'delivery_lng'     => $request->delivery_lng,
                    'subtotal'         => $subtotal,
                    'delivery_cost'    => $deliveryCost,
                    'discount'         => $discount,
                    'total'            => $total,
                    'status'           => OrderStatus::PENDING,
                    'notes'            => $request->notes,
                ]);

                // Crear items
                foreach ($cart->items as $item) {
                    OrderItem::create([
                        'order_id'   => $order->id,
                        'product_id' => $item->product_id,
                        'quantity'   => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal'   => $item->subtotal,
                        'notes'      => $item->notes,
                    ]);
                }

                // Crear tracking inicial
                OrderTracking::create([
                    'order_id'   => $order->id,
                    'status'     => OrderStatus::PENDING->value,
                    'changed_at' => now(),
                ]);

                // Crear pago
                Payment::create([
                    'order_id'          => $order->id,
                    'payment_method_id' => $request->payment_method_id,
                    'amount'            => $total,
                    'status'            => 'pending',
                ]);

                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'Pedido creado',
                    'message' => "Tu pedido #{$order->id} fue creado correctamente.",
                    'type' => 'order_created',
                    'data' => [
                        'order_id' => $order->id,
                        'restaurant_id' => $order->restaurant_id,
                        'status' => OrderStatus::PENDING->value,
                    ],
                ]);

                // Vaciar carrito
                $cart->clear();

                return $order->load('items.product', 'restaurant', 'payment.method', 'tracking');
            });

            return response()->json([
                'message' => '¡Pedido creado exitosamente!',
                'data'    => new OrderResource($order),
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if (!$order->canTransitionTo(OrderStatus::CANCELLED)) {
            return response()->json([
                'message' => 'Este pedido no puede ser cancelado en su estado actual.',
            ], 422);
        }

        $order->transitionTo(OrderStatus::CANCELLED);

        Notification::create([
            'user_id' => $request->user()->id,
            'title' => 'Pedido cancelado',
            'message' => "Tu pedido #{$order->id} fue cancelado.",
            'type' => 'order_status',
            'data' => [
                'order_id' => $order->id,
                'status' => OrderStatus::CANCELLED->value,
            ],
        ]);

        return response()->json([
            'message' => 'Pedido cancelado.',
            'data'    => new OrderResource($order->fresh()),
        ]);
    }

    private function isRestaurantOpen(Restaurant $restaurant): bool
    {
        $today = strtolower(now()->englishDayOfWeek);

        $schedule = $restaurant->schedules->firstWhere('day', $today);

        if (!$schedule) {
            return false;
        }

        return $schedule->isOpenNow();
    }
}
