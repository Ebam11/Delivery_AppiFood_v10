<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id', 'day',
        'opening_time', 'closing_time', 'is_closed',
    ];

    protected $casts = ['is_closed' => 'boolean'];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Verifica si ESTE horario corresponde a hoy Y la hora actual está dentro del rango.
     */
    public function isOpenNow(): bool
    {
        if ($this->is_closed) return false;

        // Verificar que el día de este horario coincide con hoy
        $today = strtolower(now()->englishDayOfWeek);
        if (strtolower($this->day) !== $today) return false;

        $now = now()->format('H:i:s');
        return $now >= $this->opening_time && $now <= $this->closing_time;
    }
}
