<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\Cacheable;

class PaymentMethod extends Model
{
    use HasFactory, Cacheable;

    protected $cachePrefix = 'payment_methods';
    protected $cacheTime = 1440;

    protected $fillable = ['name', 'type', 'icon', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
