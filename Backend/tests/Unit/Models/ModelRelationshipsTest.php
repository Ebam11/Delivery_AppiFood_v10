<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Product;
use Tests\TestCase;

class ModelRelationshipsTest extends TestCase
{
    /**
     * Test: Verificar que User model existe y tiene propiedades básicas
     */
    public function test_user_model_has_fillable_properties()
    {
        $user = new User();
        $this->assertIsArray($user->getFillable());
        $this->assertContains('name', $user->getFillable());
        $this->assertContains('email', $user->getFillable());
        $this->assertContains('password', $user->getFillable());
        $this->assertContains('role', $user->getFillable());
    }

    /**
     * Test: Verificar que Order model existe
     */
    public function test_order_model_exists()
    {
        $order = new Order();
        $this->assertInstanceOf(Order::class, $order);
        $this->assertIsArray($order->getCasts());
    }

    /**
     * Test: Verificar que Order tiene casts de decimales
     */
    public function test_order_model_has_decimal_casts()
    {
        $order = new Order();
        $casts = $order->getCasts();

        $this->assertArrayHasKey('subtotal', $casts);
        $this->assertArrayHasKey('delivery_cost', $casts);
        $this->assertArrayHasKey('discount', $casts);
        $this->assertArrayHasKey('total', $casts);
    }

    /**
     * Test: Verificar que Restaurant model existe
     */
    public function test_restaurant_model_exists()
    {
        $restaurant = new Restaurant();
        $this->assertInstanceOf(Restaurant::class, $restaurant);
        $this->assertIsArray($restaurant->getFillable());
    }

    /**
     * Test: Verificar que Product model existe
     */
    public function test_product_model_exists()
    {
        $product = new Product();
        $this->assertInstanceOf(Product::class, $product);
        $this->assertIsArray($product->getFillable());
    }

    /**
     * Test: Verificar que User puede verificar si es admin
     */
    public function test_user_can_check_roles()
    {
        $user = new User(['role' => 'admin']);
        $this->assertTrue(method_exists($user, 'isAdmin'));
        $this->assertTrue(method_exists($user, 'isRestaurant'));
        $this->assertTrue(method_exists($user, 'isUser'));
    }
}
