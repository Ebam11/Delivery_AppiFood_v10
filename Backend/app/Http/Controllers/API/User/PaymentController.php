<?php

namespace App\Http\Controllers\API\User;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
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

        if (!$paymentMethodId) {
            return response()->json([
                'message' => 'No hay métodos de pago activos configurados.',
            ], 422);
        }

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'payment_method_id' => $paymentMethodId,
                'amount'            => $order->total,
                'status'            => PaymentStatus::PENDING,
                'external_reference' => 'PAY-' . $order->id . '-' . Str::upper(Str::random(10)),
                'paid_at'           => null,
            ]
        );

        $paymentUrl = '/payment/confirmation/' . $order->id
            . '?transaction_id=' . urlencode((string) $payment->id)
            . '&reference_code=' . urlencode((string) $payment->external_reference);

        return response()->json([
            'message' => 'Pago preparado correctamente.',
            'data'    => $payment->load('method'),
            'payment_url' => $paymentUrl,
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_id' => ['required'],
            'reference_code'  => ['required', 'string'],
        ]);

        $payment = Payment::with('order')
            ->where('external_reference', $request->reference_code)
            ->first();

        if (!$payment || !$payment->order || $payment->order->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No se encontró el pago para confirmar.',
            ], 404);
        }

        $payment->update([
            'status'  => PaymentStatus::COMPLETED,
            'paid_at' => now(),
        ]);

        if ($payment->order->status === OrderStatus::PENDING) {
            $payment->order->transitionTo(OrderStatus::CONFIRMED);
        }

        return response()->json([
            'message' => 'Pago confirmado correctamente.',
            'data'    => $payment->fresh(['method', 'order.items.product', 'order.restaurant']),
        ]);
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
            'VISA'       => ['card'],
            'MASTERCARD' => ['card'],
            'CARD'       => ['card'],
            'CASH'       => ['cash'],
            'NEQUI'      => ['wallet'],
            'DAVIPLATA'  => ['wallet'],
        ];

        $types = $aliases[$normalized] ?? [];

        foreach ($types as $type) {
            $methodId = PaymentMethod::active()->where('type', $type)->value('id');
            if ($methodId) {
                return (int) $methodId;
            }
        }

        return PaymentMethod::active()->value('id');
    }
}
