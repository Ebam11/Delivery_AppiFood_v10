<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected array $allowedIncludes = ['restaurant', 'orders', 'addresses', 'reviews', 'favorites', 'cart'];
    protected array $allowedSorts = ['id', 'name', 'email', 'role', 'status', 'created_at'];

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'phone', 'id_number', 'birth_date', 'gender', 'avatar', 'status',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'role'              => UserRole::class,
        'status'            => 'boolean',
        'birth_date'        => 'date',
    ];

    // ─── Helpers de rol ────────────────────────────────────────
    public function userRole(): UserRole
    {
        return $this->role;
    }

    public function isAdmin(): bool      { return $this->role === UserRole::ADMIN; }
    public function isRestaurant(): bool { return $this->role === UserRole::RESTAURANT; }
    public function isUser(): bool       { return $this->role === UserRole::USER; }

    // ─── Relaciones ────────────────────────────────────────────
    public function restaurant(): HasOne
    {
        return $this->hasOne(Restaurant::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function cart(): HasOne
    {
        return $this->hasOne(ShoppingCart::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // ─── Scopes ────────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function scopeByRole($query, UserRole $role)
    {
        return $query->where('role', $role->value);
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
        if (request()->filled('role')) {
            $query->where('role', request('role'));
        }

        if (request()->filled('search')) {
            $term = (string) request('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%");
            });
        }

        if (request()->filled('status')) {
            $query->where('status', request()->boolean('status'));
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
