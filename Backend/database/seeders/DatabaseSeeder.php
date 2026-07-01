<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            RestaurantCategorySeeder::class,
            RestaurantSeeder::class,
            RestaurantDemoAccountsSeeder::class, // Poblar los 5 restaurantes reales por categoría de comida
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
        ]);
    }
}
