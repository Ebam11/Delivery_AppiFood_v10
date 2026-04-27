<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_protected_user_route(): void
    {
        $this->getJson('/api/cart')->assertStatus(401);
    }

    public function test_user_can_access_user_route(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $this->getJson('/api/cart')->assertOk();
    }

    public function test_restaurant_cannot_access_user_only_route(): void
    {
        $restaurantUser = User::factory()->create(['role' => 'restaurant']);
        Sanctum::actingAs($restaurantUser);

        $this->getJson('/api/cart')->assertForbidden();
    }

    public function test_user_cannot_access_admin_route(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_admin_can_access_admin_route(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'users' => ['total', 'customers', 'restaurants', 'new_today'],
                    'restaurants' => ['total', 'active', 'verified', 'pending'],
                    'orders' => ['total', 'today', 'pending', 'delivered', 'cancelled'],
                    'revenue' => ['total', 'today', 'this_month'],
                ],
            ]);
    }

    public function test_user_cannot_access_restaurant_route(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $this->getJson('/api/restaurant/dashboard')->assertForbidden();
    }

    public function test_restaurant_can_access_restaurant_route_group(): void
    {
        $restaurantUser = User::factory()->create(['role' => 'restaurant']);
        Sanctum::actingAs($restaurantUser);

        // The role middleware allows access; 404 is expected because no restaurant profile exists yet.
        $this->getJson('/api/restaurant/dashboard')->assertStatus(404);
    }
}
