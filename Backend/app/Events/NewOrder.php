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
 * Evento: Nueva orden
 *
 * Se dispara cuando se crea una nueva orden
 * Se transmite en tiempo real al restaurante via WebSocket
 */
class NewOrder implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;

    /**
     * Crear nueva instancia del evento
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Obtener el nombre del canal para broadcast
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('restaurant.' . $this->order->restaurant_id),
        ];
    }

    /**
     * Obtener el nombre del evento para broadcast
     */
    public function broadcastAs(): string
    {
        return 'new-order';
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
            'total' => $this->order->total,
            'items_count' => $this->order->items->count(),
            'delivery_address' => $this->order->address->full_address ?? null,
            'special_instructions' => $this->order->special_instructions,
            'timestamp' => now()->toIso8601String(),
            'message' => '¡Nueva orden recibida!',
        ];
    }
}
