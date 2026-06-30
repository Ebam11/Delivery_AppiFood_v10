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
        $restaurants = Restaurant::all();

        // Platos de muestra por tipo de categoría de menú
        $dishesByKeywords = [
            'hamburguesa' => [
                ['name' => 'Burger Clásica', 'description' => 'Carne de res 150g, queso cheddar, lechuga, tomate y salsa de la casa.', 'price' => 18000, 'discount' => true],
                ['name' => 'Burger BBQ', 'description' => 'Carne de res, tocino crujiente, aros de cebolla y salsa barbacoa dulce.', 'price' => 24000, 'discount' => true],
                ['name' => 'Burger Pollo', 'description' => 'Pechuga de pollo apanada, lechuga y mayonesa con notas de ajo.', 'price' => 20000, 'discount' => false],
                ['name' => 'Burger Especial', 'description' => 'Doble carne, huevo frito, jamón, queso y verduras frescas.', 'price' => 28000, 'discount' => false],
            ],
            'pizza' => [
                ['name' => 'Pizza Margherita', 'description' => 'Salsa de tomate italiana, mozzarella fresca y albahaca fresca.', 'price' => 22000, 'discount' => false],
                ['name' => 'Pizza Pepperoni', 'description' => 'Doble porción de pepperoni americano y queso mozzarella derretido.', 'price' => 27000, 'discount' => true],
                ['name' => 'Pizza Hawaiana', 'description' => 'Queso mozzarella, jamón premium seleccionado y piña dulce calada.', 'price' => 25000, 'discount' => true],
                ['name' => 'Pizza Cuatro Quesos', 'description' => 'Mozzarella, parmesano, queso azul y queso crema.', 'price' => 29000, 'discount' => false],
            ],
            'sushi' => [
                ['name' => 'Philadelphia Roll', 'description' => 'Salmón fresco, queso crema y aguacate, cubierto de ajonjolí.', 'price' => 26000, 'discount' => true],
                ['name' => 'California Roll', 'description' => 'Cangrejo, aguacate y pepino, cubierto de masago.', 'price' => 24000, 'discount' => false],
                ['name' => 'Ojo de Tigre Roll', 'description' => 'Salmón, atún y pescado blanco apanados, con salsa de anguila.', 'price' => 32000, 'discount' => true],
                ['name' => 'Nigiri Combo', 'description' => 'Selección de 6 piezas de nigiri (salmón, atún y camarón).', 'price' => 30000, 'discount' => false],
            ],
            'pollo' => [
                ['name' => 'Pollo Asado Entero', 'description' => 'Pollo entero marinado con especias secretas y asado a la brasa.', 'price' => 34000, 'discount' => true],
                ['name' => 'Medio Pollo Asado', 'description' => 'Medio pollo dorado a la brasa acompañado de papas y arepa.', 'price' => 19000, 'discount' => false],
                ['name' => 'Combo Pollo Broaster', 'description' => '4 piezas de pollo crujiente apanadas al estilo americano.', 'price' => 22000, 'discount' => true],
                ['name' => 'Consomé de Pollo', 'description' => 'Caldo concentrado con menudencias, verduras y cilantro.', 'price' => 8000, 'discount' => false],
            ],
            'mariscos' => [
                ['name' => 'Ceviche Peruano', 'description' => 'Trozos de pescado blanco marinados en zumo de limón y ají.', 'price' => 26000, 'discount' => true],
                ['name' => 'Cazuela de Mariscos', 'description' => 'Mezcla selecta de mariscos en crema de coco y finas hierbas.', 'price' => 36000, 'discount' => false],
                ['name' => 'Pescado Frito', 'description' => 'Pargo rojo frito acompañado de arroz de coco, patacones y ensalada.', 'price' => 32000, 'discount' => true],
                ['name' => 'Arroz con Camarones', 'description' => 'Arroz sazonado con camarones salteados y verduras de la huerta.', 'price' => 28000, 'discount' => false],
            ],
            'bebida' => [
                ['name' => 'Gaseosa Personal', 'description' => 'Lata de 330ml helada (Coca-Cola, Sprite, Cuatro).', 'price' => 4500, 'discount' => false],
                ['name' => 'Jugo Natural', 'description' => 'Jugo de fruta natural en agua o leche (Lulo, Fresa, Mango).', 'price' => 6000, 'discount' => false],
                ['name' => 'Limonada Cerezada', 'description' => 'Limonada fresca licuada con cerezas dulces y hielo frappé.', 'price' => 8500, 'discount' => true],
                ['name' => 'Té Helado', 'description' => 'Té helado casero con infusión de limón y menta.', 'price' => 5000, 'discount' => false],
            ],
            'postre' => [
                ['name' => 'Brownie con Helado', 'description' => 'Brownie de chocolate caliente con una bola de helado de vainilla.', 'price' => 12000, 'discount' => true],
                ['name' => 'Flan de Caramelo', 'description' => 'Flan casero suave bañado en caramelo líquido.', 'price' => 9000, 'discount' => false],
                ['name' => 'Tres Leches', 'description' => 'Bizcochuelo bañado en mezcla de tres leches con crema chantilly.', 'price' => 11000, 'discount' => true],
                ['name' => 'Copa de Helado', 'description' => 'Tres bolas de helado a elección con salsa y barquillo.', 'price' => 10000, 'discount' => false],
            ],
            'general' => [
                ['name' => 'Plato Especial de la Casa', 'description' => 'Deliciosa preparación con la firma del chef usando ingredientes frescos.', 'price' => 25000, 'discount' => true],
                ['name' => 'Entrada de Patacones', 'description' => 'Patacones crujientes acompañados de hogao casero y queso.', 'price' => 12000, 'discount' => false],
                ['name' => 'Porción de Papas Fritas', 'description' => 'Papas cortadas en bastón fritas en su punto exacto.', 'price' => 8000, 'discount' => false],
                ['name' => 'Ensalada Personal', 'description' => 'Mezcla de lechugas, tomate cherry, cebolla morada y vinagreta.', 'price' => 10000, 'discount' => false],
            ]
        ];

        foreach ($restaurants as $restaurant) {
            $categories = Category::where('restaurant_id', $restaurant->id)->get();

            foreach ($categories as $cat) {
                $catNameLower = strtolower($cat->name);

                // Determinar el set de platos a usar según la categoría
                $dishTemplates = $dishesByKeywords['general'];
                if (str_contains($catNameLower, 'hamburguesa') || str_contains($catNameLower, 'rapida') || str_contains($catNameLower, 'rápida')) {
                    $dishTemplates = $dishesByKeywords['hamburguesa'];
                } elseif (str_contains($catNameLower, 'pizza') || str_contains($catNameLower, 'pasta') || str_contains($catNameLower, 'italian')) {
                    $dishTemplates = $dishesByKeywords['pizza'];
                } elseif (str_contains($catNameLower, 'sushi') || str_contains($catNameLower, 'roll') || str_contains($catNameLower, 'asiat')) {
                    $dishTemplates = $dishesByKeywords['sushi'];
                } elseif (str_contains($catNameLower, 'pollo')) {
                    $dishTemplates = $dishesByKeywords['pollo'];
                } elseif (str_contains($catNameLower, 'marisco') || str_contains($catNameLower, 'cevic') || str_contains($catNameLower, 'pescad') || str_contains($catNameLower, 'mar')) {
                    $dishTemplates = $dishesByKeywords['mariscos'];
                } elseif (str_contains($catNameLower, 'bebida') || str_contains($catNameLower, 'jugo') || str_contains($catNameLower, 'cafe') || str_contains($catNameLower, 'café') || str_contains($catNameLower, 'licu')) {
                    $dishTemplates = $dishesByKeywords['bebida'];
                } elseif (str_contains($catNameLower, 'postre') || str_contains($catNameLower, 'torta') || str_contains($catNameLower, 'helado') || str_contains($catNameLower, 'dulce')) {
                    $dishTemplates = $dishesByKeywords['postre'];
                }

                // Crear 3 o 4 productos por cada categoría
                foreach ($dishTemplates as $index => $tpl) {
                    $price = $tpl['price'];
                    $discountPrice = null;

                    // Si califica para descuento, reducir 20%
                    if ($tpl['discount']) {
                        $discountPrice = round(($price * 0.80) / 100) * 100;
                    }

                    Product::updateOrCreate(
                        [
                            'restaurant_id' => $restaurant->id,
                            'category_id'   => $cat->id,
                            'name'          => $tpl['name'],
                        ],
                        [
                            'description'       => $tpl['description'],
                            'price'             => $price,
                            'discount_price'    => $discountPrice,
                            'stock'             => rand(15, 45),
                            'prep_time_minutes' => rand(15, 30),
                            'is_featured'       => ($index === 0 || $tpl['discount']),
                            'is_available'      => true,
                        ]
                    );
                }
            }
        }
    }
}
