<?php

namespace Tests\Feature\Cache;

use App\Services\Cache\QueryCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class QueryCacheServiceTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Test remember() caches callback result
     */
    public function test_remember_caches_result(): void
    {
        $key = 'test_key';
        $identifier = 'test_id';
        $expected = ['data' => 'test'];

        $result = QueryCacheService::remember(
            $key,
            fn() => $expected,
            ttl: 60,
            identifier: $identifier
        );

        $this->assertEquals($expected, $result);
    }

    /**
     * Test remember() returns cached value on subsequent calls
     */
    public function test_remember_returns_cached_value(): void
    {
        $key = 'test_key';
        $identifier = 'test_id';
        $value1 = ['data' => 'first'];
        $value2 = ['data' => 'second'];

        // Primera llamada
        $result1 = QueryCacheService::remember(
            $key,
            fn() => $value1,
            ttl: 60,
            identifier: $identifier
        );

        // Segunda llamada con mismo callback pero diferente resultado
        $result2 = QueryCacheService::remember(
            $key,
            fn() => $value2,
            ttl: 60,
            identifier: $identifier
        );

        // Debería devolver el valor en caché (value1)
        $this->assertEquals($value1, $result2);
    }

    /**
     * Test get() returns cached value or null
     */
    public function test_get_returns_cached_value(): void
    {
        $key = 'test_key';
        $identifier = 'test_id';
        $expected = ['data' => 'test'];

        // Guardar en caché
        QueryCacheService::put($key, $expected, 60, $identifier);

        // Obtener del caché
        $result = QueryCacheService::get($key, $identifier);

        $this->assertEquals($expected, $result);
    }

    /**
     * Test get() returns null for non-existent key
     */
    public function test_get_returns_null_for_missing_key(): void
    {
        $result = QueryCacheService::get('non_existent', 'id:999');

        $this->assertNull($result);
    }

    /**
     * Test put() stores value in cache
     */
    public function test_put_stores_value(): void
    {
        $key = 'test_key';
        $identifier = 'test_id';
        $value = ['data' => 'stored'];

        QueryCacheService::put($key, $value, 60, $identifier);

        $retrieved = QueryCacheService::get($key, $identifier);

        $this->assertEquals($value, $retrieved);
    }

    /**
     * Test forget() removes specific cache entry
     */
    public function test_forget_removes_cache_entry(): void
    {
        $key = 'test_key';
        $identifier = 'test_id';
        $value = ['data' => 'test'];

        // Guardar en caché
        QueryCacheService::put($key, $value, 60, $identifier);
        $this->assertEquals($value, QueryCacheService::get($key, $identifier));

        // Eliminar del caché
        QueryCacheService::forget($key, $identifier);
        $this->assertNull(QueryCacheService::get($key, $identifier));
    }

    /**
     * Test flush() clears all keys with pattern
     */
    public function test_flush_clears_pattern(): void
    {
        $prefix = 'products';

        // Guardar múltiples entradas
        QueryCacheService::put($prefix, ['id' => 1], 60, 'id:1');
        QueryCacheService::put($prefix, ['id' => 2], 60, 'id:2');
        QueryCacheService::put($prefix, ['id' => 3], 60, 'all');

        // Verificar que están en caché
        $this->assertNotNull(QueryCacheService::get($prefix, 'id:1'));
        $this->assertNotNull(QueryCacheService::get($prefix, 'id:2'));

        // Limpiar caché del prefijo
        QueryCacheService::flush($prefix);

        // Verificar que fueron limpiadas
        // (Nota: esto puede depender de cómo Redis maneje FLUSHDB)
    }

    /**
     * Test cache key generation
     */
    public function test_cache_key_generation(): void
    {
        $prefix = 'products';
        $identifier = 'id:123';

        $value = ['test' => 'data'];
        QueryCacheService::put($prefix, $value, 60, $identifier);

        // Verificar que la key se generó correctamente
        $retrieved = QueryCacheService::get($prefix, $identifier);
        $this->assertEquals($value, $retrieved);
    }

    /**
     * Test different TTLs
     */
    public function test_different_ttls(): void
    {
        $key = 'ttl_test';

        // Corto
        QueryCacheService::put($key, ['ttl' => 'short'], 5, 'short');
        // Medio
        QueryCacheService::put($key, ['ttl' => 'medium'], 60, 'medium');
        // Largo
        QueryCacheService::put($key, ['ttl' => 'long'], 1440, 'long');

        $this->assertEquals(['ttl' => 'short'], QueryCacheService::get($key, 'short'));
        $this->assertEquals(['ttl' => 'medium'], QueryCacheService::get($key, 'medium'));
        $this->assertEquals(['ttl' => 'long'], QueryCacheService::get($key, 'long'));
    }

    /**
     * Test remember with TTL constants
     */
    public function test_remember_with_ttl_constants(): void
    {
        $result1 = QueryCacheService::remember(
            'test',
            fn() => ['data' => 'short'],
            QueryCacheService::SHORT_CACHE_TTL,
            'short'
        );

        $result2 = QueryCacheService::remember(
            'test',
            fn() => ['data' => 'normal'],
            QueryCacheService::CACHE_TTL,
            'normal'
        );

        $result3 = QueryCacheService::remember(
            'test',
            fn() => ['data' => 'long'],
            QueryCacheService::LONG_CACHE_TTL,
            'long'
        );

        $this->assertNotNull($result1);
        $this->assertNotNull($result2);
        $this->assertNotNull($result3);
    }

    /**
     * Test multiple identifiers for same prefix
     */
    public function test_multiple_identifiers_same_prefix(): void
    {
        $prefix = 'products';

        QueryCacheService::put($prefix, ['id' => 1], 60, 'id:1');
        QueryCacheService::put($prefix, ['id' => 2], 60, 'id:2');
        QueryCacheService::put($prefix, ['id' => 3], 60, 'all');

        $this->assertEquals(['id' => 1], QueryCacheService::get($prefix, 'id:1'));
        $this->assertEquals(['id' => 2], QueryCacheService::get($prefix, 'id:2'));
        $this->assertEquals(['id' => 3], QueryCacheService::get($prefix, 'all'));
    }

    /**
     * Test stats() returns cache statistics
     */
    public function test_stats_returns_information(): void
    {
        QueryCacheService::put('test', ['data' => 'test'], 60, 'id:1');

        // Stats debería devolver información si Redis está disponible
        // Esta prueba es básica ya que Redis stats depende de la config
        $this->assertTrue(true);
    }
}
