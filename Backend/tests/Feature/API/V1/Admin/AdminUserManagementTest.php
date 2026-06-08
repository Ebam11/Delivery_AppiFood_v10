<?php

namespace Tests\Feature\API\V1\Admin;

use App\Models\User;
use App\Enums\UserRole;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class AdminUserManagementTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test admin puede listar usuarios
     */
    public function test_admin_can_list_users(): void
    {
        // Arrange
        $admin = User::factory()->create(['role' => UserRole::ADMIN->value]);
        User::factory()->count(5)->create();

        // Act
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/users');

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Test usuario normal NO puede listar usuarios admin
     */
    public function test_regular_user_cannot_list_users(): void
    {
        // Arrange
        $user = User::factory()->create(['role' => UserRole::USER->value]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/admin/users');

        // Assert
        $response->assertStatus(403);
    }

    /**
     * Test admin puede ver detalles de usuario
     */
    public function test_admin_can_view_user_details(): void
    {
        // Arrange
        $admin = User::factory()->create(['role' => UserRole::ADMIN->value]);
        $user = User::factory()->create();

        // Act
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/admin/users/{$user->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.id', $user->id);
    }

    /**
     * Test admin puede actualizar usuario
     */
    public function test_admin_can_update_user(): void
    {
        // Arrange
        $admin = User::factory()->create(['role' => UserRole::ADMIN->value]);
        $user = User::factory()->create();

        // Act
        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$user->id}", [
                'name' => 'Updated Name',
                'status' => false,
            ]);

        // Assert
        $response->assertStatus(200);
        $user->refresh();
        $this->assertEquals('Updated Name', $user->name);
        $this->assertFalse($user->status);
    }

    /**
     * Test admin puede eliminar usuario
     */
    public function test_admin_can_delete_user(): void
    {
        // Arrange
        $admin = User::factory()->create(['role' => UserRole::ADMIN->value]);
        $user = User::factory()->create();
        $userId = $user->id;

        // Act
        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/users/{$userId}");

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    /**
     * Test admin puede crear usuario
     */
    public function test_admin_can_create_user(): void
    {
        // Arrange
        $admin = User::factory()->create(['role' => UserRole::ADMIN->value]);

        // Act
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/users', [
                'name' => 'New User',
                'email' => 'newuser@example.com',
                'password' => 'password123',
                'role' => UserRole::USER->value,
            ]);

        // Assert
        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }
}
