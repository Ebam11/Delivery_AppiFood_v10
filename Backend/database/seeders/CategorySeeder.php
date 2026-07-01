<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    // Control de categorías limpias de restaurante (Evita duplicados de Platos Fuertes en restaurante 18)
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

        // Fallback genérico o dinámico según palabras clave en el nombre del restaurante
        $defaultCategories = ['Platos Fuertes', 'Entradas', 'Bebidas', 'Postres'];

        foreach ($allRestaurants as $restaurant) {
            $nameLower = strtolower($restaurant->name);
            
            // Asignar categorías de menú temáticas personalizadas basadas en el nombre
            if (str_contains($nameLower, 'burger') || str_contains($nameLower, 'hamburguesa')) {
                $categoryNames = ['Hamburguesas', 'Papas y Acompañamientos', 'Bebidas', 'Postres'];
            } elseif (str_contains($nameLower, 'pizza') || str_contains($nameLower, 'italiana') || str_contains($nameLower, 'pasta')) {
                $categoryNames = ['Pizzas', 'Pastas', 'Entradas', 'Bebidas'];
            } elseif (str_contains($nameLower, 'sushi') || str_contains($nameLower, 'japonesa') || str_contains($nameLower, 'roll')) {
                $categoryNames = ['Rolls', 'Nigiri', 'Entradas', 'Bebidas'];
            } elseif (str_contains($nameLower, 'asado') || str_contains($nameLower, 'parrilla')) {
                $categoryNames = ['Cortes', 'Acompañamientos', 'Bebidas', 'Postres'];
            } elseif (str_contains($nameLower, 'pollo')) {
                $categoryNames = ['Pollo Asado', 'Broaster', 'Acompañamientos', 'Bebidas'];
            } elseif (str_contains($nameLower, 'mar') || str_contains($nameLower, 'marisco') || str_contains($nameLower, 'cevic')) {
                $categoryNames = ['Ceviches', 'Mariscos', 'Pescados', 'Bebidas'];
            } elseif (str_contains($nameLower, 'desayuno') || str_contains($nameLower, 'café') || str_contains($nameLower, 'cafe')) {
                $categoryNames = ['Desayunos', 'Panadería', 'Café', 'Jugos'];
            } elseif (str_contains($nameLower, 'postre') || str_contains($nameLower, 'torta') || str_contains($nameLower, 'helado') || str_contains($nameLower, 'dona') || str_contains($nameLower, 'sweet')) {
                $categoryNames = ['Tortas', 'Postres', 'Helados', 'Bebidas'];
            } elseif (str_contains($nameLower, 'sopa') || str_contains($nameLower, 'caldo')) {
                $categoryNames = ['Sopas', 'Caldos', 'Acompañamientos', 'Bebidas'];
            } elseif (str_contains($nameLower, 'bebida') || str_contains($nameLower, 'jugo') || str_contains($nameLower, 'batido')) {
                $categoryNames = ['Batidos', 'Jugos', 'Bebidas Frías', 'Snacks'];
            } else {
                $categoryNames = $menuCategoriesPreset[$restaurant->name] ?? $defaultCategories;
            }

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
