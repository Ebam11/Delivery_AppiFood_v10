<?php

namespace Database\Seeders;

use App\Models\RestaurantCategory;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantSchedule;
use App\Models\DeliveryZone;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        // 20 restaurantes con datos realistas
        $restaurantsData = [
            [
                'email' => 'info@burgerhouse.com',
                'name' => 'Burger House',
                'description' => 'Las mejores hamburguesas de la ciudad, hechas con carne 100% de res.',
                'address' => 'Calle 15 # 8-23, Popayán',
                'categories' => ['Hamburguesas', 'Pollo', 'Comida Casera'],
            ],
            [
                'email' => 'contacto@pizzanostra.com',
                'name' => 'Pizza Nostra',
                'description' => 'Pizza artesanal en horno de piedra con ingredientes importados de Italia.',
                'address' => 'Carrera 9 # 18-42, Popayán',
                'categories' => ['Pizza', 'Italiana', 'Restaurantes Locales'],
            ],
            [
                'email' => 'info@sushizen.com',
                'name' => 'Sushi Zen',
                'description' => 'Variedad de sushi tradicional y de fusión, rolls, nigiris y sashimis.',
                'address' => 'Calle 5 # 11-20, Popayán',
                'categories' => ['Japonesa', 'Saludable', 'Restaurantes Locales'],
            ],
            [
                'email' => 'ventas@parrilladelvalle.com',
                'name' => 'Parrilla del Valle',
                'description' => 'Cortes de carne premium asados al carbón, chorizos y entradas típicas.',
                'address' => 'Carrera 6 # 22-10, Popayán',
                'categories' => ['Asados y Parrilla', 'Parrilla', 'Restaurantes Locales'],
            ],
            [
                'email' => 'tacos@elvalle.com',
                'name' => 'Tacos del Valle',
                'description' => 'Auténticos tacos mexicanos al pastor, de barbacoa y deliciosas quesadillas.',
                'address' => 'Calle 18N # 9-45, Popayán',
                'categories' => ['Mexicana', 'Comida Casera', 'Restaurantes Locales'],
            ],
            [
                'email' => 'hola@verdefresco.com',
                'name' => 'Verde Fresco',
                'description' => 'Ensaladas saludables, wraps, bowls de quinoa y jugos 100% naturales.',
                'address' => 'Carrera 9 # 4N-12, Popayán',
                'categories' => ['Saludable', 'Bebidas Tradicionales', 'Restaurantes Locales'],
            ],
            [
                'email' => 'contacto@pollodorado.com',
                'name' => 'Pollo Dorado',
                'description' => 'Pollo asado, broaster y acompañamientos caseros con el mejor sabor.',
                'address' => 'Calle 21 # 10-15, Popayán',
                'categories' => ['Pollo Asado', 'Pollo', 'Comida Casera'],
            ],
            [
                'email' => 'mariscos@elpuerto.com',
                'name' => 'Mariscos del Puerto',
                'description' => 'Ceviches, cazuelas de mariscos y pescados frescos traídos del Pacífico.',
                'address' => 'Avenida del Río # 8-50, Popayán',
                'categories' => ['Comida de Mar', 'Mariscos', 'Sopas y Caldos'],
            ],
            [
                'email' => 'trattoria@bella.com',
                'name' => 'Trattoria Bella',
                'description' => 'Pastas caseras, lasañas y postres tradicionales con receta de la nonna.',
                'address' => 'Carrera 6 # 15-28, Popayán',
                'categories' => ['Italiana', 'Postres', 'Restaurantes Locales'],
            ],
            [
                'email' => 'dulce@tentacion.com',
                'name' => 'Dulce Tentación',
                'description' => 'Postres, tortas personalizadas, helados artesanales y malteadas.',
                'address' => 'Calle 7 # 3-45, Popayán',
                'categories' => ['Panadería y Postres', 'Postres', 'Restaurantes Locales'],
            ],
            [
                'email' => 'cafe@madrugon.com',
                'name' => 'Café Madrugón',
                'description' => 'Desayunos tradicionales, calentados, café de origen y panadería fresca.',
                'address' => 'Carrera 4 # 8-20, Popayán',
                'categories' => ['Desayunos Típicos', 'Desayunos', 'Panadería y Postres'],
            ],
            [
                'email' => 'hola@barrafresca.com',
                'name' => 'Barra Fresca',
                'description' => 'Batidos de fruta, smoothies y snacks saludables para cualquier momento.',
                'address' => 'Calle 10 # 6-30, Popayán',
                'categories' => ['Bebidas Tradicionales', 'Saludable', 'Restaurantes Locales'],
            ],
            [
                'email' => 'chino@paraiso.com',
                'name' => 'Paraíso Chino',
                'description' => 'Arroz cantón, chop suey, lumpias y comida china tradicional.',
                'address' => 'Carrera 8 # 12-50, Popayán',
                'categories' => ['Japonesa', 'Comida Casera', 'Restaurantes Locales'],
            ],
            [
                'email' => 'arepas@donaelena.com',
                'name' => 'Arepas Doña Elena',
                'description' => 'Arepas de maíz peto rellenas de queso, carne desmechada, pollo y todo lo que gustes.',
                'address' => 'Calle 13 # 5-10, Popayán',
                'categories' => ['Antojitos Payaneses', 'Empanadas y Fritos', 'Comida Casera'],
            ],
            [
                'email' => 'sandwich@gourmet.com',
                'name' => 'Sandwich Gourmet',
                'description' => 'Sándwiches artesanales preparados al instante con panes seleccionados.',
                'address' => 'Carrera 7 # 16-20, Popayán',
                'categories' => ['Hamburguesas', 'Comida Casera', 'Restaurantes Locales'],
            ],
            [
                'email' => 'sopas@elrincon.com',
                'name' => 'Sopas El Rincón',
                'description' => 'Sancochos, ajiacos y mondongos preparados con leña y amor.',
                'address' => 'Calle 4 # 9-85, Popayán',
                'categories' => ['Sopas y Caldos', 'Comida Casera', 'Restaurantes Locales'],
            ],
            [
                'email' => 'alitas@house.com',
                'name' => 'Wings & Beer House',
                'description' => 'Alitas de pollo crujientes bañadas en variedad de salsas artesanales.',
                'address' => 'Carrera 9 # 20N-15, Popayán',
                'categories' => ['Pollo', 'Comida Casera', 'Restaurantes Locales'],
            ],
            [
                'email' => 'shawarma@eldesierto.com',
                'name' => 'Árabe El Desierto',
                'description' => 'Shawarmas de carne y pollo, falafel, hummus y comida del Medio Oriente.',
                'address' => 'Calle 10N # 8-32, Popayán',
                'categories' => ['Comida Casera', 'Saludable', 'Restaurantes Locales'],
            ],
            [
                'email' => 'crepes@antojo.com',
                'name' => 'Crepes Antojos',
                'description' => 'Crepes dulces y salados, waffles esponjosos y helado de primera.',
                'address' => 'Carrera 9 # 12N-55, Popayán',
                'categories' => ['Tamales', 'Panadería y Postres', 'Postres'],
            ],
            [
                'email' => 'donas@sweet.com',
                'name' => 'Sweet Donuts',
                'description' => 'Las donas más frescas y decoradas de la ciudad acompañadas de café.',
                'address' => 'Calle 15 # 9-80, Popayán',
                'categories' => ['Panadería y Postres', 'Postres', 'Restaurantes Locales'],
            ],
        ];

        $banners = [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900', // burger
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900', // pizza
            'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=900', // sushi
            'https://images.unsplash.com/photo-1544025162-d76694265947?w=900', // carne/parrilla
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900', // tacos/mexicana
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900', // saludable
            'https://images.unsplash.com/photo-1606728035253-49e196321de5?w=900', // pollo asado
            'https://images.unsplash.com/photo-1534080391025-09795d197a5b?w=900', // mariscos
            'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900', // postres
            'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900', // postres / donuts
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900', // desayunos / café
            'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=900', // saludable / batidos
            'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=900', // china
            'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=900', // comida tipica / arepas
            'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=900', // sandwich
            'https://images.unsplash.com/photo-1547592180-85f173990554?w=900', // sopas
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900', // alitas
            'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=900', // arabe/shawarma
            'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=900', // crepes/waffles
            'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=900', // donas
        ];

        // Obtener todas las categorías oficiales creadas en la base de datos
        $allCats = RestaurantCategory::all();
        $totalCatsCount = $allCats->count();

        foreach ($restaurantsData as $index => $data) {
            $userNum = $index + 1;
            $owner = User::where('email', $data['email'])->first();

            if (!$owner) continue;

            // Generar geolocalización aleatoria dentro del casco urbano de Popayán (más dispersos para pruebas de distancia)
            $randomLat = 2.4448 + (rand(-300, 300) / 10000);
            $randomLng = -76.6147 + (rand(-300, 300) / 10000);

            // Banners e imágenes reales
            $imgUrl = $banners[$index % count($banners)];

            // Crear el restaurante
            $restaurant = Restaurant::updateOrCreate(
                ['user_id' => $owner->id],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'address' => $data['address'],
                    'lat' => $randomLat,
                    'lng' => $randomLng,
                    'logo' => $imgUrl,
                    'banner' => $imgUrl,
                    'phone' => '602' . str_pad($userNum, 7, '0', STR_PAD_LEFT),
                    'email' => $data['email'],
                    'delivery_cost' => rand(2500, 5000),
                    'minimum_order' => rand(10000, 18000),
                    'delivery_time_min' => rand(20, 40),
                    'average_rating' => rand(40, 50) / 10,
                    'total_reviews' => 0,
                    'is_active' => true,
                    'is_verified' => true,
                ]
            );

            // 1. Relacionar categorías de restaurante fijas por temática
            foreach ($data['categories'] as $catName) {
                $category = RestaurantCategory::where('name', $catName)->first();
                if ($category) {
                    $restaurant->restaurantCategories()->syncWithoutDetaching([$category->id]);
                }
            }

            // 2. Asignar 6 categorías dinámicas modularmente para garantizar el mínimo de 5 restaurantes por categoría
            for ($k = 0; $k < 6; $k++) {
                $rotativeCategory = $allCats[($index + ($k * 4)) % $totalCatsCount];
                $restaurant->restaurantCategories()->syncWithoutDetaching([$rotativeCategory->id]);
            }

            // Crear Horarios (Abierto 24/7 para facilitar pruebas)
            $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            foreach ($daysOfWeek as $day) {
                RestaurantSchedule::updateOrCreate(
                    [
                        'restaurant_id' => $restaurant->id,
                        'day' => $day,
                    ],
                    [
                        'opening_time' => '00:00:00',
                        'closing_time' => '23:59:00',
                        'is_closed' => false,
                    ]
                );
            }

            // Crear Zona de Entrega por defecto
            DeliveryZone::updateOrCreate(
                ['restaurant_id' => $restaurant->id],
                [
                    'name' => 'Zona Urbana',
                    'delivery_cost' => $restaurant->delivery_cost,
                    'delivery_time_min' => $restaurant->delivery_time_min,
                ]
            );
        }
    }
}
