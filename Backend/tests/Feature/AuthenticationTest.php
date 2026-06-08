<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    /**
     * Test: Verificar que las rutas de autenticación están registradas
     */
    public function test_auth_routes_are_registered()
    {
        $routes = collect(Route::getRoutes())
            ->map(function ($route) {
                return $route->uri;
            })
            ->filter(function ($uri) {
                return str_starts_with($uri, 'api/auth');
            });

        $this->assertTrue($routes->count() > 0, 'No auth routes found');
    }

    /**
     * Test: Verificar que controladores de autenticación existen
     */
    public function test_auth_controllers_exist()
    {
        $this->assertTrue(class_exists(\App\Http\Controllers\API\Auth\LoginController::class));
        $this->assertTrue(class_exists(\App\Http\Controllers\API\Auth\RegisterController::class));
        $this->assertTrue(class_exists(\App\Http\Controllers\API\Auth\LogoutController::class));
        $this->assertTrue(class_exists(\App\Http\Controllers\API\Auth\PasswordResetController::class));
    }

    /**
     * Test: Verificar que Application está configurada
     */
    public function test_app_is_configured()
    {
        $this->assertNotNull(app());
        $this->assertTrue(app()->bound('router'));
    }

    /**
     * Test: Verificar que API prefix está configurado
     */
    public function test_api_routes_use_api_prefix()
    {
        $routes = collect(Route::getRoutes())
            ->map(function ($route) {
                return $route->uri;
            })
            ->filter(function ($uri) {
                return str_starts_with($uri, 'api/');
            });

        $this->assertTrue($routes->count() > 0, 'No api routes found');
    }

    /**
     * Test: Verificar que UserRole enum existe
     */
    public function test_user_role_enum_exists()
    {
        $this->assertTrue(enum_exists(\App\Enums\UserRole::class));
    }

    /**
     * Test: Verificar que User model existe
     */
    public function test_user_model_exists()
    {
        $this->assertTrue(class_exists(\App\Models\User::class));
    }
}
