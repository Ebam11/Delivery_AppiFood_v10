<?php

namespace Tests\Feature\API\V1\Auth;

use App\Models\User;
use App\Enums\UserRole;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class LoginTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test usuario puede hacer login con credenciales válidas
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Act
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
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
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role',
                    ]
                ],
                'message',
            ])
            ->assertJson(['success' => true])
            ->assertJsonPath('data.type', 'Bearer');
    }

    /**
     * Test login falla con credenciales inválidas
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        // Arrange
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Act
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        // Assert
        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    /**
     * Test login requiere email y password
     */
    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    /**
     * Test tokens se generan correctamente
     */
    public function test_login_generates_access_and_refresh_tokens(): void
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Act
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        // Assert
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertNotEmpty($data['access_token']);
        $this->assertNotEmpty($data['refresh_token']);
        $this->assertEquals(3600, $data['expires_in']);

        // Verificar que refresh_token se guardó en BD
        $user->refresh();
        $this->assertNotNull($user->refresh_token_hash);
        $this->assertNotNull($user->refresh_token_expires_at);
    }
}
