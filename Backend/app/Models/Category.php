<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected array $allowedIncludes = ['restaurant', 'products'];
    protected array $allowedSorts = ['id', 'name', 'order', 'is_active', 'created_at'];

    protected $fillable = [
        'restaurant_id', 'name', 'image', 'order', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
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
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        if (request()->filled('active')) {
            $query->where('is_active', request()->boolean('active'));
        }

        if (request()->filled('restaurant_id')) {
            $query->where('restaurant_id', request('restaurant_id'));
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
            $perPage = (int) request()->query('per_page', 15);
            $perPage = max(1, min($perPage, 100));

            return $query->paginate($perPage);
        }

        return $query->get();
    }
}
