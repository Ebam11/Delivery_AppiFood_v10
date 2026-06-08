<?php

namespace Tests\Feature\API\V1\Users;

use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UserControllerTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test usuario autenticado puede ver su perfil
     */
    public function test_authenticated_user_can_view_profile(): void
    {
        // Arrange
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/users/me');

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.email', 'john@example.com')
            ->assertJsonPath('data.name', 'John Doe');
    }

    /**
     * Test usuario sin autenticación no puede ver perfil
     */
    public function test_unauthenticated_user_cannot_view_profile(): void
    {
        $response = $this->getJson('/api/v1/users/me');

        $response->assertStatus(401);
    }

    /**
     * Test usuario puede actualizar su perfil
     */
    public function test_user_can_update_profile(): void
    {
        // Arrange
        $user = User::factory()->create();

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/users/me', [
                'name' => 'Jane Doe',
                'phone' => '9876543210',
            ]);

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.name', 'Jane Doe');

        $user->refresh();
        $this->assertEquals('Jane Doe', $user->name);
    }

    /**
     * Test email debe ser único al actualizar
     */
    public function test_email_must_be_unique_on_update(): void
    {
        // Arrange
        $user1 = User::factory()->create();
        $user2 = User::factory()->create(['email' => 'taken@example.com']);

        // Act
        $response = $this->actingAs($user1, 'sanctum')
            ->putJson('/api/v1/users/me', [
                'email' => 'taken@example.com',
            ]);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test usuario puede eliminar su cuenta
     */
    public function test_user_can_delete_account(): void
    {
        // Arrange
        $user = User::factory()->create();
        $userId = $user->id;

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/users/me');

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verificar que el usuario fue eliminado
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }
}
