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
        $restaurants = [
            [
                'owner_email'       => 'restaurante1@foodapp.com',
                'name'              => 'Burger House',
                'description'       => 'Las mejores hamburguesas de la ciudad, hechas con carne 100% de res.',
                'address'           => 'Calle 15 # 8-23, Popayán',
                'lat'               => 2.4448,
                'lng'               => -76.6147,
                'phone'             => '6028901234',
                'email'             => 'info@burgerhouse.com',
                'delivery_cost'     => 3500,
                'minimum_order'     => 15000,
                'delivery_time_min' => 25,
                'average_rating'    => 4.5,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => ['Restaurantes Locales', 'Hamburguesas'],
                'opening_time'      => '09:00:00',
                'closing_time'      => '22:00:00',
                'closed_days'       => ['sunday'],
            ],
                [
                    'owner_email'       => 'restaurante7@foodapp.com',
                    'name'              => 'Pollo Dorado',
                    'description'       => 'Pollo asado, broaster y acompañamientos caseros con sabor de barrio.',
                    'address'           => 'Calle 21 # 10-15, Popayán',
                    'lat'               => 2.4464,
                    'lng'               => -76.6108,
                    'phone'             => '6028921111',
                    'email'             => 'hola@pollodorado.com',
                    'delivery_cost'     => 3000,
                    'minimum_order'     => 16000,
                    'delivery_time_min' => 28,
                    'average_rating'    => 4.6,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Pollo Asado', 'Pollo'],
                    'opening_time'      => '11:00:00',
                    'closing_time'      => '22:30:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante8@foodapp.com',
                    'name'              => 'Mariscos del Puerto',
                    'description'       => 'Ceviches, cazuelas y pescado fresco del día con sazón costera.',
                    'address'           => 'Avenida del Río # 8-50, Popayán',
                    'lat'               => 2.4476,
                    'lng'               => -76.6058,
                    'phone'             => '6028922222',
                    'email'             => 'contacto@mariscosdelpuerto.com',
                    'delivery_cost'     => 5000,
                    'minimum_order'     => 28000,
                    'delivery_time_min' => 35,
                    'average_rating'    => 4.7,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Comida de Mar', 'Mariscos'],
                    'opening_time'      => '12:00:00',
                    'closing_time'      => '22:00:00',
                    'closed_days'       => ['monday'],
                ],
                [
                    'owner_email'       => 'restaurante9@foodapp.com',
                    'name'              => 'Trattoria Bella',
                    'description'       => 'Pizzas artesanales y pastas frescas con recetas clásicas italianas.',
                    'address'           => 'Carrera 6 # 15-28, Popayán',
                    'lat'               => 2.4428,
                    'lng'               => -76.6141,
                    'phone'             => '6028923333',
                    'email'             => 'hola@trattoriabella.com',
                    'delivery_cost'     => 4500,
                    'minimum_order'     => 22000,
                    'delivery_time_min' => 32,
                    'average_rating'    => 4.8,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Comida Casera', 'Italiana'],
                    'opening_time'      => '12:00:00',
                    'closing_time'      => '23:00:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante10@foodapp.com',
                    'name'              => 'Dulce Tentación',
                    'description'       => 'Postres, tortas y helados caseros para antojos de cualquier hora.',
                    'address'           => 'Carrera 4 # 20-18, Popayán',
                    'lat'               => 2.4408,
                    'lng'               => -76.6192,
                    'phone'             => '6028924444',
                    'email'             => 'hola@dulcetentacion.com',
                    'delivery_cost'     => 2500,
                    'minimum_order'     => 12000,
                    'delivery_time_min' => 18,
                    'average_rating'    => 4.9,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Panadería y Postres'],
                    'opening_time'      => '10:00:00',
                    'closing_time'      => '21:30:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante11@foodapp.com',
                    'name'              => 'Café Madrugón',
                    'description'       => 'Desayunos completos, café de especialidad y pan recién horneado.',
                    'address'           => 'Calle 11 # 5-32, Popayán',
                    'lat'               => 2.4416,
                    'lng'               => -76.6121,
                    'phone'             => '6028925555',
                    'email'             => 'hola@cafemadrugon.com',
                    'delivery_cost'     => 3000,
                    'minimum_order'     => 14000,
                    'delivery_time_min' => 15,
                    'average_rating'    => 4.7,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Desayunos Típicos', 'Desayunos'],
                    'opening_time'      => '06:30:00',
                    'closing_time'      => '13:30:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante12@foodapp.com',
                    'name'              => 'Barra Fresca',
                    'description'       => 'Batidos, jugos naturales y bebidas frías para acompañar cualquier pedido.',
                    'address'           => 'Avenida Panamericana # 9-40, Popayán',
                    'lat'               => 2.4394,
                    'lng'               => -76.6251,
                    'phone'             => '6028926666',
                    'email'             => 'hola@barrafresca.com',
                    'delivery_cost'     => 2200,
                    'minimum_order'     => 10000,
                    'delivery_time_min' => 12,
                    'average_rating'    => 4.5,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Bebidas Tradicionales'],
                    'opening_time'      => '08:00:00',
                    'closing_time'      => '21:00:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante13@foodapp.com',
                    'name'              => 'Empanadas El Parque',
                    'description'       => 'Empanadas, marranitas y fritos recién hechos con el sabor callejero de Popayán.',
                    'address'           => 'Calle 5 # 3-18, Popayán',
                    'lat'               => 2.4441,
                    'lng'               => -76.6089,
                    'phone'             => '6028927777',
                    'email'             => 'hola@empanadaselparque.com',
                    'delivery_cost'     => 2500,
                    'minimum_order'     => 10000,
                    'delivery_time_min' => 20,
                    'average_rating'    => 4.6,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Empanadas y Fritos'],
                    'opening_time'      => '07:00:00',
                    'closing_time'      => '19:00:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante14@foodapp.com',
                    'name'              => 'Tamales del Alba',
                    'description'       => 'Tamales tolimenses, envueltos y desayunos tradicionales listos desde temprano.',
                    'address'           => 'Carrera 8 # 6-22, Popayán',
                    'lat'               => 2.4433,
                    'lng'               => -76.6158,
                    'phone'             => '6028928888',
                    'email'             => 'hola@tamalesdelalba.com',
                    'delivery_cost'     => 3000,
                    'minimum_order'     => 12000,
                    'delivery_time_min' => 18,
                    'average_rating'    => 4.7,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Tamales'],
                    'opening_time'      => '05:30:00',
                    'closing_time'      => '11:30:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante15@foodapp.com',
                    'name'              => 'Dulces del Centro',
                    'description'       => 'Postres artesanales, tortas, gelatinas y antojos dulces para la tarde.',
                    'address'           => 'Calle 10 # 4-15, Popayán',
                    'lat'               => 2.4429,
                    'lng'               => -76.6112,
                    'phone'             => '6028929999',
                    'email'             => 'hola@dulcesdelcentro.com',
                    'delivery_cost'     => 2000,
                    'minimum_order'     => 9000,
                    'delivery_time_min' => 15,
                    'average_rating'    => 4.8,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Postres'],
                    'opening_time'      => '11:00:00',
                    'closing_time'      => '21:00:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante16@foodapp.com',
                    'name'              => 'Sopas del Claustro',
                    'description'       => 'Sopas tradicionales, mazamorra y platos de cuchara con sazón payanés.',
                    'address'           => 'Carrera 5 # 2-14, Popayán',
                    'lat'               => 2.4423,
                    'lng'               => -76.6078,
                    'phone'             => '6028930001',
                    'email'             => 'hola@sopasdelclaustro.com',
                    'delivery_cost'     => 2800,
                    'minimum_order'     => 11000,
                    'delivery_time_min' => 22,
                    'average_rating'    => 4.6,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Sopas y Caldos', 'Restaurantes Locales'],
                    'opening_time'      => '07:00:00',
                    'closing_time'      => '15:00:00',
                    'closed_days'       => ['sunday'],
                ],
                [
                    'owner_email'       => 'restaurante17@foodapp.com',
                    'name'              => 'La Caserita de Popayán',
                    'description'       => 'Comida casera hecha al momento, menús del día y recetas de casa.',
                    'address'           => 'Calle 7 # 8-26, Popayán',
                    'lat'               => 2.4452,
                    'lng'               => -76.6133,
                    'phone'             => '6028930002',
                    'email'             => 'hola@lacaseritadepopayan.com',
                    'delivery_cost'     => 2600,
                    'minimum_order'     => 12000,
                    'delivery_time_min' => 24,
                    'average_rating'    => 4.7,
                    'total_reviews'     => 0,
                    'is_active'         => true,
                    'is_verified'       => true,
                    'categories'        => ['Comida Casera', 'Restaurantes Locales'],
                    'opening_time'      => '08:00:00',
                    'closing_time'      => '18:00:00',
                    'closed_days'       => ['sunday'],
                ],
            [
                'owner_email'       => 'restaurante2@foodapp.com',
                'name'              => 'Pizza Nostra',
                'description'       => 'Pizza artesanal al horno de leña con ingredientes importados de Italia.',
                'address'           => 'Carrera 7 # 12-45, Popayán',
                'lat'               => 2.4418,
                'lng'               => -76.6117,
                'phone'             => '6028905678',
                'email'             => 'hola@pizzanostra.com',
                'delivery_cost'     => 4000,
                'minimum_order'     => 20000,
                'delivery_time_min' => 35,
                'average_rating'    => 4.8,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => ['Restaurantes Locales', 'Pizza'],
                'opening_time'      => '12:00:00',
                'closing_time'      => '22:30:00',
                'closed_days'       => ['monday'],
            ],
            [
                'owner_email'       => 'restaurante3@foodapp.com',
                'name'              => 'Sushi Zen',
                'description'       => 'Auténtica experiencia japonesa con ingredientes frescos del día.',
                'address'           => 'Avenida 3N # 20-10, Popayán',
                'lat'               => 2.4488,
                'lng'               => -76.6177,
                'phone'             => '6028909012',
                'email'             => 'zen@sushizen.com',
                'delivery_cost'     => 5000,
                'minimum_order'     => 30000,
                'delivery_time_min' => 40,
                'average_rating'    => 4.7,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => ['Restaurantes Locales', 'Japonesa'],
                'opening_time'      => '12:00:00',
                'closing_time'      => '22:30:00',
                'closed_days'       => ['sunday'],
            ],
            [
                'owner_email'       => 'restaurante4@foodapp.com',
                'name'              => 'Parrilla del Valle',
                'description'       => 'Cortes a la parrilla, chorizo artesanal y acompañamientos contundentes.',
                'address'           => 'Calle 9 # 4-20, Popayán',
                'lat'               => 2.4421,
                'lng'               => -76.6079,
                'phone'             => '6028912345',
                'email'             => 'hola@parrilladelvalle.com',
                'delivery_cost'     => 4500,
                'minimum_order'     => 25000,
                'delivery_time_min' => 30,
                'average_rating'    => 4.6,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => ['Asados y Parrilla', 'Parrilla'],
                'opening_time'      => '11:00:00',
                'closing_time'      => '23:00:00',
                'closed_days'       => ['sunday'],
            ],
            [
                'owner_email'       => 'restaurante5@foodapp.com',
                'name'              => 'Tacos del Valle',
                'description'       => 'Tacos al pastor, gringas y salsas caseras con sabor mexicano.',
                'address'           => 'Carrera 5 # 18-31, Popayán',
                'lat'               => 2.4504,
                'lng'               => -76.6188,
                'phone'             => '6028916789',
                'email'             => 'contacto@tacosdelvalle.com',
                'delivery_cost'     => 3500,
                'minimum_order'     => 18000,
                'delivery_time_min' => 20,
                'average_rating'    => 4.5,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => ['Antojitos Payaneses', 'Mexicana'],
                'opening_time'      => '10:00:00',
                'closing_time'      => '22:00:00',
                'closed_days'       => ['monday'],
            ],
            [
                'owner_email'       => 'restaurante6@foodapp.com',
                'name'              => 'Verde Fresco',
                'description'       => 'Bowls, ensaladas y wraps saludables con ingredientes frescos.',
                'address'           => 'Avenida Panamericana # 11-05, Popayán',
                'lat'               => 2.4399,
                'lng'               => -76.6234,
                'phone'             => '6028923456',
                'email'             => 'hola@verdefresco.com',
                'delivery_cost'     => 3000,
                'minimum_order'     => 16000,
                'delivery_time_min' => 18,
                'average_rating'    => 4.7,
                'total_reviews'     => 0,
                'is_active'         => true,
                'is_verified'       => true,
                'categories'        => ['Sopas y Caldos', 'Saludable'],
                'opening_time'      => '07:00:00',
                'closing_time'      => '21:00:00',
                'closed_days'       => ['sunday'],
            ],
        ];

        $days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

        foreach ($restaurants as $data) {
            $ownerEmail = $data['owner_email'];
            $categoryNames = $data['categories'];
            $ownerId = User::where('email', $ownerEmail)->value('id');
            $categoryIds = RestaurantCategory::whereIn('name', $categoryNames)->pluck('id')->all();

            if (!$ownerId) {
                continue;
            }

            $alwaysOpen = $data['always_open'] ?? false;
            $alwaysClosed = $data['always_closed'] ?? false;
            $openingTime = $data['opening_time'] ?? '08:00:00';
            $closingTime = $data['closing_time'] ?? '22:00:00';
            $closedDays = $data['closed_days'] ?? ['sunday'];

            unset($data['owner_email'], $data['categories']);
            unset($data['always_open'], $data['always_closed'], $data['opening_time'], $data['closing_time'], $data['closed_days']);
            $data['user_id'] = $ownerId;

            $restaurant = Restaurant::updateOrCreate(
                ['email' => $data['email']],
                $data
            );

            // Asignar categorías de restaurante
            $restaurant->restaurantCategories()->sync($categoryIds);

            // Crear horarios (lunes a domingo)
            foreach ($days as $day) {
                $isClosed = in_array($day, $closedDays, true);

                if ($alwaysOpen) {
                    $isClosed = false;
                }

                if ($alwaysClosed) {
                    $isClosed = true;
                }

                RestaurantSchedule::updateOrCreate(
                    [
                        'restaurant_id' => $restaurant->id,
                        'day'           => $day,
                    ],
                    [
                        'opening_time'  => $alwaysOpen ? '00:00:00' : $openingTime,
                        'closing_time'  => $alwaysOpen ? '23:59:59' : $closingTime,
                        'is_closed'     => $isClosed,
                    ]
                );
            }

            // Crear zona de entrega
            DeliveryZone::updateOrCreate(
                [
                    'restaurant_id' => $restaurant->id,
                    'name'          => 'Zona Centro',
                ],
                [
                    'delivery_cost'     => $data['delivery_cost'],
                    'delivery_time_min' => $data['delivery_time_min'],
                    'is_active'         => true,
                ]
            );
        }
    }
}
