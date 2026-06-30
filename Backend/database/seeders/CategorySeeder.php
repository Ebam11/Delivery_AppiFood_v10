<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $allRestaurants = Restaurant::all();

        // Categorías de menú sugeridas según la temática o el tipo de restaurante
        $menuCategoriesPreset = [
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

        // Fallback genérico para restaurantes nuevos o no listados arriba
        $defaultCategories = ['Platos Fuertes', 'Entradas', 'Bebidas', 'Postres'];

        foreach ($allRestaurants as $restaurant) {
            // Obtener el set de categorías para este restaurante
            $categoryNames = $menuCategoriesPreset[$restaurant->name] ?? $defaultCategories;

            foreach ($categoryNames as $index => $name) {
                Category::updateOrCreate(
                    [
                        'restaurant_id' => $restaurant->id,
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
