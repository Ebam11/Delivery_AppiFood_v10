<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'address',
        'lat', 'lng', 'is_default',
    ];

    protected $casts = [
        'lat'        => 'decimal:8',
        'lng'        => 'decimal:8',
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Al poner una dirección como default, quita las demás
    public function setAsDefault(): void
    {
        Address::where('user_id', $this->user_id)
               ->where('id', '!=', $this->id)
               ->update(['is_default' => false]);

        $this->update(['is_default' => true]);
    }
}
