<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = [
            'Burger House' => ['Hamburguesas', 'Papas y Acompañamientos', 'Bebidas', 'Postres'],
            'Pizza Nostra' => ['Pizzas', 'Pastas', 'Entradas', 'Bebidas'],
            'Sushi Zen' => ['Rolls', 'Nigiri', 'Entradas', 'Bebidas'],
            'Parrilla del Valle' => ['Cortes', 'Acompañamientos', 'Bebidas', 'Postres'],
            'Tacos del Valle' => ['Tacos', 'Entradas', 'Bebidas', 'Postres'],
            'Verde Fresco' => ['Bowls', 'Wraps', 'Jugos', 'Postres'],
            'Pollo Dorado' => ['Pollo Asado', 'Broaster', 'Acompañamientos', 'Bebidas'],
            'Mariscos del Puerto' => ['Ceviches', 'Mariscos', 'Pescados', 'Bebidas'],
            'Trattoria Bella' => ['Pizzas', 'Pastas', 'Entradas', 'Bebidas'],
            'Dulce Tentación' => ['Tortas', 'Postres', 'Helados', 'Bebidas'],
            'Café Madrugón' => ['Desayunos', 'Panadería', 'Café', 'Jugos'],
            'Barra Fresca' => ['Batidos', 'Jugos', 'Bebidas Frías', 'Snacks'],
        ];

        foreach ($restaurants as $restaurantName => $categoryNames) {
            $restaurantId = Restaurant::where('name', $restaurantName)->value('id');

            if (!$restaurantId) {
                continue;
            }

            foreach ($categoryNames as $index => $name) {
                Category::updateOrCreate(
                    [
                        'restaurant_id' => $restaurantId,
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
}
