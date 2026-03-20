<?php

namespace Database\Seeders;

use App\Models\Subscription;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $subscriptions = [
            ['restaurant_id' => 1, 'subscription_plan_id' => 2, 'status' => 'active'],
            ['restaurant_id' => 2, 'subscription_plan_id' => 3, 'status' => 'active'],
            ['restaurant_id' => 3, 'subscription_plan_id' => 1, 'status' => 'active'],
        ];

        foreach ($subscriptions as $sub) {
            Subscription::updateOrCreate(
                ['restaurant_id' => $sub['restaurant_id']],
                array_merge($sub, [
                    'starts_at' => now(),
                    'ends_at'   => now()->addMonth(),
                ])
            );
        }
    }
}
