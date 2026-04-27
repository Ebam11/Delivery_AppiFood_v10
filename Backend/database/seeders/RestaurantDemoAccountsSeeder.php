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

                $restaurant = Restaurant::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'name' => $restaurantName,
                        'description' => "Restaurante de {$category->name} atendido por {$ownerName}.",
                        'address' => 'Popayán, Cauca',
                        'phone' => $phone,
                        'email' => $email,
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

                // Crear horarios para todos los días
                // Abierto de 11:00 a 23:00 todos los días
                $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                foreach ($daysOfWeek as $day) {
                    RestaurantSchedule::updateOrCreate(
                        [
                            'restaurant_id' => $restaurant->id,
                            'day' => $day,
                        ],
                        [
                            'opening_time' => '11:00',
                            'closing_time' => '23:00',
                            'is_closed' => false,
                        ]
                    );
                }
            }
        }
    }
}
