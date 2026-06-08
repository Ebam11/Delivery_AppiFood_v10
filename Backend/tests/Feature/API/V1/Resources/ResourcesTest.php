<?php

namespace Tests\Feature\API\V1\Resources;

use App\Models\Restaurant;
use App\Models\Product;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RestaurantControllerTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test cualquier usuario puede listar restaurantes activos
     */
    public function test_user_can_list_restaurants(): void
    {
        // Arrange
        Restaurant::factory()->count(5)->create(['is_active' => true]);
        Restaurant::factory()->count(2)->create(['is_active' => false]);

        // Act
        $response = $this->getJson('/api/v1/restaurants');

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Test usuario puede ver detalles de restaurante
     */
    public function test_user_can_view_restaurant_details(): void
    {
        // Arrange
        $restaurant = Restaurant::factory()->create(['is_active' => true]);

        // Act
        $response = $this->getJson("/api/v1/restaurants/{$restaurant->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.id', $restaurant->id)
            ->assertJsonPath('data.name', $restaurant->name);
    }

    /**
     * Test no se puede ver restaurante inactivo
     */
    public function test_user_cannot_view_inactive_restaurant(): void
    {
        // Arrange
        $restaurant = Restaurant::factory()->create(['is_active' => false]);

        // Act
        $response = $this->getJson("/api/v1/restaurants/{$restaurant->id}");

        // Assert
        $response->assertStatus(404);
    }
}

class ProductControllerTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test cualquier usuario puede listar productos disponibles
     */
    public function test_user_can_list_products(): void
    {
        // Arrange
        Product::factory()->count(5)->create(['is_available' => true]);
        Product::factory()->count(2)->create(['is_available' => false]);

        // Act
        $response = $this->getJson('/api/v1/products');

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Test usuario puede ver detalles de producto
     */
    public function test_user_can_view_product_details(): void
    {
        // Arrange
        $product = Product::factory()->create(['is_available' => true]);

        // Act
        $response = $this->getJson("/api/v1/products/{$product->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.name', $product->name);
    }

    /**
     * Test no se puede ver producto no disponible
     */
    public function test_user_cannot_view_unavailable_product(): void
    {
        // Arrange
        $product = Product::factory()->create(['is_available' => false]);

        // Act
        $response = $this->getJson("/api/v1/products/{$product->id}");

        // Assert
        $response->assertStatus(404);
    }
}
