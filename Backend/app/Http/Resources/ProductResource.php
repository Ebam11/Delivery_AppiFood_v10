<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'restaurant_id'     => $this->restaurant_id,
            'category_id'       => $this->category_id,
            'name'              => $this->name,
            'description'       => $this->description,
            'image'             => MediaUrl::resolve($this->image),
            'price'             => $this->price,
            'discount_price'    => $this->discount_price,
            'final_price'       => $this->final_price,
            'has_discount'      => $this->has_discount ?? $this->hasDiscount(),
            'is_available'      => $this->is_available,
            'is_featured'       => $this->is_featured,
            'stock'             => $this->stock,
            'prep_time_minutes' => $this->prep_time_minutes,
            'category'          => $this->whenLoaded('category', fn() => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
            ]),
            'restaurant'        => $this->whenLoaded('restaurant', fn() => [
                'id'        => $this->restaurant->id,
                'name'      => $this->restaurant->name,
                'is_active' => $this->restaurant->is_active,
                'schedules' => $this->restaurant->schedules->map(fn($s) => [
                    'day'          => $s->day,
                    'opening_time' => $s->opening_time,
                    'closing_time' => $s->closing_time,
                    'is_closed'    => $s->is_closed,
                ]),
            ]),
            'created_at'        => $this->created_at?->toDateString(),
        ];
    }
}