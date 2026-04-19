<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = function (string $restaurantName, string $categoryName): ?int {
            $restaurantId = Restaurant::where('name', $restaurantName)->value('id');

            if (!$restaurantId) {
                return null;
            }

            return Category::where('restaurant_id', $restaurantId)
                ->where('name', $categoryName)
                ->value('id');
        };

        // ── Burger House ───────────────────────────────────────
        $burgerProducts = [
            // Hamburguesas (category_id: 1)
            ['category_id' => 1, 'name' => 'Burger Clásica',      'description' => 'Carne de res, lechuga, tomate, cebolla y salsa especial.',   'price' => 18000, 'is_featured' => true],
            ['category_id' => 1, 'name' => 'Burger BBQ',          'description' => 'Doble carne, tocino, queso cheddar y salsa BBQ.',              'price' => 24000, 'is_featured' => true],
            ['category_id' => 1, 'name' => 'Burger Pollo',        'description' => 'Pechuga apanada, aguacate, tomate y mayonesa de ajo.',         'price' => 20000, 'is_featured' => false],
            ['category_id' => 1, 'name' => 'Burger Vegetariana',  'description' => 'Medallón de frijol negro, lechuga, tomate y salsa tahini.',    'price' => 17000, 'is_featured' => false],
            // Papas (category_id: 2)
            ['category_id' => 2, 'name' => 'Papas Fritas',        'description' => 'Papas crujientes con sal.',                                    'price' => 7000,  'is_featured' => false],
            ['category_id' => 2, 'name' => 'Papas con Queso',     'description' => 'Papas fritas bañadas en queso cheddar derretido.',              'price' => 10000, 'is_featured' => true],
            ['category_id' => 2, 'name' => 'Aros de Cebolla',     'description' => 'Aros de cebolla apanados y crujientes.',                       'price' => 9000,  'is_featured' => false],
            // Bebidas (category_id: 3)
            ['category_id' => 3, 'name' => 'Gaseosa',             'description' => 'Coca-Cola, Pepsi o Sprite 400ml.',                             'price' => 4000,  'is_featured' => false],
            ['category_id' => 3, 'name' => 'Malteada',            'description' => 'Vainilla, fresa o chocolate. 500ml.',                          'price' => 9000,  'is_featured' => true],
            ['category_id' => 3, 'name' => 'Agua',                'description' => 'Agua mineral o sin gas 500ml.',                                'price' => 2500,  'is_featured' => false],
        ];

        foreach ($burgerProducts as $product) {
            $payload = array_merge($product, [
                'restaurant_id' => 1,
                'is_available'  => true,
            ]);

            Product::updateOrCreate(
                [
                    'restaurant_id' => $payload['restaurant_id'],
                    'category_id'   => $payload['category_id'],
                    'name'          => $payload['name'],
                ],
                $payload
            );
        }

        // ── Pizza Nostra ───────────────────────────────────────
        $pizzaProducts = [
            // Pizzas (category_id: 5)
            ['category_id' => 5, 'name' => 'Margarita',           'description' => 'Salsa de tomate, mozzarella y albahaca fresca.',               'price' => 25000, 'is_featured' => true],
            ['category_id' => 5, 'name' => 'Pepperoni',           'description' => 'Salsa de tomate, mozzarella y pepperoni.',                      'price' => 28000, 'is_featured' => true],
            ['category_id' => 5, 'name' => 'Cuatro Quesos',       'description' => 'Mozzarella, gorgonzola, parmesano y brie.',                     'price' => 32000, 'is_featured' => false],
            ['category_id' => 5, 'name' => 'Hawaiana',            'description' => 'Salsa de tomate, mozzarella, jamón y piña.',                    'price' => 27000, 'is_featured' => false],
            // Pastas (category_id: 6)
            ['category_id' => 6, 'name' => 'Pasta Bolognesa',     'description' => 'Pasta fresca con ragú de carne y parmesano.',                   'price' => 22000, 'is_featured' => true],
            ['category_id' => 6, 'name' => 'Pasta Carbonara',     'description' => 'Pasta con huevo, panceta, parmesano y pimienta.',               'price' => 24000, 'is_featured' => false],
            // Bebidas (category_id: 8)
            ['category_id' => 8, 'name' => 'Agua Mineral',        'description' => 'Agua mineral 500ml.',                                           'price' => 3000,  'is_featured' => false],
            ['category_id' => 8, 'name' => 'Vino de la Casa',     'description' => 'Copa de vino tinto o blanco.',                                  'price' => 12000, 'is_featured' => false],
        ];

        foreach ($pizzaProducts as $product) {
            $payload = array_merge($product, [
                'restaurant_id' => 2,
                'is_available'  => true,
            ]);

            Product::updateOrCreate(
                [
                    'restaurant_id' => $payload['restaurant_id'],
                    'category_id'   => $payload['category_id'],
                    'name'          => $payload['name'],
                ],
                $payload
            );
        }

        // ── Sushi Zen ──────────────────────────────────────────
        $sushiProducts = [
            // Rolls (category_id: 9)
            ['category_id' => 9, 'name' => 'Roll California',     'description' => 'Cangrejo, aguacate y pepino. 8 piezas.',                        'price' => 22000, 'is_featured' => true],
            ['category_id' => 9, 'name' => 'Roll Spicy Tuna',     'description' => 'Atún picante, pepino y salsa sriracha. 8 piezas.',              'price' => 26000, 'is_featured' => true],
            ['category_id' => 9, 'name' => 'Roll Dragón',         'description' => 'Camarón tempura, aguacate y anguila. 8 piezas.',                'price' => 32000, 'is_featured' => true],
            ['category_id' => 9, 'name' => 'Roll Vegetal',        'description' => 'Pepino, aguacate, zanahoria y espinaca. 8 piezas.',             'price' => 19000, 'is_featured' => false],
            // Nigiri (category_id: 10)
            ['category_id' => 10, 'name' => 'Nigiri Salmón',      'description' => 'Arroz con salmón fresco. 2 piezas.',                            'price' => 12000, 'is_featured' => false],
            ['category_id' => 10, 'name' => 'Nigiri Atún',        'description' => 'Arroz con atún fresco. 2 piezas.',                              'price' => 13000, 'is_featured' => false],
            // Bebidas (category_id: 12)
            ['category_id' => 12, 'name' => 'Té Verde',           'description' => 'Té verde japonés caliente o frío.',                             'price' => 5000,  'is_featured' => false],
            ['category_id' => 12, 'name' => 'Cerveza Japonesa',   'description' => 'Sapporo o Kirin 330ml.',                                        'price' => 9000,  'is_featured' => false],
        ];

        foreach ($sushiProducts as $product) {
            $payload = array_merge($product, [
                'restaurant_id' => 3,
                'is_available'  => true,
            ]);

            Product::updateOrCreate(
                [
                    'restaurant_id' => $payload['restaurant_id'],
                    'category_id'   => $payload['category_id'],
                    'name'          => $payload['name'],
                ],
                $payload
            );
        }

        // ── Parrilla del Valle ────────────────────────────────
        $parrillaProducts = [
            ['category' => 'Cortes', 'name' => 'Churrasco 350g',        'description' => 'Corte de res a la parrilla con papas y ensalada.', 'price' => 36000, 'is_featured' => true],
            ['category' => 'Cortes', 'name' => 'Costillas BBQ',         'description' => 'Costillas bañadas en salsa BBQ ahumada.',           'price' => 42000, 'is_featured' => true],
            ['category' => 'Acompañamientos', 'name' => 'Papas Criollas', 'description' => 'Papas criollas doradas y crocantes.',                'price' => 9000,  'is_featured' => false],
            ['category' => 'Acompañamientos', 'name' => 'Yuca Frita',    'description' => 'Yuca frita con ají casero.',                         'price' => 8000,  'is_featured' => false],
            ['category' => 'Bebidas', 'name' => 'Limonada Cerezada',     'description' => 'Limonada fría con toque de cereza.',                 'price' => 7000,  'is_featured' => false],
            ['category' => 'Postres', 'name' => 'Brownie con Helado',    'description' => 'Brownie tibio con helado de vainilla.',              'price' => 11000, 'is_featured' => true],
        ];

        $parrillaRestaurantId = Restaurant::where('name', 'Parrilla del Valle')->value('id');
        foreach ($parrillaProducts as $product) {
            $categoryName = $product['category'];
            $payload = array_merge($product, [
                'restaurant_id' => $parrillaRestaurantId,
                'category_id'   => $categoryId('Parrilla del Valle', $categoryName),
                'is_available'  => true,
            ]);
            unset($payload['category']);

            if (!$payload['restaurant_id'] || !$payload['category_id']) {
                continue;
            }

            Product::updateOrCreate(
                [
                    'restaurant_id' => $payload['restaurant_id'],
                    'category_id'   => $payload['category_id'],
                    'name'          => $payload['name'],
                ],
                $payload
            );
        }

        // ── Tacos del Valle ────────────────────────────────────
        $tacosProducts = [
            ['category' => 'Tacos', 'name' => 'Tacos al Pastor x5',     'description' => 'Tacos con piña, cebolla y cilantro.',            'price' => 22000, 'is_featured' => true],
            ['category' => 'Tacos', 'name' => 'Tacos de Carne Asada x5','description' => 'Tortilla de maíz con carne asada jugosa.',       'price' => 24000, 'is_featured' => true],
            ['category' => 'Entradas', 'name' => 'Nachos con Queso',    'description' => 'Nachos crujientes con queso derretido.',          'price' => 15000, 'is_featured' => false],
            ['category' => 'Entradas', 'name' => 'Guacamole Fresco',    'description' => 'Guacamole artesanal con totopos.',                'price' => 13000, 'is_featured' => false],
            ['category' => 'Bebidas', 'name' => 'Jarrito de Tamarindo',  'description' => 'Bebida tradicional mexicana.',                    'price' => 6000,  'is_featured' => false],
            ['category' => 'Postres', 'name' => 'Churros con Arequipe',  'description' => 'Churros recién hechos con arequipe.',             'price' => 10000, 'is_featured' => true],
        ];

        $tacosRestaurantId = Restaurant::where('name', 'Tacos del Valle')->value('id');
        foreach ($tacosProducts as $product) {
            $categoryName = $product['category'];
            $payload = array_merge($product, [
                'restaurant_id' => $tacosRestaurantId,
                'category_id'   => $categoryId('Tacos del Valle', $categoryName),
                'is_available'  => true,
            ]);
            unset($payload['category']);

            if (!$payload['restaurant_id'] || !$payload['category_id']) {
                continue;
            }

            Product::updateOrCreate(
                [
                    'restaurant_id' => $payload['restaurant_id'],
                    'category_id'   => $payload['category_id'],
                    'name'          => $payload['name'],
                ],
                $payload
            );
        }

        // ── Verde Fresco ──────────────────────────────────────
        $verdeProducts = [
            ['category' => 'Bowls', 'name' => 'Bowl Proteico',       'description' => 'Arroz integral, pollo, aguacate y vegetales.',   'price' => 24000, 'is_featured' => true],
            ['category' => 'Bowls', 'name' => 'Bowl Veggie',         'description' => 'Quinoa, garbanzos, hummus y ensalada fresca.',   'price' => 22000, 'is_featured' => true],
            ['category' => 'Wraps', 'name' => 'Wrap de Pollo',        'description' => 'Pollo, lechuga, tomate y salsa yogur.',          'price' => 20000, 'is_featured' => false],
            ['category' => 'Wraps', 'name' => 'Wrap Vegetal',         'description' => 'Verduras salteadas y hummus en tortilla integral.','price' => 18000, 'is_featured' => false],
            ['category' => 'Jugos', 'name' => 'Jugo Verde',           'description' => 'Espinaca, manzana, piña y jengibre.',             'price' => 9000,  'is_featured' => false],
            ['category' => 'Postres', 'name' => 'Parfait de Yogur',   'description' => 'Yogur griego con frutas y granola.',              'price' => 10000, 'is_featured' => true],
        ];

        $verdeRestaurantId = Restaurant::where('name', 'Verde Fresco')->value('id');
        foreach ($verdeProducts as $product) {
            $categoryName = $product['category'];
            $payload = array_merge($product, [
                'restaurant_id' => $verdeRestaurantId,
                'category_id'   => $categoryId('Verde Fresco', $categoryName),
                'is_available'  => true,
            ]);
            unset($payload['category']);

            if (!$payload['restaurant_id'] || !$payload['category_id']) {
                continue;
            }

            Product::updateOrCreate(
                [
                    'restaurant_id' => $payload['restaurant_id'],
                    'category_id'   => $payload['category_id'],
                    'name'          => $payload['name'],
                ],
                $payload
            );
        }
    }
}
