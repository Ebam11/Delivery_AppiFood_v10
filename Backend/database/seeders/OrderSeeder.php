<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTracking;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $orders = [
            [
                'user_id'          => 5,
                'restaurant_id'    => 1,
                'delivery_address' => 'Calle 5 # 3-20, Popayán',
                'delivery_lat'     => 2.4428,
                'delivery_lng'     => -76.6137,
                'subtotal'         => 35000,
                'delivery_cost'    => 3500,
                'discount'         => 0,
                'total'            => 38500,
                'status'           => OrderStatus::DELIVERED,
                'notes'            => 'Sin cebolla por favor',
                'items'            => [
                    ['product_id' => 2, 'quantity' => 1, 'unit_price' => 24000, 'subtotal' => 24000],
                    ['product_id' => 6, 'quantity' => 1, 'unit_price' => 10000, 'subtotal' => 10000],
                    ['product_id' => 8, 'quantity' => 1, 'unit_price' => 1000,  'subtotal' => 1000],
                ],
                'payment_method_id' => 1,
            ],
            [
                'user_id'          => 6,
                'restaurant_id'    => 2,
                'delivery_address' => 'Calle 8 # 6-15, Popayán',
                'delivery_lat'     => 2.4458,
                'delivery_lng'     => -76.6157,
                'subtotal'         => 52000,
                'delivery_cost'    => 4000,
                'discount'         => 5000,
                'total'            => 51000,
                'status'           => OrderStatus::DELIVERED,
                'notes'            => null,
                'items'            => [
                    ['product_id' => 11, 'quantity' => 1, 'unit_price' => 28000, 'subtotal' => 28000],
                    ['product_id' => 13, 'quantity' => 1, 'unit_price' => 24000, 'subtotal' => 24000],
                ],
                'payment_method_id' => 2,
            ],
            [
                'user_id'          => 7,
                'restaurant_id'    => 3,
                'delivery_address' => 'Carrera 4 # 10-30, Popayán',
                'delivery_lat'     => 2.4408,
                'delivery_lng'     => -76.6107,
                'subtotal'         => 48000,
                'delivery_cost'    => 5000,
                'discount'         => 0,
                'total'            => 53000,
                'status'           => OrderStatus::PREPARING,
                'notes'            => 'Extra salsa de soya',
                'items'            => [
                    ['product_id' => 19, 'quantity' => 1, 'unit_price' => 26000, 'subtotal' => 26000],
                    ['product_id' => 20, 'quantity' => 1, 'unit_price' => 22000, 'subtotal' => 22000],
                ],
                'payment_method_id' => 3,
            ],
        ];

        foreach ($orders as $orderData) {
            $items           = $orderData['items'];
            $paymentMethodId = $orderData['payment_method_id'];
            unset($orderData['items'], $orderData['payment_method_id']);

            $order = Order::updateOrCreate(
                [
                    'user_id'          => $orderData['user_id'],
                    'restaurant_id'    => $orderData['restaurant_id'],
                    'delivery_address' => $orderData['delivery_address'],
                    'total'            => $orderData['total'],
                ],
                $orderData
            );

            // Crear items
            foreach ($items as $item) {
                OrderItem::updateOrCreate(
                    [
                        'order_id'    => $order->id,
                        'product_id'  => $item['product_id'],
                    ],
                    [
                        'quantity'   => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal'   => $item['subtotal'],
                    ]
                );
            }

            // Crear tracking inicial
            OrderTracking::updateOrCreate(
                [
                    'order_id' => $order->id,
                    'status'   => OrderStatus::PENDING->value,
                ],
                [
                    'changed_at' => now()->subHours(2),
                ]
            );

            // Crear pago
            Payment::updateOrCreate(
                [
                    'order_id' => $order->id,
                ],
                [
                    'payment_method_id' => $paymentMethodId,
                    'amount'            => $orderData['total'],
                    'status'            => 'completed',
                    'paid_at'           => now()->subHour(),
                ]
            );
        }
    }
}
