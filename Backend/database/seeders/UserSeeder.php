<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@foodapp.com'],
            [
                'name'     => 'Administrador',
                'password' => Hash::make('password'),
                'role'     => UserRole::ADMIN,
                'phone'    => '3001234567',
                'status'   => true,
            ]
        );

        // ── Restaurantes ───────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'restaurante1@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Uno',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3109876543',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante2@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Dos',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3204561234',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante3@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Tres',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3151234567',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante4@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Cuatro',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3161234567',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante5@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Cinco',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3171234567',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante6@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Seis',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3181234567',
                'status'   => true,
            ]
        );
            User::updateOrCreate(
                ['email' => 'restaurante7@foodapp.com'],
                [
                    'name'     => 'Dueño Restaurante Siete',
                    'password' => Hash::make('password'),
                    'role'     => UserRole::RESTAURANT,
                    'phone'    => '3191234567',
                    'status'   => true,
                ]
            );
            User::updateOrCreate(
                ['email' => 'restaurante8@foodapp.com'],
                [
                    'name'     => 'Dueño Restaurante Ocho',
                    'password' => Hash::make('password'),
                    'role'     => UserRole::RESTAURANT,
                    'phone'    => '3201234567',
                    'status'   => true,
                ]
            );
            User::updateOrCreate(
                ['email' => 'restaurante9@foodapp.com'],
                [
                    'name'     => 'Dueño Restaurante Nueve',
                    'password' => Hash::make('password'),
                    'role'     => UserRole::RESTAURANT,
                    'phone'    => '3211234567',
                    'status'   => true,
                ]
            );
            User::updateOrCreate(
                ['email' => 'restaurante10@foodapp.com'],
                [
                    'name'     => 'Dueño Restaurante Diez',
                    'password' => Hash::make('password'),
                    'role'     => UserRole::RESTAURANT,
                    'phone'    => '3221234567',
                    'status'   => true,
                ]
            );
            User::updateOrCreate(
                ['email' => 'restaurante11@foodapp.com'],
                [
                    'name'     => 'Dueño Restaurante Once',
                    'password' => Hash::make('password'),
                    'role'     => UserRole::RESTAURANT,
                    'phone'    => '3231234567',
                    'status'   => true,
                ]
            );
            User::updateOrCreate(
                ['email' => 'restaurante12@foodapp.com'],
                [
                    'name'     => 'Dueño Restaurante Doce',
                    'password' => Hash::make('password'),
                    'role'     => UserRole::RESTAURANT,
                    'phone'    => '3241234567',
                    'status'   => true,
                ]
            );

        User::updateOrCreate(
            ['email' => 'restaurante13@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Trece',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3251234567',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante14@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Catorce',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3261234567',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante15@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Quince',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3271234567',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante16@foodapp.com'],
            [
                'name'     => 'Dueña Restaurante Dieciséis',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3281234567',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'restaurante17@foodapp.com'],
            [
                'name'     => 'Dueño Restaurante Diecisiete',
                'password' => Hash::make('password'),
                'role'     => UserRole::RESTAURANT,
                'phone'    => '3291234567',
                'status'   => true,
            ]
        );

        // ── Usuarios normales ──────────────────────────────────
        $usuarios = [
            ['name' => 'Carlos Pérez',    'email' => 'carlos@test.com',   'phone' => '3001111111'],
            ['name' => 'María González',  'email' => 'maria@test.com',    'phone' => '3002222222'],
            ['name' => 'Juan Rodríguez',  'email' => 'juan@test.com',     'phone' => '3003333333'],
            ['name' => 'Ana Martínez',    'email' => 'ana@test.com',      'phone' => '3004444444'],
            ['name' => 'Luis Sánchez',    'email' => 'luis@test.com',     'phone' => '3005555555'],
        ];

        foreach ($usuarios as $usuario) {
            User::updateOrCreate(
                ['email' => $usuario['email']],
                [
                    'name'     => $usuario['name'],
                    'password' => Hash::make('password'),
                    'role'     => UserRole::USER,
                    'phone'    => $usuario['phone'],
                    'status'   => true,
                ]
            );
        }
    }
}
