<?php

namespace App\Http\Controllers\API\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'phone'    => $request->phone,
            'id_number' => $request->id_number,
            'birth_date'=> $request->birth_date,
            'gender'    => $request->gender,
            'role'     => $request->role ?? UserRole::USER->value,
            'status'   => true,
        ]);

        if (($request->role ?? UserRole::USER->value) === UserRole::RESTAURANT->value) {
            Restaurant::create([
                'user_id' => $user->id,
                'name' => $request->restaurant_name ?: $request->name,
                'address' => $request->address ?? 'Por confirmar',
                'phone' => $request->phone ?? null,
                'email' => $request->email ?? null,
                'is_active' => true,
                'is_verified' => true,
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => '¡Registro exitoso!',
            'token'   => $token,
            'user'    => new UserResource($user),
        ], 201);
    }
}
