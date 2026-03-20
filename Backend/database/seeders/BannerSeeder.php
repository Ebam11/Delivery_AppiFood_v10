<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title'     => '¡Pide tu comida favorita!',
                'image'     => 'banners/banner1.jpg',
                'url'       => '/restaurants',
                'order'     => 1,
                'is_active' => true,
                'starts_at' => now(),
                'ends_at'   => now()->addMonths(3),
            ],
            [
                'title'     => '15% de descuento con BIENVENIDO',
                'image'     => 'banners/banner2.jpg',
                'url'       => '/restaurants',
                'order'     => 2,
                'is_active' => true,
                'starts_at' => now(),
                'ends_at'   => now()->addMonths(3),
            ],
            [
                'title'     => 'Sushi Zen - Auténtica comida japonesa',
                'image'     => 'banners/banner3.jpg',
                'url'       => '/restaurants/3',
                'order'     => 3,
                'is_active' => true,
                'starts_at' => now(),
                'ends_at'   => now()->addMonth(),
            ],
        ];

        foreach ($banners as $banner) {
            Banner::updateOrCreate(
                ['order' => $banner['order']],
                $banner
            );
        }
    }
}
