<?php

namespace Tests\Unit\Enums;

use App\Enums\OrderStatus;
use PHPUnit\Framework\TestCase;

class OrderStatusTest extends TestCase
{
    /**
     * Test: Verificar que PENDING puede transicionar a CONFIRMED
     */
    public function test_pending_can_transition_to_confirmed()
    {
        $this->assertTrue(OrderStatus::PENDING->canTransitionTo(OrderStatus::CONFIRMED));
    }

    /**
     * Test: Verificar que PENDING puede transicionar a CANCELLED
     */
    public function test_pending_can_transition_to_cancelled()
    {
        $this->assertTrue(OrderStatus::PENDING->canTransitionTo(OrderStatus::CANCELLED));
    }

    /**
     * Test: Verificar que PENDING NO puede transicionar a DELIVERED
     */
    public function test_pending_cannot_transition_to_delivered()
    {
        $this->assertFalse(OrderStatus::PENDING->canTransitionTo(OrderStatus::DELIVERED));
    }

    /**
     * Test: Verificar que PENDING NO puede transicionar a ON_THE_WAY
     */
    public function test_pending_cannot_transition_to_on_the_way()
    {
        $this->assertFalse(OrderStatus::PENDING->canTransitionTo(OrderStatus::ON_THE_WAY));
    }

    /**
     * Test: Verificar transiciones desde CONFIRMED
     */
    public function test_confirmed_transitions()
    {
        $this->assertTrue(OrderStatus::CONFIRMED->canTransitionTo(OrderStatus::PREPARING));
        $this->assertTrue(OrderStatus::CONFIRMED->canTransitionTo(OrderStatus::CANCELLED));
        $this->assertFalse(OrderStatus::CONFIRMED->canTransitionTo(OrderStatus::DELIVERED));
    }

    /**
     * Test: Verificar transiciones desde PREPARING
     */
    public function test_preparing_transitions()
    {
        $this->assertTrue(OrderStatus::PREPARING->canTransitionTo(OrderStatus::ON_THE_WAY));
        $this->assertTrue(OrderStatus::PREPARING->canTransitionTo(OrderStatus::CANCELLED));
        $this->assertFalse(OrderStatus::PREPARING->canTransitionTo(OrderStatus::CONFIRMED));
    }

    /**
     * Test: Verificar transiciones desde ON_THE_WAY
     */
    public function test_on_the_way_transitions()
    {
        $this->assertTrue(OrderStatus::ON_THE_WAY->canTransitionTo(OrderStatus::DELIVERED));
        $this->assertFalse(OrderStatus::ON_THE_WAY->canTransitionTo(OrderStatus::CANCELLED));
    }

    /**
     * Test: Verificar que DELIVERED no puede cambiar
     */
    public function test_delivered_cannot_transition()
    {
        $this->assertFalse(OrderStatus::DELIVERED->canTransitionTo(OrderStatus::CANCELLED));
        $this->assertFalse(OrderStatus::DELIVERED->canTransitionTo(OrderStatus::PENDING));
    }

    /**
     * Test: Verificar que CANCELLED no puede cambiar
     */
    public function test_cancelled_cannot_transition()
    {
        $this->assertFalse(OrderStatus::CANCELLED->canTransitionTo(OrderStatus::PENDING));
        $this->assertFalse(OrderStatus::CANCELLED->canTransitionTo(OrderStatus::DELIVERED));
    }

    /**
     * Test: Verificar labels en español
     */
    public function test_labels_are_in_spanish()
    {
        $this->assertEquals('Pendiente', OrderStatus::PENDING->label());
        $this->assertEquals('Confirmado', OrderStatus::CONFIRMED->label());
        $this->assertEquals('Preparando', OrderStatus::PREPARING->label());
        $this->assertEquals('En camino', OrderStatus::ON_THE_WAY->label());
        $this->assertEquals('Entregado', OrderStatus::DELIVERED->label());
        $this->assertEquals('Cancelado', OrderStatus::CANCELLED->label());
    }

    /**
     * Test: Verificar que status puede transicionar a sí mismo
     */
    public function test_status_can_transition_to_itself()
    {
        $this->assertTrue(OrderStatus::PENDING->canTransitionTo(OrderStatus::PENDING));
        $this->assertTrue(OrderStatus::CONFIRMED->canTransitionTo(OrderStatus::CONFIRMED));
        $this->assertTrue(OrderStatus::DELIVERED->canTransitionTo(OrderStatus::DELIVERED));
    }
}
