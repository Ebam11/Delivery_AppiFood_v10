<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener IDs reales de restaurantes de la base de datos
        $burgerHouse = \App\Models\Restaurant::where('name', 'Burger House')->first();
        $pizzaNostra = \App\Models\Restaurant::where('name', 'Pizza Nostra')->first();

        $coupons = [
            [
                'restaurant_id' => null,       // Global para todos
                'code'          => 'BIENVENIDO',
                'type'          => 'percentage',
                'value'         => 15,
                'minimum_order' => 20000,
                'max_uses'      => 100,
                'used_count'    => 0,
                'starts_at'     => now(),
                'expires_at'    => now()->addMonths(6),
                'is_active'     => true,
            ],
            [
                'restaurant_id' => null,       // Global para todos
                'code'          => 'APPIFOOD20',
                'type'          => 'percentage',
                'value'         => 20,
                'minimum_order' => 30000,
                'max_uses'      => 200,
                'used_count'    => 0,
                'starts_at'     => now(),
                'expires_at'    => now()->addMonths(6),
                'is_active'     => true,
            ],
            [
                'restaurant_id' => null,       // Global para todos
                'code'          => 'DESCUENTO5K',
                'type'          => 'fixed',
                'value'         => 5000,
                'minimum_order' => 25000,
                'max_uses'      => 150,
                'used_count'    => 0,
                'starts_at'     => now(),
                'expires_at'    => now()->addMonths(6),
                'is_active'     => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(
                ['code' => $coupon['code']],
                $coupon
            );
        }

        // Crear una oferta de cupón propia para todos los demás restaurantes
        $allRestaurants = \App\Models\Restaurant::all();
        foreach ($allRestaurants as $r) {
            // Generar un código único usando parte del nombre del restaurante
            $cleanName = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $r->name));
            $prefix = substr($cleanName, 0, 8);
            if (empty($prefix)) {
                $prefix = 'REST' . $r->id;
            }
            $code = $prefix . '15';

            Coupon::updateOrCreate(
                ['code' => $code],
                [
                    'restaurant_id' => $r->id,
                    'code'          => $code,
                    'type'          => 'percentage',
                    'value'         => 15,
                    'minimum_order' => $r->minimum_order ?? 15000,
                    'max_uses'      => 100,
                    'used_count'    => 0,
                    'starts_at'     => now(),
                    'expires_at'    => now()->addMonths(6),
                    'is_active'     => true,
                ]
            );
        }
    }
}
