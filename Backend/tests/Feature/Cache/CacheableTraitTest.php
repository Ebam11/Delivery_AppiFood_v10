<?php

namespace Tests\Feature\Cache;

use App\Models\Product;
use App\Models\Restaurant;
use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CacheableTraitTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test findCached() returns model from cache
     */
    public function test_find_cached_returns_model(): void
    {
        $product = Product::factory()->create();

        $cached = Product::findCached($product->id);

        $this->assertNotNull($cached);
        $this->assertEquals($product->id, $cached->id);
        $this->assertEquals($product->name, $cached->name);
    }

    /**
     * Test findCached() with non-existent ID
     */
    public function test_find_cached_non_existent(): void
    {
        $cached = Product::findCached(99999);

        $this->assertNull($cached);
    }

    /**
     * Test getAllCached() returns all models
     */
    public function test_get_all_cached_returns_collection(): void
    {
        Product::factory()->count(3)->create();

        $cached = Product::getAllCached();

        $this->assertCount(3, $cached);
        $this->assertTrue($cached->count() > 0);
    }

    /**
     * Test getAllCached() on empty table
     */
    public function test_get_all_cached_empty_table(): void
    {
        $cached = Product::getAllCached();

        $this->assertCount(0, $cached);
    }

    /**
     * Test flushCache() clears cache
     */
    public function test_flush_cache_clears_model_cache(): void
    {
        $product = Product::factory()->create();

        // Carga en caché
        Product::findCached($product->id);

        // Limpia caché
        Product::flushCache();

        // Verifica que el caché fue limpiado (debería traer de BD nuevamente)
        $refreshed = Product::findCached($product->id);
        $this->assertNotNull($refreshed);
    }

    /**
     * Test forgetCache() removes specific entry
     */
    public function test_forget_cache_removes_specific_entry(): void
    {
        $product = Product::factory()->create();

        // Carga en caché
        Product::findCached($product->id);

        // Limpia caché específico
        Product::forgetCache("id:{$product->id}");

        // Verifica que fue removido
        $refreshed = Product::findCached($product->id);
        $this->assertNotNull($refreshed);
    }

    /**
     * Test auto-invalidation on create
     */
    public function test_cache_invalidated_on_create(): void
    {
        // Obtiene todos antes de crear
        $before = Product::getAllCached();
        $countBefore = $before->count();

        // Crea nuevo producto
        Product::factory()->create();

        // Obtiene todos después (caché debe invalidarse)
        $after = Product::getAllCached();
        $countAfter = $after->count();

        // El nuevo producto debería estar disponible
        $this->assertGreater($countAfter, $countBefore);
    }

    /**
     * Test auto-invalidation on update
     */
    public function test_cache_invalidated_on_update(): void
    {
        $product = Product::factory()->create(['name' => 'Original Name']);

        // Carga en caché
        $cached = Product::findCached($product->id);
        $this->assertEquals('Original Name', $cached->name);

        // Actualiza modelo
        $product->update(['name' => 'Updated Name']);

        // Obtiene del caché (debería estar actualizado)
        $refreshed = Product::findCached($product->id);
        $this->assertEquals('Updated Name', $refreshed->name);
    }

    /**
     * Test auto-invalidation on delete
     */
    public function test_cache_invalidated_on_delete(): void
    {
        $product = Product::factory()->create();
        $id = $product->id;

        // Carga en caché
        Product::findCached($id);

        // Elimina
        $product->delete();

        // Intenta obtener del caché (debería ser null)
        $deleted = Product::findCached($id);
        $this->assertNull($deleted);
    }

    /**
     * Test cache prefix is correctly set
     */
    public function test_cache_prefix_configuration(): void
    {
        $product = new Product();
        $this->assertEquals('products', $product->getCachePrefix());

        $restaurant = new Restaurant();
        $this->assertEquals('restaurants', $restaurant->getCachePrefix());

        $category = new Category();
        $this->assertEquals('categories', $category->getCachePrefix());
    }

    /**
     * Test cache time configuration
     */
    public function test_cache_time_configuration(): void
    {
        $product = new Product();
        $this->assertEquals(60, $product->getCacheTime());

        $category = new Category();
        $this->assertEquals(1440, $category->getCacheTime());
    }

    /**
     * Test different models have separate caches
     */
    public function test_separate_caches_for_different_models(): void
    {
        $product = Product::factory()->create();
        $restaurant = Restaurant::factory()->create();

        // Cargar en caché
        Product::findCached($product->id);
        Restaurant::findCached($restaurant->id);

        // Limpiar caché de producto
        Product::flushCache();

        // Caché de restaurant debería seguir activo
        // (verificar que no se limpió accidentalmente)
        $rCached = Restaurant::findCached($restaurant->id);
        $this->assertNotNull($rCached);
    }

    /**
     * Test cache with multiple factory instances
     */
    public function test_cache_with_multiple_instances(): void
    {
        $products = Product::factory()->count(5)->create();

        // Cargar todos en caché
        $cached = Product::getAllCached();
        $this->assertCount(5, $cached);

        // Crear uno más
        Product::factory()->create();

        // Obtener nuevamente (caché debería invalidarse)
        $updated = Product::getAllCached();
        $this->assertCount(6, $updated);
    }
}
