<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\RestaurantSchedule;
use App\Models\DeliveryZone;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = [
            [
                'user_id'           => 2,
                'name'              => 'Burger House',
                'description'       => 'Las mejores hamburguesas de la ciudad, hechas con carne 100% de res.',
                'address'           => 'Calle 15 # 8-23, Popayán',
                'lat'               => 2.4448,
                'lng'               => -76.6147,
                'phone'             => '6028901234',
                'email'             => 'info@burgerhouse.com',
                'delivery_cost'     => 3500,
                'minimum_order'     => 15000,
                'delivery_time_min' => 25,
                'average_rating'    => 4.5,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => [1], // Comida Rápida
                'always_open'       => true, // Siempre abierto (datos de prueba)
            ],
            [
                'user_id'           => 3,
                'name'              => 'Pizza Nostra',
                'description'       => 'Pizza artesanal al horno de leña con ingredientes importados de Italia.',
                'address'           => 'Carrera 7 # 12-45, Popayán',
                'lat'               => 2.4418,
                'lng'               => -76.6117,
                'phone'             => '6028905678',
                'email'             => 'hola@pizzanostra.com',
                'delivery_cost'     => 4000,
                'minimum_order'     => 20000,
                'delivery_time_min' => 35,
                'average_rating'    => 4.8,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => [2], // Pizza
                'always_closed'     => true, // Siempre cerrado (datos de prueba)
            ],
            [
                'user_id'           => 4,
                'name'              => 'Sushi Zen',
                'description'       => 'Auténtica experiencia japonesa con ingredientes frescos del día.',
                'address'           => 'Avenida 3N # 20-10, Popayán',
                'lat'               => 2.4488,
                'lng'               => -76.6177,
                'phone'             => '6028909012',
                'email'             => 'zen@sushizen.com',
                'delivery_cost'     => 5000,
                'minimum_order'     => 30000,
                'delivery_time_min' => 40,
                'average_rating'    => 4.7,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => [3], // Sushi
                'opening_time'      => '12:00:00',
                'closing_time'      => '22:30:00',
                'closed_days'       => ['sunday'],
            ],
        ];

        $days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

        foreach ($restaurants as $data) {
            $categoryIds = $data['categories'];
            $alwaysOpen = $data['always_open'] ?? false;
            $alwaysClosed = $data['always_closed'] ?? false;
            $openingTime = $data['opening_time'] ?? '08:00:00';
            $closingTime = $data['closing_time'] ?? '22:00:00';
            $closedDays = $data['closed_days'] ?? ['sunday'];

            unset($data['categories']);
            unset($data['always_open'], $data['always_closed'], $data['opening_time'], $data['closing_time'], $data['closed_days']);

            $restaurant = Restaurant::updateOrCreate(
                ['email' => $data['email']],
                $data
            );

            // Asignar categorías de restaurante
            $restaurant->restaurantCategories()->sync($categoryIds);

            // Crear horarios (lunes a domingo)
            foreach ($days as $day) {
                $isClosed = in_array($day, $closedDays, true);

                if ($alwaysOpen) {
                    $isClosed = false;
                }

                if ($alwaysClosed) {
                    $isClosed = true;
                }

                RestaurantSchedule::updateOrCreate(
                    [
                        'restaurant_id' => $restaurant->id,
                        'day'           => $day,
                    ],
                    [
                        'opening_time'  => $alwaysOpen ? '00:00:00' : $openingTime,
                        'closing_time'  => $alwaysOpen ? '23:59:59' : $closingTime,
                        'is_closed'     => $isClosed,
                    ]
                );
            }

            // Crear zona de entrega
            DeliveryZone::updateOrCreate(
                [
                    'restaurant_id' => $restaurant->id,
                    'name'          => 'Zona Centro',
                ],
                [
                    'delivery_cost'     => $data['delivery_cost'],
                    'delivery_time_min' => $data['delivery_time_min'],
                    'is_active'         => true,
                ]
            );
        }
    }
}
