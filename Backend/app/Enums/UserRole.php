<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case RESTAURANT = 'restaurant';
    case USER = 'user';
    case DRIVER = 'driver';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::RESTAURANT => 'Restaurant',
            self::USER => 'User',
            self::DRIVER => 'Driver',
        };
    }

    public static function values(): array
    {
        return array_map(static fn (self $role) => $role->value, self::cases());
    }
}
