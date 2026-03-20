<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id', 'subscription_plan_id',
        'status', 'starts_at', 'ends_at',
    ];

    protected $casts = [
        'status'    => SubscriptionStatus::class,
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    public function isActive(): bool
    {
        return $this->status === SubscriptionStatus::ACTIVE
            && $this->ends_at?->isFuture();
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }
}
