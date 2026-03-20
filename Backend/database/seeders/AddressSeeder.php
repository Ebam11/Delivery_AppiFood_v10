<?php

namespace Database\Seeders;

use App\Models\Address;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
    public function run(): void
    {
        $addresses = [
            ['user_id' => 5, 'name' => 'Casa',    'address' => 'Calle 5 # 3-20, Popayán',    'lat' => 2.4428, 'lng' => -76.6137, 'is_default' => true],
            ['user_id' => 5, 'name' => 'Trabajo', 'address' => 'Carrera 9 # 18-40, Popayán', 'lat' => 2.4468, 'lng' => -76.6167, 'is_default' => false],
            ['user_id' => 6, 'name' => 'Casa',    'address' => 'Calle 8 # 6-15, Popayán',    'lat' => 2.4458, 'lng' => -76.6157, 'is_default' => true],
            ['user_id' => 7, 'name' => 'Casa',    'address' => 'Carrera 4 # 10-30, Popayán', 'lat' => 2.4408, 'lng' => -76.6107, 'is_default' => true],
            ['user_id' => 8, 'name' => 'Casa',    'address' => 'Calle 12 # 9-25, Popayán',   'lat' => 2.4478, 'lng' => -76.6187, 'is_default' => true],
            ['user_id' => 9, 'name' => 'Casa',    'address' => 'Avenida 2 # 22-10, Popayán', 'lat' => 2.4398, 'lng' => -76.6097, 'is_default' => true],
        ];

        foreach ($addresses as $address) {
            Address::updateOrCreate(
                [
                    'user_id' => $address['user_id'],
                    'name'    => $address['name'],
                ],
                $address
            );
        }
    }
}
