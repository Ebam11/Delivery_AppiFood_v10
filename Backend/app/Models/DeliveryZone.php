<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id', 'name',
        'delivery_cost', 'delivery_time_min',
        'coordinates', 'is_active',
    ];

    protected $casts = [
        'delivery_cost' => 'decimal:2',
        'coordinates'   => 'array',
        'is_active'     => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
