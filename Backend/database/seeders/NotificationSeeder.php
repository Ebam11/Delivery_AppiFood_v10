<?php

namespace Database\Seeders;

use App\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $notifications = [
            [
                'user_id' => 5,
                'title'   => '¡Tu pedido fue entregado!',
                'message' => 'Tu pedido #1 de Burger House fue entregado exitosamente.',
                'type'    => 'order_status',
                'data'    => ['order_id' => 1],
                'is_read' => true,
            ],
            [
                'user_id' => 5,
                'title'   => '¡Cupón especial para ti!',
                'message' => 'Usa el código BIENVENIDO y obtén 15% de descuento en tu próximo pedido.',
                'type'    => 'promotion',
                'data'    => ['coupon_code' => 'BIENVENIDO'],
                'is_read' => false,
            ],
            [
                'user_id' => 2,
                'title'   => '¡Nuevo pedido recibido!',
                'message' => 'Tienes un nuevo pedido #1 por $38.500.',
                'type'    => 'new_order',
                'data'    => ['order_id' => 1],
                'is_read' => true,
            ],
        ];

        foreach ($notifications as $notification) {
            Notification::updateOrCreate(
                [
                    'user_id' => $notification['user_id'],
                    'title'   => $notification['title'],
                    'type'    => $notification['type'],
                ],
                $notification
            );
        }
    }
}
