<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'restaurant_id'  => $this->restaurant_id,
            'category_id'    => $this->category_id,
            'name'           => $this->name,
            'description'    => $this->description,
            'image'          => $this->image ? asset('storage/' . $this->image) : null,
            'price'          => $this->price,
            'discount_price' => $this->discount_price,
            'final_price'    => $this->final_price,
            'has_discount'   => $this->has_discount ?? $this->hasDiscount(),
            'is_available'   => $this->is_available,
            'is_featured'    => $this->is_featured,
            'category'       => $this->whenLoaded('category', fn() => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
            ]),
            'created_at'     => $this->created_at?->toDateString(),
        ];
    }
}
