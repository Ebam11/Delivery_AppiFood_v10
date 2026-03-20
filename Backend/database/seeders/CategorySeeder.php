<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Burger House (restaurant_id: 1)
        $burgerCategories = ['Hamburguesas', 'Papas y Acompañamientos', 'Bebidas', 'Postres'];
        foreach ($burgerCategories as $index => $name) {
            Category::updateOrCreate(
                [
                    'restaurant_id' => 1,
                    'name'          => $name,
                ],
                [
                    'order'     => $index + 1,
                    'is_active' => true,
                ]
            );
        }

        // Pizza Nostra (restaurant_id: 2)
        $pizzaCategories = ['Pizzas', 'Pastas', 'Entradas', 'Bebidas'];
        foreach ($pizzaCategories as $index => $name) {
            Category::updateOrCreate(
                [
                    'restaurant_id' => 2,
                    'name'          => $name,
                ],
                [
                    'order'     => $index + 1,
                    'is_active' => true,
                ]
            );
        }

        // Sushi Zen (restaurant_id: 3)
        $sushiCategories = ['Rolls', 'Nigiri', 'Entradas', 'Bebidas'];
        foreach ($sushiCategories as $index => $name) {
            Category::updateOrCreate(
                [
                    'restaurant_id' => 3,
                    'name'          => $name,
                ],
                [
                    'order'     => $index + 1,
                    'is_active' => true,
                ]
            );
        }
    }
}
