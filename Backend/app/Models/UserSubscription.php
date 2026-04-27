<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan',
        'status',
        'price',
        'starts_at',
        'ends_at',
        'cancelled_at',
        'payment_reference',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'price' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->ends_at?->isFuture();
    }

    public function getDurationInDays(): int
    {
        if (!$this->starts_at || !$this->ends_at) {
            return 0;
        }

        return $this->ends_at->diffInDays($this->starts_at);
    }

    public function getDaysRemaining(): int
    {
        if (!$this->ends_at || !$this->isActive()) {
            return 0;
        }

        return now()->diffInDays($this->ends_at);
    }
}
