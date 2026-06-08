<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'restaurant_id', 'coupon_id',
        'delivery_address', 'delivery_lat', 'delivery_lng',
        'subtotal', 'delivery_cost', 'discount', 'total',
        'status', 'notes',
        'driver_id', 'driver_lat', 'driver_lng',
    ];

    protected $casts = [
        'subtotal'      => 'decimal:2',
        'delivery_cost' => 'decimal:2',
        'discount'      => 'decimal:2',
        'total'         => 'decimal:2',
        'delivery_lat'  => 'decimal:8',
        'delivery_lng'  => 'decimal:8',
        'driver_lat'    => 'decimal:8',
        'driver_lng'    => 'decimal:8',
        'status'        => OrderStatus::class,
    ];

    public function canTransitionTo(OrderStatus $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    public function transitionTo(OrderStatus $newStatus): bool
    {
        if (!$this->canTransitionTo($newStatus)) return false;
        $this->update(['status' => $newStatus]);

        // Guarda el historial en order_tracking
        $this->tracking()->create([
            'status'     => $newStatus->value,
            'changed_at' => now(),
        ]);

        return true;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function tracking(): HasMany
    {
        return $this->hasMany(OrderTracking::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function scopeByStatus($query, OrderStatus $status)
    {
        return $query->where('status', $status->value);
    }

    public function scopeForRestaurant($query, int $restaurantId)
    {
        return $query->where('restaurant_id', $restaurantId);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
