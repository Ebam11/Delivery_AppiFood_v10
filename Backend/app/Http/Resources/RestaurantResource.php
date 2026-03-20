<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $today = strtolower(now()->englishDayOfWeek);
        $todaySchedule = $this->relationLoaded('schedules')
            ? $this->schedules->firstWhere('day', $today)
            : null;

        $isOpen = $todaySchedule
            ? $todaySchedule->isOpenNow()
            : null;

        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'description'       => $this->description,
            'logo'              => $this->logo ? asset('storage/' . $this->logo) : null,
            'banner'            => $this->banner ? asset('storage/' . $this->banner) : null,
            'address'           => $this->address,
            'lat'               => $this->lat,
            'lng'               => $this->lng,
            'phone'             => $this->phone,
            'email'             => $this->email,
            'delivery_cost'     => $this->delivery_cost,
            'minimum_order'     => $this->minimum_order,
            'delivery_time_min' => $this->delivery_time_min,
            'delivery_time_max' => $this->delivery_time_max ?? $this->delivery_time_min + 15,
            'average_rating'    => $this->average_rating,
            'total_reviews'     => $this->total_reviews,
            'is_active'         => $this->is_active,
            'is_verified'       => $this->is_verified,
            'isOpen'            => $isOpen,
            'today_schedule'    => $todaySchedule ? [
                'day' => $todaySchedule->day,
                'opening_time' => $todaySchedule->opening_time,
                'closing_time' => $todaySchedule->closing_time,
                'is_closed' => $todaySchedule->is_closed,
            ] : null,
            'categories'        => $this->whenLoaded('restaurantCategories', fn() =>
                $this->restaurantCategories->map(fn($c) => [
                    'id'   => $c->id,
                    'name' => $c->name,
                    'icon' => $c->icon ?? null,
                ])
            ),
            'menu_categories'   => $this->whenLoaded('categories', fn() =>
                $this->categories->map(fn($cat) => [
                    'id'       => $cat->id,
                    'name'     => $cat->name,
                    'products' => $cat->relationLoaded('products')
                        ? $cat->products->map(fn($p) => [
                            'id'          => $p->id,
                            'name'        => $p->name,
                            'description' => $p->description,
                            'price'       => $p->price,
                            'image'       => $p->image ? asset('storage/' . $p->image) : null,
                            'is_available'=> $p->is_available,
                        ])
                        : [],
                ])
            ),
            'created_at'        => $this->created_at?->toDateString(),
        ];
    }
}
