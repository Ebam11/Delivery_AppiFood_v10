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
        // ── 2 Administradores ─────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@foodapp.com'],
            [
                'name'     => 'Administrador Principal',
                'password' => Hash::make('password'),
                'role'     => UserRole::ADMIN,
                'phone'    => '3001234567',
                'status'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin2@foodapp.com'],
            [
                'name'     => 'Administrador de Soporte',
                'password' => Hash::make('password'),
                'role'     => UserRole::ADMIN,
                'phone'    => '3001234568',
                'status'   => true,
            ]
        );

        // ── 20 Restaurantes con correos legibles ───────────────────
        $restaurantEmails = [
            'info@burgerhouse.com',
            'contacto@pizzanostra.com',
            'info@sushizen.com',
            'ventas@parrilladelvalle.com',
            'tacos@elvalle.com',
            'hola@verdefresco.com',
            'contacto@pollodorado.com',
            'mariscos@elpuerto.com',
            'trattoria@bella.com',
            'dulce@tentacion.com',
            'cafe@madrugon.com',
            'hola@barrafresca.com',
            'chino@paraiso.com',
            'arepas@donaelena.com',
            'sandwich@gourmet.com',
            'sopas@elrincon.com',
            'alitas@house.com',
            'shawarma@eldesierto.com',
            'crepes@antojo.com',
            'donas@sweet.com',
        ];

        foreach ($restaurantEmails as $index => $email) {
            $num = $index + 1;
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name'     => "Dueño Restaurante {$num}",
                    'password' => Hash::make('password'),
                    'role'     => UserRole::RESTAURANT,
                    'phone'    => '310' . str_pad($num, 7, '0', STR_PAD_LEFT),
                    'status'   => true,
                ]
            );
        }

        // ── 5 Usuarios normales (Clientes) ───────────────────────
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
