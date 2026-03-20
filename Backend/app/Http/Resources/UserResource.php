<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'status'     => $this->status,
            'created_at' => $this->created_at->toDateString(),
        ];
    }
}
