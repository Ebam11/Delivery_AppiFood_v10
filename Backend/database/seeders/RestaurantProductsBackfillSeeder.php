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
                $categoryNames = ['Especiales', 'Platos Fuertes', 'Acompañamientos', 'Bebidas'];

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
                ['category' => 'Especiales', 'name' => 'Combo Ahorro del Día', 'description' => 'Menú económico recomendado por la casa.', 'price' => 12900, 'is_featured' => true],
                ['category' => 'Platos Fuertes', 'name' => 'Plato Casero Completo', 'description' => 'Proteína, arroz, ensalada y bebida pequeña.', 'price' => 14900, 'is_featured' => true],
                ['category' => 'Platos Fuertes', 'name' => 'Bowl Económico', 'description' => 'Bowl abundante para almuerzo o cena.', 'price' => 11900, 'is_featured' => false],
                ['category' => 'Acompañamientos', 'name' => 'Porción de Papas', 'description' => 'Papas doradas para complementar tu pedido.', 'price' => 5900, 'is_featured' => false],
                ['category' => 'Bebidas', 'name' => 'Limonada Natural', 'description' => 'Bebida natural fría sin costo elevado.', 'price' => 3900, 'is_featured' => false],
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
