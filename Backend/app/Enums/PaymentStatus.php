<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING   = 'pending';
    case COMPLETED = 'completed';
    case FAILED    = 'failed';
    case REFUNDED  = 'refunded';

    public function label(): string
    {
        return match($this) {
            self::PENDING   => 'Pendiente',
            self::COMPLETED => 'Completado',
            self::FAILED    => 'Fallido',
            self::REFUNDED  => 'Reembolsado',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING   => 'yellow',
            self::COMPLETED => 'green',
            self::FAILED    => 'red',
            self::REFUNDED  => 'blue',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
