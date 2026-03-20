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
