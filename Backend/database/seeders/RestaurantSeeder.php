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
                'lat' => 2.4448, 'lng' => -76.6147,
                'categories' => ['Hamburguesas', 'Comida Rápida'],
            ],
            [
                'email' => 'contacto@pizzanostra.com',
                'name' => 'Pizza Nostra',
                'description' => 'Pizza artesanal en horno de piedra con ingredientes importados de Italia.',
                'address' => 'Carrera 9 # 18-42, Popayán',
                'lat' => 2.4485, 'lng' => -76.6089,
                'categories' => ['Pizzas', 'Italiana'],
            ],
            [
                'email' => 'info@sushizen.com',
                'name' => 'Sushi Zen',
                'description' => 'Variedad de sushi tradicional y de fusión, rolls, nigiris y sashimis.',
                'address' => 'Calle 5 # 11-20, Popayán',
                'lat' => 2.4412, 'lng' => -76.6198,
                'categories' => ['Sushi', 'Asiática'],
            ],
            [
                'email' => 'ventas@parrilladelvalle.com',
                'name' => 'Parrilla del Valle',
                'description' => 'Cortes de carne premium asados al carbón, chorizos y entradas típicas.',
                'address' => 'Carrera 6 # 22-10, Popayán',
                'lat' => 2.4502, 'lng' => -76.6120,
                'categories' => ['Carnes', 'Parrilla'],
            ],
            [
                'email' => 'tacos@elvalle.com',
                'name' => 'Tacos del Valle',
                'description' => 'Auténticos tacos mexicanos al pastor, de barbacoa y deliciosas quesadillas.',
                'address' => 'Calle 18N # 9-45, Popayán',
                'lat' => 2.4542, 'lng' => -76.6020,
                'categories' => ['Tacos', 'Mexicana'],
            ],
            [
                'email' => 'hola@verdefresco.com',
                'name' => 'Verde Fresco',
                'description' => 'Ensaladas saludables, wraps, bowls de quinoa y jugos 100% naturales.',
                'address' => 'Carrera 9 # 4N-12, Popayán',
                'lat' => 2.4522, 'lng' => -76.5980,
                'categories' => ['Saludable', 'Ensaladas'],
            ],
            [
                'email' => 'contacto@pollodorado.com',
                'name' => 'Pollo Dorado',
                'description' => 'Pollo asado, broaster y acompañamientos caseros con el mejor sabor.',
                'address' => 'Calle 21 # 10-15, Popayán',
                'lat' => 2.4464, 'lng' => -76.6108,
                'categories' => ['Pollo', 'Comida Rápida'],
            ],
            [
                'email' => 'mariscos@elpuerto.com',
                'name' => 'Mariscos del Puerto',
                'description' => 'Ceviches, cazuelas de mariscos y pescados frescos traídos del Pacífico.',
                'address' => 'Avenida del Río # 8-50, Popayán',
                'lat' => 2.4476, 'lng' => -76.6058,
                'categories' => ['Mariscos', 'Comida de Mar'],
            ],
            [
                'email' => 'trattoria@bella.com',
                'name' => 'Trattoria Bella',
                'description' => 'Pastas caseras, lasañas y postres tradicionales con receta de la nonna.',
                'address' => 'Carrera 6 # 15-28, Popayán',
                'lat' => 2.4428, 'lng' => -76.6141,
                'categories' => ['Italiana', 'Pastas'],
            ],
            [
                'email' => 'dulce@tentacion.com',
                'name' => 'Dulce Tentación',
                'description' => 'Postres, tortas personalizadas, helados artesanales y malteadas.',
                'address' => 'Calle 7 # 3-45, Popayán',
                'lat' => 2.4385, 'lng' => -76.6110,
                'categories' => ['Postres', 'Helados'],
            ],
            [
                'email' => 'cafe@madrugon.com',
                'name' => 'Café Madrugón',
                'description' => 'Desayunos tradicionales, calentados, café de origen y panadería fresca.',
                'address' => 'Carrera 4 # 8-20, Popayán',
                'lat' => 2.4402, 'lng' => -76.6130,
                'categories' => ['Desayunos', 'Cafetería'],
            ],
            [
                'email' => 'hola@barrafresca.com',
                'name' => 'Barra Fresca',
                'description' => 'Batidos de fruta, smoothies y snacks saludables para cualquier momento.',
                'address' => 'Calle 10 # 6-30, Popayán',
                'lat' => 2.4422, 'lng' => -76.6122,
                'categories' => ['Saludable', 'Bebidas'],
            ],
            [
                'email' => 'chino@paraiso.com',
                'name' => 'Paraíso Chino',
                'description' => 'Arroz cantón, chop suey, lumpias y comida china tradicional.',
                'address' => 'Carrera 8 # 12-50, Popayán',
                'lat' => 2.4435, 'lng' => -76.6150,
                'categories' => ['Asiática', 'China'],
            ],
            [
                'email' => 'arepas@donaelena.com',
                'name' => 'Arepas Doña Elena',
                'description' => 'Arepas de maíz peto rellenas de queso, carne desmechada, pollo y todo lo que gustes.',
                'address' => 'Calle 13 # 5-10, Popayán',
                'lat' => 2.4410, 'lng' => -76.6140,
                'categories' => ['Arepas', 'Comida Típica'],
            ],
            [
                'email' => 'sandwich@gourmet.com',
                'name' => 'Sandwich Gourmet',
                'description' => 'Sándwiches artesanales preparados al instante con panes seleccionados.',
                'address' => 'Carrera 7 # 16-20, Popayán',
                'lat' => 2.4450, 'lng' => -76.6110,
                'categories' => ['Sándwiches', 'Comida Rápida'],
            ],
            [
                'email' => 'sopas@elrincon.com',
                'name' => 'Sopas El Rincón',
                'description' => 'Sancochos, ajiacos y mondongos preparados con leña y amor.',
                'address' => 'Calle 4 # 9-85, Popayán',
                'lat' => 2.4395, 'lng' => -76.6160,
                'categories' => ['Comida Típica', 'Sopas'],
            ],
            [
                'email' => 'alitas@house.com',
                'name' => 'Wings & Beer House',
                'description' => 'Alitas de pollo crujientes bañadas en variedad de salsas artesanales.',
                'address' => 'Carrera 9 # 20N-15, Popayán',
                'lat' => 2.4560, 'lng' => -76.6010,
                'categories' => ['Alitas', 'Comida Rápida'],
            ],
            [
                'email' => 'shawarma@eldesierto.com',
                'name' => 'Árabe El Desierto',
                'description' => 'Shawarmas de carne y pollo, falafel, hummus y comida del Medio Oriente.',
                'address' => 'Calle 10N # 8-32, Popayán',
                'lat' => 2.4510, 'lng' => -76.6050,
                'categories' => ['Árabe', 'Shawarma'],
            ],
            [
                'email' => 'crepes@antojo.com',
                'name' => 'Crepes Antojos',
                'description' => 'Crepes dulces y salados, waffles esponjosos y helado de primera.',
                'address' => 'Carrera 9 # 12N-55, Popayán',
                'lat' => 2.4530, 'lng' => -76.6030,
                'categories' => ['Postres', 'Crepes'],
            ],
            [
                'email' => 'donas@sweet.com',
                'name' => 'Sweet Donuts',
                'description' => 'Las donas más frescas y decoradas de la ciudad acompañadas de café.',
                'address' => 'Calle 15 # 9-80, Popayán',
                'lat' => 2.4460, 'lng' => -76.6135,
                'categories' => ['Postres', 'Donas'],
            ],
        ];

        foreach ($restaurantsData as $index => $data) {
            $userNum = $index + 1;
            $owner = User::where('email', "restaurante{$userNum}@foodapp.com")->first();

            if (!$owner) continue;

            // Crear el restaurante
            $restaurant = Restaurant::updateOrCreate(
                ['user_id' => $owner->id],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'address' => $data['address'],
                    'lat' => $data['lat'],
                    'lng' => $data['lng'],
                    'phone' => '602' . str_pad($userNum, 7, '0', STR_PAD_LEFT),
                    'email' => $data['email'],
                    'delivery_cost' => rand(2500, 5000),
                    'minimum_order' => rand(12000, 20000),
                    'delivery_time_min' => rand(20, 40),
                    'average_rating' => rand(40, 50) / 10,
                    'total_reviews' => 0,
                    'is_active' => true,
                    'is_verified' => true,
                ]
            );

            // Relacionar categorías de restaurante (RestaurantCategory)
            foreach ($data['categories'] as $catName) {
                $category = RestaurantCategory::firstOrCreate(['name' => $catName]);
                $restaurant->restaurantCategories()->syncWithoutDetaching([$category->id]);
            }

            // Crear Horarios (Lunes a Sábado abierto, Domingo cerrado)
            $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            foreach ($daysOfWeek as $day) {
                RestaurantSchedule::updateOrCreate(
                    [
                        'restaurant_id' => $restaurant->id,
                        'day' => $day,
                    ],
                    [
                        'opening_time' => '09:00:00',
                        'closing_time' => '22:00:00',
                        'is_closed' => ($day === 'sunday'),
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
