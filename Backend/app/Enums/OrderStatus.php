<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case PREPARING = 'preparing';
    case ON_THE_WAY = 'on_the_way';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pendiente',
            self::CONFIRMED => 'Confirmado',
            self::PREPARING => 'Preparando',
            self::ON_THE_WAY => 'En camino',
            self::DELIVERED => 'Entregado',
            self::CANCELLED => 'Cancelado',
        };
    }

    public function canTransitionTo(self $newStatus): bool
    {
        if ($this === $newStatus) {
            return true;
        }

        return match ($this) {
            self::PENDING => in_array($newStatus, [self::CONFIRMED, self::CANCELLED], true),
            self::CONFIRMED => in_array($newStatus, [self::PREPARING, self::CANCELLED], true),
            self::PREPARING => in_array($newStatus, [self::ON_THE_WAY, self::CANCELLED], true),
            self::ON_THE_WAY => in_array($newStatus, [self::DELIVERED], true),
            self::DELIVERED, self::CANCELLED => false,
        };
    }

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
