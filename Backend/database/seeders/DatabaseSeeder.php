<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\FavoriteSeeder;
use Database\Seeders\PaymentMethodSeeder;
use Database\Seeders\RestaurantCategorySeeder;
use Database\Seeders\SubscriptionSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            RestaurantCategorySeeder::class,
            RestaurantSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            AddressSeeder::class,
            SubscriptionPlanSeeder::class,
            SubscriptionSeeder::class,
            PaymentMethodSeeder::class,
            CouponSeeder::class,
            OrderSeeder::class,
            ReviewSeeder::class,
            FavoriteSeeder::class,
            NotificationSeeder::class,
            BannerSeeder::class,
            RestaurantProductsBackfillSeeder::class,
        ]);
    }
}
