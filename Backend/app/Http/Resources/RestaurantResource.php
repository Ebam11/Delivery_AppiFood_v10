<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
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

        $isOpen = $this->is_active && (!$todaySchedule || $todaySchedule->isOpenNow());

        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'description'       => $this->description,
            'logo'              => MediaUrl::resolve($this->logo),
            'banner'            => MediaUrl::resolve($this->banner),
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
            'schedules'         => $this->relationLoaded('schedules') ? $this->schedules->map(fn($schedule) => [
                'day' => $schedule->day,
                'opening_time' => $schedule->opening_time,
                'closing_time' => $schedule->closing_time,
                'is_closed' => $schedule->is_closed,
                'is_open_now' => $schedule->isOpenNow(),
            ]) : [],
            'today_schedule'    => $todaySchedule ? [
                'day' => $todaySchedule->day,
                'opening_time' => $todaySchedule->opening_time,
                'closing_time' => $todaySchedule->closing_time,
                'is_closed' => $todaySchedule->is_closed,
                'is_open_now' => $todaySchedule->isOpenNow(),
            ] : null,
            'products'          => $this->whenLoaded('categories', fn() =>
                $this->categories->flatMap(fn($cat) =>
                    $cat->relationLoaded('products')
                        ? $cat->products->map(fn($p) => [
                            'id'          => $p->id,
                            'name'        => $p->name,
                            'description' => $p->description,
                            'price'       => $p->price,
                            'image'       => MediaUrl::resolve($p->image),
                            'available'   => $p->is_available,
                            'category_id' => $cat->id,
                            'category_name' => $cat->name,
                        ])
                        : []
                )->values()
            ),
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
                            'image'       => MediaUrl::resolve($p->image),
                            'is_available'=> $p->is_available,
                        ])
                        : [],
                ])
            ),
            'created_at'        => $this->created_at?->toDateString(),
        ];
    }
}
