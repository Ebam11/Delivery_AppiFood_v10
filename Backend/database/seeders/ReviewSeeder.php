<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            [
                'user_id'          => 5,
                'restaurant_id'    => 1,
                'order_id'         => 1,
                'rating'           => 5,
                'comment'          => 'Excelente hamburguesa, llegó caliente y bien empacada. La BBQ es espectacular.',
                'restaurant_reply' => '¡Gracias Carlos! Nos alegra que hayas disfrutado tu pedido.',
            ],
            [
                'user_id'          => 6,
                'restaurant_id'    => 2,
                'order_id'         => 2,
                'rating'           => 5,
                'comment'          => 'La pizza Pepperoni es increíble, masa perfecta y muy bien horneada.',
                'restaurant_reply' => null,
            ],
        ];

        foreach ($reviews as $review) {
            Review::updateOrCreate(
                [
                    'user_id'  => $review['user_id'],
                    'order_id' => $review['order_id'],
                ],
                $review
            );
        }
    }
}
