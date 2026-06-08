<?php

namespace Tests\Feature\API\V1\Auth;

use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RefreshTokenTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test usuario puede renovar access token con refresh token válido
     */
    public function test_user_can_refresh_token_with_valid_refresh_token(): void
    {
        // Arrange
        $user = User::factory()->create();
        $user->tokens()->delete();

        // Generar tokens iniciales
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $refreshToken = $loginResponse->json('data.refresh_token');

        // Act
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'access_token',
                    'refresh_token',
                    'expires_in',
                    'type',
                ],
            ])
            ->assertJson(['success' => true]);
    }

    /**
     * Test refresh falla con token inválido
     */
    public function test_refresh_fails_with_invalid_token(): void
    {
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => 'invalid_token_' . str_repeat('x', 100),
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false])
            ->assertJsonPath('message', 'Refresh token inválido o expirado');
    }

    /**
     * Test refresh requiere refresh token
     */
    public function test_refresh_requires_refresh_token(): void
    {
        $response = $this->postJson('/api/v1/auth/refresh', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['refresh_token']);
    }

    /**
     * Test usuario puede revocar sesión
     */
    public function test_user_can_revoke_session(): void
    {
        // Arrange
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Act
        $response = $this->postJson('/api/v1/auth/revoke');

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('message', 'Sesión cerrada exitosamente');

        // Verificar que tokens fueron eliminados
        $user->refresh();
        $this->assertNull($user->refresh_token_hash);
    }

    /**
     * Test revoke requiere autenticación
     */
    public function test_revoke_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/auth/revoke');

        $response->assertStatus(401);
    }
}
