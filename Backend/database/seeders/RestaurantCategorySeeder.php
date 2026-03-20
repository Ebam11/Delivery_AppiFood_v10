<?php

namespace Database\Seeders;

use App\Models\RestaurantCategory;
use Illuminate\Database\Seeder;

class RestaurantCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Comida Rápida',    'icon' => '🍔'],
            ['name' => 'Pizza',            'icon' => '🍕'],
            ['name' => 'Sushi',            'icon' => '🍣'],
            ['name' => 'Mexicana',         'icon' => '🌮'],
            ['name' => 'Pollo',            'icon' => '🍗'],
            ['name' => 'Mariscos',         'icon' => '🦞'],
            ['name' => 'Italiana',         'icon' => '🍝'],
            ['name' => 'Saludable',        'icon' => '🥗'],
            ['name' => 'Postres',          'icon' => '🍰'],
            ['name' => 'Bebidas',          'icon' => '🧃'],
            ['name' => 'Desayunos',        'icon' => '🍳'],
            ['name' => 'Parrilla',         'icon' => '🥩'],
        ];

        foreach ($categories as $category) {
            RestaurantCategory::updateOrCreate(
                ['name' => $category['name']],
                [
                    'icon'      => $category['icon'],
                    'is_active' => true,
                ]
            );
        }
    }
}
