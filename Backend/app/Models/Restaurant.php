<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Restaurant extends Model
{
    use HasFactory;

    protected array $allowedIncludes = [
        'owner',
        'restaurantCategories',
        'schedules',
        'categories',
        'categories.products',
        'reviews',
    ];

    protected array $allowedSorts = [
        'id',
        'name',
        'average_rating',
        'delivery_time_min',
        'delivery_cost',
        'created_at',
    ];

    protected $fillable = [
        'user_id', 'name', 'description', 'logo', 'banner',
        'address', 'lat', 'lng', 'phone', 'email',
        'delivery_cost', 'minimum_order', 'delivery_time_min',
        'average_rating', 'total_reviews',
        'is_active', 'is_verified',
    ];

    protected $casts = [
        'lat'              => 'decimal:8',
        'lng'              => 'decimal:8',
        'delivery_cost'    => 'decimal:2',
        'minimum_order'    => 'decimal:2',
        'average_rating'   => 'decimal:2',
        'is_active'        => 'boolean',
        'is_verified'      => 'boolean',
    ];

    // ─── Helpers ───────────────────────────────────────────────
    public function updateRating(): void
    {
        $this->update([
            'average_rating' => round($this->reviews()->avg('rating'), 2),
            'total_reviews'  => $this->reviews()->count(),
        ]);
    }

    // ─── Relaciones ────────────────────────────────────────────
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function restaurantCategories(): BelongsToMany
    {
        return $this->belongsToMany(RestaurantCategory::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(RestaurantSchedule::class);
    }

    public function deliveryZones(): HasMany
    {
        return $this->hasMany(DeliveryZone::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class);
    }

    // ─── Scopes ────────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%");
        });
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
        if (request()->filled('search')) {
            $query->search((string) request('search'));
        }

        if (request()->filled('category_id')) {
            $categoryId = request('category_id');
            $query->whereHas('restaurantCategories', function ($q) use ($categoryId) {
                $q->where('restaurant_category_id', $categoryId);
            });
        }

        if (request()->filled('active')) {
            $query->where('is_active', request()->boolean('active'));
        }

        if (request()->filled('verified')) {
            $query->where('is_verified', request()->boolean('verified'));
        }

        return $query;
    }

    public function scopeSort($query)
    {
        $sort = (string) request()->query('sort', 'rating');

        $aliases = [
            'rating' => ['average_rating', 'desc'],
            'delivery' => ['delivery_time_min', 'asc'],
            'cost' => ['delivery_cost', 'asc'],
        ];

        if (array_key_exists($sort, $aliases)) {
            [$column, $direction] = $aliases[$sort];
            return $query->orderBy($column, $direction);
        }

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');

        if (!in_array($column, $this->allowedSorts, true)) {
            $column = 'average_rating';
            $direction = 'desc';
        }

        return $query->orderBy($column, $direction);
    }

    public function scopeGetOrPaginate($query)
    {
        if (request()->boolean('paginate', true)) {
            $perPage = (int) request()->query('per_page', 12);
            $perPage = max(1, min($perPage, 100));

            return $query->paginate($perPage);
        }

        return $query->get();
    }
}
