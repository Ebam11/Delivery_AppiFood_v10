<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
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
    }
}
