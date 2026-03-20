<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'status'           => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'status_label'     => method_exists($this->status, 'label') ? $this->status->label() : $this->status,
            'delivery_address' => $this->delivery_address,
            'delivery_lat'     => $this->delivery_lat,
            'delivery_lng'     => $this->delivery_lng,
            'subtotal'         => $this->subtotal,
            'delivery_cost'    => $this->delivery_cost,
            'discount'         => $this->discount,
            'total'            => $this->total,
            'notes'            => $this->notes,
            'restaurant'       => $this->whenLoaded('restaurant', fn() => [
                'id'   => $this->restaurant->id,
                'name' => $this->restaurant->name,
                'logo' => $this->restaurant->logo ? asset('storage/' . $this->restaurant->logo) : null,
            ]),
            'items'            => $this->whenLoaded('items', fn() =>
                $this->items->map(fn($item) => [
                    'id'         => $item->id,
                    'name'       => $item->product_name ?? $item->product?->name,
                    'quantity'   => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal'   => $item->quantity * $item->unit_price,
                    'notes'      => $item->notes ?? null,
                ])
            ),
            'tracking'         => $this->whenLoaded('tracking', fn() =>
                $this->tracking->map(fn($t) => [
                    'status'     => $t->status instanceof \BackedEnum ? $t->status->value : $t->status,
                    'comment'    => $t->comment,
                    'created_at' => $t->created_at?->toDateTimeString(),
                ])
            ),
            'payment'          => $this->whenLoaded('payment', fn() => $this->payment ? [
                'id'     => $this->payment->id,
                'status' => $this->payment->status instanceof \BackedEnum ? $this->payment->status->value : $this->payment->status,
                'method' => $this->payment->method ?? null,
                'amount' => $this->payment->amount,
            ] : null),
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
