<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class RestaurantProductsBackfillSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = Restaurant::with(['categories.products'])->get();

        foreach ($restaurants as $restaurant) {
            $categories = $restaurant->categories;

            if ($categories->isEmpty()) {
                $categoryNames = ['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres'];

                foreach ($categoryNames as $index => $name) {
                    Category::updateOrCreate(
                        [
                            'restaurant_id' => $restaurant->id,
                            'name' => $name,
                        ],
                        [
                            'order' => $index + 1,
                            'is_active' => true,
                        ]
                    );
                }

                $categories = Category::where('restaurant_id', $restaurant->id)->orderBy('order')->get();
            }

            $totalProducts = Product::where('restaurant_id', $restaurant->id)->count();
            if ($totalProducts > 0) {
                continue;
            }

            $categoryByName = $categories->keyBy('name');
            $fallbackCategory = $categories->first();

            $products = [
                ['category' => 'Entradas', 'name' => 'Empanadas de Carne (x3)', 'description' => 'Deliciosas empanadas crujientes con ají.', 'price' => 8500, 'is_featured' => true],
                ['category' => 'Entradas', 'name' => 'Deditos de Queso', 'description' => 'Palitos de queso derretido, perfectos para empezar.', 'price' => 10500, 'is_featured' => false],
                ['category' => 'Entradas', 'name' => 'Sopa del Día', 'description' => 'Sopa casera con ingredientes frescos.', 'price' => 9500, 'is_featured' => false],
                
                ['category' => 'Platos Fuertes', 'name' => 'Plato Casero Completo', 'description' => 'Proteína, arroz, ensalada y tajadas.', 'price' => 18900, 'is_featured' => true],
                ['category' => 'Platos Fuertes', 'name' => 'Pechuga a la Plancha', 'description' => 'Jugosa pechuga con puré de papa y vegetales.', 'price' => 21500, 'is_featured' => true],
                ['category' => 'Platos Fuertes', 'name' => 'Hamburguesa Especial de la Casa', 'description' => 'Carne artesanal, queso, tocineta y papas fritas.', 'price' => 24000, 'is_featured' => true],
                ['category' => 'Platos Fuertes', 'name' => 'Bowl Saludable', 'description' => 'Quinoa, aguacate, tomate cherry y pollo desmechado.', 'price' => 19900, 'is_featured' => false],
                ['category' => 'Platos Fuertes', 'name' => 'Costillas BBQ', 'description' => 'Costillas bañadas en salsa BBQ con papas en casco.', 'price' => 28000, 'is_featured' => false],

                ['category' => 'Postres', 'name' => 'Brownie con Helado', 'description' => 'Brownie caliente con helado de vainilla.', 'price' => 11000, 'is_featured' => true],
                ['category' => 'Postres', 'name' => 'Cheesecake de Frutos Rojos', 'description' => 'Suave cheesecake con salsa de moras.', 'price' => 12500, 'is_featured' => false],
                ['category' => 'Postres', 'name' => 'Tres Leches', 'description' => 'Esponjoso pastel bañado en tres leches.', 'price' => 9500, 'is_featured' => false],

                ['category' => 'Bebidas', 'name' => 'Limonada Natural', 'description' => 'Bebida natural refrescante.', 'price' => 5000, 'is_featured' => false],
                ['category' => 'Bebidas', 'name' => 'Limonada Cerezada', 'description' => 'Refrescante limonada con cereza.', 'price' => 6500, 'is_featured' => false],
                ['category' => 'Bebidas', 'name' => 'Jugo Natural', 'description' => 'Jugo en agua o leche (Mango, Mora, Maracuyá).', 'price' => 7000, 'is_featured' => false],
                ['category' => 'Bebidas', 'name' => 'Gaseosa 400ml', 'description' => 'Coca-Cola, Sprite, o Quatro.', 'price' => 4500, 'is_featured' => false],
            ];

            foreach ($products as $item) {
                $category = $categoryByName->get($item['category']) ?: $fallbackCategory;

                if (!$category) {
                    continue;
                }

                Product::updateOrCreate(
                    [
                        'restaurant_id' => $restaurant->id,
                        'category_id' => $category->id,
                        'name' => $item['name'],
                    ],
                    [
                        'description' => $item['description'],
                        'price' => $item['price'],
                        'is_featured' => $item['is_featured'],
                        'is_available' => true,
                    ]
                );
            }
        }
    }
}
