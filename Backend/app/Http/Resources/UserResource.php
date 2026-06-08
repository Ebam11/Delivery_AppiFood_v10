<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Schema;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'id_number'  => $this->id_number,
            'birth_date' => $this->birth_date?->toDateString(),
            'gender'     => $this->gender,
            'role'       => $this->role->value,
            'role_label' => $this->role->label(),
            'avatar'     => $this->avatar
                ? asset('storage/' . $this->avatar)
                : null,
            'is_premium' => $this->isPremium(),
            'points'     => (int) ($this->points ?? 0),
            'email_verified' => $this->email_verified_at !== null,
            'phone_verified' => (Schema::hasColumn('users', 'phone_verified_at') ? ($this->phone_verified_at !== null) : false),
            'restaurant' => $this->whenLoaded('restaurant', fn () => new RestaurantResource($this->restaurant)),
            'status'     => $this->status,
            'created_at' => $this->created_at->toDateString(),
        ];
    }
}
