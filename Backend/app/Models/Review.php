<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected array $allowedIncludes = ['user', 'restaurant', 'order'];
    protected array $allowedSorts = ['id', 'rating', 'created_at'];

    protected $fillable = [
        'user_id', 'restaurant_id', 'order_id',
        'rating', 'comment', 'restaurant_reply',
    ];

    protected $casts = ['rating' => 'integer'];

    // Al crear o eliminar una reseña, actualiza el rating del restaurante
    protected static function booted(): void
    {
        static::created(fn($review) => $review->restaurant->updateRating());
        static::deleted(fn($review) => $review->restaurant->updateRating());
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function scopeIncluded($query)
    {
        $include = request()->query('include');

        if (!$include) {
            return $query;
        }

        $includes = collect(explode(',', (string) $include))
            ->map(fn ($value) => trim($value))
            ->filter(fn ($value) => in_array($value, $this->allowedIncludes, true))
            ->values()
            ->all();

        if (!empty($includes)) {
            $query->with($includes);
        }

        return $query;
    }

    public function scopeFilter($query)
    {
        if (request()->filled('restaurant_id')) {
            $query->where('restaurant_id', request('restaurant_id'));
        }

        if (request()->filled('user_id')) {
            $query->where('user_id', request('user_id'));
        }

        if (request()->filled('min_rating')) {
            $query->where('rating', '>=', request('min_rating'));
        }

        if (request()->filled('max_rating')) {
            $query->where('rating', '<=', request('max_rating'));
        }

        return $query;
    }

    public function scopeSort($query)
    {
        $sort = (string) request()->query('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');

        if (!in_array($column, $this->allowedSorts, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        return $query->orderBy($column, $direction);
    }

    public function scopeGetOrPaginate($query)
    {
        if (request()->boolean('paginate', true)) {
            $perPage = (int) request()->query('per_page', 10);
            $perPage = max(1, min($perPage, 100));

            return $query->paginate($perPage);
        }

        return $query->get();
    }
}
