<?php

namespace Tests\Feature\API\V1\Auth;

use App\Models\User;
use App\Enums\UserRole;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RegisterTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test usuario puede registrarse con datos válidos
     */
    public function test_user_can_register_with_valid_data(): void
    {
        // Act
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '1234567890',
            'id_number' => '123456789',
            'birth_date' => '1990-01-01',
            'gender' => 'M',
            'role' => UserRole::USER->value,
        ]);

        // Assert
        $response->assertStatus(201)
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
                    ]
                ],
            ])
            ->assertJson(['success' => true]);

        // Verificar que el usuario se guardó en BD
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
        ]);
    }

    /**
     * Test registro de restaurante crea automáticamente restaurante
     */
    public function test_restaurant_user_registration_creates_restaurant(): void
    {
        // Act
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Pizza Place',
            'email' => 'pizza@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '9876543210',
            'id_number' => '987654321',
            'birth_date' => '1990-01-01',
            'gender' => 'M',
            'role' => UserRole::RESTAURANT->value,
            'restaurant_name' => 'Pizza House',
            'address' => 'Main Street 123',
        ]);

        // Assert
        $response->assertStatus(201);

        $userId = $response->json('data.user.id');

        // Verificar que el restaurante se creó
        $this->assertDatabaseHas('restaurants', [
            'user_id' => $userId,
            'name' => 'Pizza House',
        ]);
    }

    /**
     * Test registro falla si email ya existe
     */
    public function test_register_fails_if_email_exists(): void
    {
        // Arrange
        User::factory()->create(['email' => 'existing@example.com']);

        // Act
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'John Doe',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '1234567890',
            'id_number' => '123456789',
            'birth_date' => '1990-01-01',
            'gender' => 'M',
        ]);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registro requiere datos obligatorios
     */
    public function test_register_requires_mandatory_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'phone', 'id_number']);
    }
}
