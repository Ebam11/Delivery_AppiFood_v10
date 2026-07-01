<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\RestaurantSchedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RestaurantDemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $password = 'Password123!';

        $people = [
            'Camila Rojas', 'Andrés Torres', 'Valentina Pérez', 'Santiago Gómez', 'Laura Martínez',
            'Daniel Herrera', 'Paula Ramírez', 'Mateo López', 'Sofía Vargas', 'Juan David Ruiz',
            'Mariana Castillo', 'Felipe Moreno', 'Juliana Ortiz', 'Sebastián Navarro', 'Natalia Cárdenas',
            'Diego Herrera', 'Andrea Salazar', 'Luis Fernando Mejía', 'Laura Sofía Peña', 'Carlos Alberto Díaz',
            'Diana Marcela Pineda', 'José Manuel Sánchez', 'Sara Juliana Arias', 'Nicolás Pérez', 'Paola Andrea Ríos',
            'Jorge Andrés Molina', 'Isabela Duarte', 'Tomás Restrepo', 'Mónica Valencia', 'Esteban Giraldo',
            'Adriana Benítez', 'Mauricio Quintero', 'Catalina Ospina', 'Ricardo Fernández', 'Gabriela Bonilla',
            'Héctor Ramírez', 'Nathalia Muñoz', 'Óscar Gómez', 'Paula Andrea Mora', 'Ángel Navarro',
            'Verónica Rojas', 'Cristian Suárez', 'Melissa Torres', 'Alberto Cruz', 'Jimena Martínez',
            'Andrés Felipe Pardo', 'María Paula Gil', 'Kevin Andrés León', 'Luisa Fernanda Castillo', 'Brayan Stiven Muñoz',
            'Alejandra Gómez', 'David Alejandro Rincón', 'Tatiana Castaño', 'Sergio Andrés Velasco', 'Daniela Rodríguez',
            'Juan Pablo Herrera', 'Katherine López', 'Miguel Ángel Peña', 'Camilo Andrés Mora', 'Natalia Restrepo',
        ];

        $categories = RestaurantCategory::where('is_active', true)->orderBy('id')->get();
        $personIndex = 0;
        $globalIndex = 0;

        foreach ($categories as $category) {
            for ($i = 1; $i <= 5; $i++) {
                $ownerName = $people[$personIndex % count($people)];
                $personIndex++;
                $globalIndex++;

                $ownerSlug = Str::slug($ownerName);
                $categorySlug = Str::slug($category->name);
                $email = "{$ownerSlug}.{$categorySlug}.{$i}@appifood.test";
                $restaurantName = "{$category->name} de " . Str::afterLast($ownerName, ' ');
                $phone = '310' . str_pad((string) (1000000 + $globalIndex), 7, '0', STR_PAD_LEFT);

                $user = User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $ownerName,
                        'password' => Hash::make($password),
                        'role' => UserRole::RESTAURANT,
                        'phone' => $phone,
                        'status' => true,
                    ]
                );

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

                $imgUrl = $banners[$globalIndex % count($banners)];

                // Generar geolocalización aleatoria dentro del casco urbano de Popayán (más dispersos para pruebas de distancia)
                $randomLat = 2.4448 + (rand(-300, 300) / 10000);
                $randomLng = -76.6147 + (rand(-300, 300) / 10000);

                $restaurant = Restaurant::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'name' => $restaurantName,
                        'description' => "Restaurante de {$category->name} atendido por {$ownerName}.",
                        'address' => 'Popayán, Cauca',
                        'phone' => $phone,
                        'email' => $email,
                        'logo' => $imgUrl,
                        'banner' => $imgUrl,
                        'lat' => $randomLat,
                        'lng' => $randomLng,
                        'delivery_cost' => random_int(2000, 6000),
                        'minimum_order' => random_int(10000, 30000),
                        'delivery_time_min' => random_int(15, 40),
                        'average_rating' => random_int(42, 49) / 10,
                        'total_reviews' => random_int(0, 80),
                        'is_active' => true,
                        'is_verified' => true,
                    ]
                );

                $restaurant->restaurantCategories()->syncWithoutDetaching([$category->id]);

                // Crear horarios para todos los días (Abierto 24/7 para facilitar pruebas)
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
            }
        }
    }
}
