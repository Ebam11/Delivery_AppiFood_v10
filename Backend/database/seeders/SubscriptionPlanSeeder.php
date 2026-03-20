<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'                  => 'Básico',
                'monthly_price'         => 49900,
                'annual_price'          => 499000,
                'max_products'          => 20,
                'commission_percentage' => 10.00,
                'features'              => [
                    'Hasta 20 productos',
                    'Panel de administración',
                    'Soporte por email',
                ],
                'is_active' => true,
            ],
            [
                'name'                  => 'Pro',
                'monthly_price'         => 99900,
                'annual_price'          => 999000,
                'max_products'          => 100,
                'commission_percentage' => 7.00,
                'features'             => [
                    'Hasta 100 productos',
                    'Panel de administración',
                    'Estadísticas avanzadas',
                    'Soporte prioritario',
                    'Cupones de descuento',
                ],
                'is_active' => true,
            ],
            [
                'name'                  => 'Premium',
                'monthly_price'         => 199900,
                'annual_price'          => 1999000,
                'max_products'          => 0, // ilimitado
                'commission_percentage' => 5.00,
                'features'             => [
                    'Productos ilimitados',
                    'Panel de administración',
                    'Estadísticas avanzadas',
                    'Soporte 24/7',
                    'Cupones de descuento',
                    'Banners publicitarios',
                    'Zonas de entrega múltiples',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['name' => $plan['name']],
                $plan
            );
        }
    }
}
