<?php

namespace Database\Seeders;

use App\Models\Favorite;
use Illuminate\Database\Seeder;

class FavoriteSeeder extends Seeder
{
    public function run(): void
    {
        $favorites = [
            ['user_id' => 5, 'restaurant_id' => 1],
            ['user_id' => 5, 'restaurant_id' => 2],
            ['user_id' => 6, 'restaurant_id' => 2],
            ['user_id' => 7, 'restaurant_id' => 3],
            ['user_id' => 8, 'restaurant_id' => 1],
        ];

        foreach ($favorites as $favorite) {
            Favorite::updateOrCreate(
                [
                    'user_id'       => $favorite['user_id'],
                    'restaurant_id' => $favorite['restaurant_id'],
                ],
                []
            );
        }
    }
}
