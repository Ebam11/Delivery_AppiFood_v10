<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento: Cambio de estado de orden
 *
 * Se dispara cuando una orden cambia de estado
 * Se transmite en tiempo real a clientes interesados via WebSocket
 */
class OrderStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;
    public string $previousStatus;
    public string $newStatus;

    /**
     * Crear nueva instancia del evento
     */
    public function __construct(Order $order, string $previousStatus, string $newStatus)
    {
        $this->order = $order;
        $this->previousStatus = $previousStatus;
        $this->newStatus = $newStatus;
    }

    /**
     * Obtener el nombre del canal para broadcast
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.' . $this->order->user_id),
            new PrivateChannel('restaurant.' . $this->order->restaurant_id),
        ];
    }

    /**
     * Obtener el nombre del evento para broadcast
     */
    public function broadcastAs(): string
    {
        return 'order-status-changed';
    }

    /**
     * Obtener datos a transmitir
     */
    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'user_id' => $this->order->user_id,
            'restaurant_id' => $this->order->restaurant_id,
            'previous_status' => $this->previousStatus,
            'new_status' => $this->newStatus,
            'status_label' => $this->order->status->label(),
            'timestamp' => now()->toIso8601String(),
            'message' => $this->getStatusMessage(),
        ];
    }

    /**
     * Obtener mensaje amigable según el nuevo estado
     */
    private function getStatusMessage(): string
    {
        return match ($this->newStatus) {
            'CONFIRMED' => 'Tu orden ha sido confirmada',
            'PREPARING' => 'El restaurante está preparando tu orden',
            'ON_THE_WAY' => 'Tu comida está en camino',
            'DELIVERED' => 'Tu comida ha sido entregada',
            'CANCELLED' => 'Tu orden ha sido cancelada',
            default => 'Tu orden ha sido actualizada',
        };
    }
}
