<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
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
                'expires_at'    => now()->addMonths(3),
                'is_active'     => true,
            ],
            [
                'restaurant_id' => 1,          // Solo Burger House
                'code'          => 'BURGER10',
                'type'          => 'percentage',
                'value'         => 10,
                'minimum_order' => 15000,
                'max_uses'      => 50,
                'used_count'    => 0,
                'starts_at'     => now(),
                'expires_at'    => now()->addMonth(),
                'is_active'     => true,
            ],
            [
                'restaurant_id' => 2,          // Solo Pizza Nostra
                'code'          => 'PIZZA5000',
                'type'          => 'fixed',
                'value'         => 5000,
                'minimum_order' => 25000,
                'max_uses'      => 30,
                'used_count'    => 0,
                'starts_at'     => now(),
                'expires_at'    => now()->addMonth(),
                'is_active'     => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(
                ['code' => $coupon['code']],
                $coupon
            );
        }
    }
}
