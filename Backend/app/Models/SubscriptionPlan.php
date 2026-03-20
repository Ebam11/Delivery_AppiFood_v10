<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'monthly_price', 'annual_price',
        'max_products', 'commission_percentage',
        'features', 'is_active',
    ];

    protected $casts = [
        'monthly_price'         => 'decimal:2',
        'annual_price'          => 'decimal:2',
        'commission_percentage' => 'decimal:2',
        'features'              => 'array',
        'is_active'             => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
