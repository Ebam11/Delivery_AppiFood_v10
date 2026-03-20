<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            ['name' => 'Efectivo',   'type' => 'cash',   'icon' => '💵', 'is_active' => true],
            ['name' => 'Tarjeta',    'type' => 'card',   'icon' => '💳', 'is_active' => true],
            ['name' => 'Nequi',      'type' => 'wallet', 'icon' => '📱', 'is_active' => true],
            ['name' => 'Daviplata',  'type' => 'wallet', 'icon' => '📲', 'is_active' => true],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(
                ['name' => $method['name']],
                $method
            );
        }
    }
}
