<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\Cacheable;

class Product extends Model
{
    use HasFactory, Cacheable;

    protected $cachePrefix = 'products';
    protected $cacheTime = 60;

    protected array $allowedIncludes = ['category', 'restaurant'];
    protected array $allowedSorts = ['id', 'name', 'price', 'discount_price', 'is_available', 'is_featured', 'created_at'];
protected $fillable = [
        'restaurant_id', 'category_id', 'name', 'description',
        'image', 'price', 'discount_price',
        'is_available', 'is_featured', 'stock', 'prep_time_minutes',
    ];

    protected $casts = [
        'price'             => 'decimal:2',
        'discount_price'    => 'decimal:2',
        'is_available'      => 'boolean',
        'is_featured'       => 'boolean',
        'stock'             => 'integer',
        'prep_time_minutes' => 'integer',
    ];

    // ─── Helpers ───────────────────────────────────────────────
    public function getFinalPriceAttribute(): float
    {
        return $this->discount_price ?? $this->price;
    }

    public function hasDiscount(): bool
    {
        return !is_null($this->discount_price)
            && $this->discount_price < $this->price;
    }

    // ─── Relaciones ────────────────────────────────────────────
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    // ─── Scopes ────────────────────────────────────────────────
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where('name', 'like', "%{$term}%")
                     ->orWhere('description', 'like', "%{$term}%");
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
            $term = (string) request('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%");
            });
        }

        if (request()->filled('category_id')) {
            $query->where('category_id', request('category_id'));
        }

        if (request()->filled('available')) {
            $query->where('is_available', request()->boolean('available'));
        }

        if (request()->filled('featured')) {
            $query->where('is_featured', request()->boolean('featured'));
        }

        if (request()->filled('min_price')) {
            $query->where('price', '>=', request('min_price'));
        }

        if (request()->filled('max_price')) {
            $query->where('price', '<=', request('max_price'));
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
            $perPage = (int) request()->query('per_page', 20);
            $perPage = max(1, min($perPage, 100));

            return $query->paginate($perPage);
        }

        return $query->get();
    }
}
