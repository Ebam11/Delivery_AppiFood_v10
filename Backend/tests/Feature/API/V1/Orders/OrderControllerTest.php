<?php

namespace Tests\Feature\API\V1\Orders;

use App\Models\User;
use App\Models\Order;
use App\Models\Restaurant;
use App\Enums\UserRole;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class OrderControllerTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test usuario autenticado puede listar sus órdenes
     */
    public function test_user_can_list_their_orders(): void
    {
        // Arrange
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();
        Order::factory()->count(3)->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders');

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'data',
                'message',
            ]);
    }

    /**
     * Test usuario sin autenticación no puede listar órdenes
     */
    public function test_unauthenticated_user_cannot_list_orders(): void
    {
        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(401);
    }

    /**
     * Test usuario no puede ver órdenes de otro usuario
     */
    public function test_user_cannot_view_other_users_orders(): void
    {
        // Arrange
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user2->id,
            'restaurant_id' => $restaurant->id,
        ]);

        // Act
        $response = $this->actingAs($user1, 'sanctum')
            ->getJson("/api/v1/orders/{$order->id}");

        // Assert
        $response->assertStatus(404);
    }

    /**
     * Test usuario solo puede cancelar órdenes pendientes
     */
    public function test_user_can_only_cancel_pending_orders(): void
    {
        // Arrange
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => 'delivered',
        ]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/orders/{$order->id}");

        // Assert
        $response->assertStatus(422)
            ->assertJsonPath('message', 'Solo se pueden cancelar órdenes pendientes');
    }

    /**
     * Test usuario puede crear orden
     */
    public function test_user_can_create_order(): void
    {
        // Arrange
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();
        $address = $user->addresses()->create([
            'street' => 'Main St',
            'city' => 'New York',
        ]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders', [
                'restaurant_id' => $restaurant->id,
                'address_id' => $address->id,
                'items' => [
                    ['product_id' => 1, 'quantity' => 2],
                ],
                'payment_method' => 'card',
            ]);

        // Assert
        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }
}
