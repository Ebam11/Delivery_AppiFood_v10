<?php

namespace App\Http\Controllers\API\User;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Services\RapydService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function methods(): JsonResponse
    {
        $methods = PaymentMethod::active()
            ->orderBy('id')
            ->get(['id', 'name', 'type', 'icon']);

        return response()->json(['data' => $methods]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id'          => ['required', 'exists:orders,id'],
            'payment_method'    => ['nullable', 'string', 'max:50'],
            'payment_method_id' => ['nullable', 'integer', 'exists:payment_methods,id'],
        ]);

        $order = Order::with('payment')
            ->where('user_id', $request->user()->id)
            ->findOrFail($request->order_id);

        $paymentMethodId = $this->resolvePaymentMethodId(
            $request->input('payment_method_id'),
            $request->input('payment_method')
        );

        $reference = 'PAY-' . $order->id . '-' . Str::upper(Str::random(10));

        // SIMULACIÓN DE PAGO AUTOMÁTICO: Marcar como completado directamente
        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'payment_method_id'  => $paymentMethodId,
                'amount'             => $order->total,
                'status'             => PaymentStatus::COMPLETED,
                'external_reference' => $reference,
                'paid_at'            => now(),
            ]
        );

        if ($order->status === OrderStatus::PENDING) {
            $order->transitionTo(OrderStatus::CONFIRMED);
        }

        // Crear la notificación de pago confirmado
        Notification::create([
            'user_id' => $order->user_id,
            'title'   => 'Pago confirmado',
            'message' => "Tu pago del pedido #{$order->id} fue confirmado exitosamente.",
            'type'    => 'payment',
            'data'    => [
                'order_id'   => $order->id,
                'payment_id' => $payment->id,
                'status'     => PaymentStatus::COMPLETED->value,
            ],
        ]);

        // Construir URLs de redirección dinámicas basadas en el origen del cliente para evitar problemas de puerto
        $origin = $request->headers->get('origin') ?: $request->headers->get('referer');
        if ($origin) {
            $frontendUrl = rtrim($origin, '/');
            if (filter_var($frontendUrl, FILTER_VALIDATE_URL)) {
                $parsedUrl = parse_url($frontendUrl);
                $frontendUrl = $parsedUrl['scheme'] . '://' . $parsedUrl['host'] . (isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '');
            }
        } else {
            $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
        }

        $paymentUrl = $frontendUrl . '/payment/confirmation/' . $order->id
            . '?transaction_id=' . $payment->id
            . '&reference_code=' . urlencode($reference)
            . '&status=APPROVED';

        // (simulación de progreso eliminada)

        return response()->json([
            'message'     => 'Pago procesado correctamente (Simulación exitosa).',
            'data'        => $payment->load('method'),
            'payment_url' => $paymentUrl,
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_id' => ['required', 'integer'],
            'reference_code' => ['required', 'string'],
        ]);

        $payment = Payment::with('order')
            ->whereKey($request->integer('transaction_id'))
            ->where('external_reference', $request->reference_code)
            ->first();

        if (!$payment || !$payment->order || $payment->order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No se encontró el pago para confirmar.'], 404);
        }

        // Si el pago ya estaba completado (lo marcó store()), no duplicar notificación
        $wasAlreadyCompleted = $payment->status === PaymentStatus::COMPLETED;

        if (!$wasAlreadyCompleted) {
            $payment->update([
                'status'  => PaymentStatus::COMPLETED,
                'paid_at' => now(),
            ]);

            if ($payment->order->status === OrderStatus::PENDING) {
                $payment->order->transitionTo(OrderStatus::CONFIRMED);
            }

            Notification::create([
                'user_id' => $payment->order->user_id,
                'title'   => 'Pago confirmado',
                'message' => "Tu pago del pedido #{$payment->order->id} fue confirmado.",
                'type'    => 'payment',
                'data'    => [
                    'order_id'   => $payment->order->id,
                    'payment_id' => $payment->id,
                    'status'     => PaymentStatus::COMPLETED->value,
                ],
            ]);
        }

        return response()->json([
            'message' => 'Pago confirmado correctamente.',
            'data'    => $payment->fresh(['method', 'order.items.product', 'order.restaurant']),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $payment = Payment::with(['method', 'order'])->whereKey($id)->first();

        if (!$payment || !$payment->order || $payment->order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No se encontró el pago solicitado.'], 404);
        }

        return response()->json(['data' => $payment]);
    }

    private function resolvePaymentMethodId(mixed $paymentMethodId, ?string $paymentMethod): ?int
    {
        if (is_numeric($paymentMethodId)) {
            $methodId = (int) $paymentMethodId;
            if (PaymentMethod::active()->where('id', $methodId)->exists()) {
                return $methodId;
            }
        }

        $normalized = strtoupper(trim((string) $paymentMethod));

        if ($normalized === '') {
            return PaymentMethod::active()->value('id');
        }

        $aliases = [
            'PSE'        => ['wallet', 'card', 'cash'],
            'NEQUI'      => ['wallet'],
            'DAVIPLATA'  => ['wallet'],
            'EFECTY'     => ['cash'],
            'VISA'       => ['card'],
            'MASTERCARD' => ['card'],
            'CARD'       => ['card'],
            'CASH'       => ['cash'],
        ];

        $types = $aliases[$normalized] ?? [];

        foreach ($types as $type) {
            $methodId = PaymentMethod::active()->where('type', $type)->value('id');
            if ($methodId) return (int) $methodId;
        }

        return PaymentMethod::active()->value('id');
    }
}
