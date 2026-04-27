<?php

namespace Database\Seeders;

use App\Models\RestaurantCategory;
use Illuminate\Database\Seeder;

class RestaurantCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Restaurantes Locales',  'icon' => '🍽️'],
            ['name' => 'Sopas y Caldos',        'icon' => '🍲'],
            ['name' => 'Asados y Parrilla',     'icon' => '🔥'],
            ['name' => 'Comida Casera',         'icon' => '🥘'],
            ['name' => 'Antojitos Payaneses',   'icon' => '🫓'],
            ['name' => 'Empanadas y Fritos',    'icon' => '🥟'],
            ['name' => 'Tamales',               'icon' => '🫔'],
            ['name' => 'Desayunos Típicos',     'icon' => '🍳'],
            ['name' => 'Panadería y Postres',   'icon' => '🥧'],
            ['name' => 'Bebidas Tradicionales', 'icon' => '🧋'],
            ['name' => 'Pollo Asado',           'icon' => '🍗'],
            ['name' => 'Comida de Mar',         'icon' => '🐟'],
            ['name' => 'Hamburguesas',          'icon' => '🍔'],
            ['name' => 'Pollo',                 'icon' => '🍗'],
            ['name' => 'Mariscos',              'icon' => '🦐'],
            ['name' => 'Italiana',              'icon' => '🍝'],
            ['name' => 'Postres',               'icon' => '🍰'],
            ['name' => 'Desayunos',             'icon' => '🍳'],
            ['name' => 'Pizza',                 'icon' => '🍕'],
            ['name' => 'Japonesa',              'icon' => '🍣'],
            ['name' => 'Parrilla',              'icon' => '🥩'],
            ['name' => 'Mexicana',              'icon' => '🌮'],
            ['name' => 'Saludable',             'icon' => '🥗'],
        ];

        $categoryNames = array_column($categories, 'name');

        foreach ($categories as $category) {
            RestaurantCategory::updateOrCreate(
                ['name' => $category['name']],
                [
                    'icon'      => $category['icon'],
                    'is_active' => true,
                ]
            );
        }

        RestaurantCategory::whereNotIn('name', $categoryNames)->delete();
    }
}
