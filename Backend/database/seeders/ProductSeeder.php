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
                ['name' => 'Burger Clásica', 'description' => 'Carne de res 150g, queso cheddar, lechuga, tomate y salsa de la casa.', 'price' => 18000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'],
                ['name' => 'Burger BBQ', 'description' => 'Carne de res, tocino crujiente, aros de cebolla y salsa barbacoa dulce.', 'price' => 24000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500'],
                ['name' => 'Burger Pollo', 'description' => 'Pechuga de pollo apanada, lechuga y mayonesa con notas de ajo.', 'price' => 20000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500'],
                ['name' => 'Burger Especial', 'description' => 'Doble carne, huevo frito, jamón, queso y verduras frescas.', 'price' => 28000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500'],
            ],
            'pizza' => [
                ['name' => 'Pizza Margherita', 'description' => 'Salsa de tomate italiana, mozzarella fresca y albahaca fresca.', 'price' => 22000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500'],
                ['name' => 'Pizza Pepperoni', 'description' => 'Doble porción de pepperoni americano y queso mozzarella derretido.', 'price' => 27000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500'],
                ['name' => 'Pizza Hawaiana', 'description' => 'Queso mozzarella, jamón premium seleccionado y piña dulce calada.', 'price' => 25000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500'],
                ['name' => 'Pizza Cuatro Quesos', 'description' => 'Mozzarella, parmesano, queso azul y queso crema.', 'price' => 29000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500'],
            ],
            'sushi' => [
                ['name' => 'Philadelphia Roll', 'description' => 'Salmón fresco, queso crema y aguacate, cubierto de ajonjolí.', 'price' => 26000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500'],
                ['name' => 'California Roll', 'description' => 'Cangrejo, aguacate y pepino, cubierto de masago.', 'price' => 24000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500'],
                ['name' => 'Ojo de Tigre Roll', 'description' => 'Salmón, atún y pescado blanco apanados, con salsa de anguila.', 'price' => 32000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500'],
                ['name' => 'Nigiri Combo', 'description' => 'Selección de 6 piezas de nigiri (salmón, atún y camarón).', 'price' => 30000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500'],
            ],
            'pollo' => [
                ['name' => 'Pollo Asado Entero', 'description' => 'Pollo entero marinado con especias secretas y asado a la brasa.', 'price' => 34000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1606728035253-49e196321de5?w=500'],
                ['name' => 'Medio Pollo Asado', 'description' => 'Medio pollo dorado a la brasa acompañado de papas y arepa.', 'price' => 19000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500'],
                ['name' => 'Combo Pollo Broaster', 'description' => '4 piezas de pollo crujiente apanadas al estilo americano.', 'price' => 22000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500'],
                ['name' => 'Consomé de Pollo', 'description' => 'Caldo concentrado con menudencias, verduras y cilantro.', 'price' => 8000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500'],
            ],
            'mariscos' => [
                ['name' => 'Ceviche Peruano', 'description' => 'Trozos de pescado blanco marinados en zumo de limón y ají.', 'price' => 26000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1534080391025-09795d197a5b?w=500'],
                ['name' => 'Cazuela de Mariscos', 'description' => 'Mezcla selecta de mariscos en crema de coco y finas hierbas.', 'price' => 36000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500'],
                ['name' => 'Pescado Frito', 'description' => 'Pargo rojo frito acompañado de arroz de coco, patacones y ensalada.', 'price' => 32000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500'],
                ['name' => 'Arroz con Camarones', 'description' => 'Arroz sazonado con camarones salteados y verduras de la huerta.', 'price' => 28000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500'],
            ],
            'bebida' => [
                ['name' => 'Gaseosa Personal', 'description' => 'Lata de 330ml helada (Coca-Cola, Sprite, Cuatro).', 'price' => 4500, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500'],
                ['name' => 'Jugo Natural', 'description' => 'Jugo de fruta natural en agua o leche (Lulo, Fresa, Mango).', 'price' => 6000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500'],
                ['name' => 'Limonada Cerezada', 'description' => 'Limonada fresca licuada con cerezas dulces y hielo frappé.', 'price' => 8500, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'],
                ['name' => 'Té Helado', 'description' => 'Té helado casero con infusión de limón y menta.', 'price' => 5000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'],
            ],
            'postre' => [
                ['name' => 'Brownie con Helado', 'description' => 'Brownie de chocolate caliente con una bola de helado de vainilla.', 'price' => 12000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500'],
                ['name' => 'Flan de Caramelo', 'description' => 'Flan casero suave bañado en caramelo líquido.', 'price' => 9000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=500'],
                ['name' => 'Tres Leches', 'description' => 'Bizcochuelo bañado en mezcla de tres leches con crema chantilly.', 'price' => 11000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500'],
                ['name' => 'Copa de Helado', 'description' => 'Tres bolas de helado a elección con salsa y barquillo.', 'price' => 10000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500'],
            ],
            'general' => [
                ['name' => 'Plato Especial de la Casa', 'description' => 'Deliciosa preparación con la firma del chef usando ingredientes frescos.', 'price' => 25000, 'discount' => true, 'image' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'],
                ['name' => 'Entrada de Patacones', 'description' => 'Patacones crujientes acompañados de hogao casero y queso.', 'price' => 12000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500'],
                ['name' => 'Porción de Papas Fritas', 'description' => 'Papas cortadas en bastón fritas en su punto exacto.', 'price' => 8000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500'],
                ['name' => 'Ensalada Personal', 'description' => 'Mezcla de lechugas, tomate cherry, cebolla morada y vinagreta.', 'price' => 10000, 'discount' => false, 'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500'],
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
                            'image'             => $tpl['image'] ?? null,
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
