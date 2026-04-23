<?php

namespace App\Http\Controllers\API\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => $request->password,
            'phone'     => $request->phone,
            'id_number' => $request->id_number,
            'role'      => $request->role ?? UserRole::USER->value,
            'status'    => true,
        ]);

        // Si el rol es restaurant, crear la fila en la tabla restaurants
        if ($request->role === 'restaurant') {
            Restaurant::create([
                'user_id' => $user->id,
                'name'    => $request->restaurant_name ?? $request->name,
                'address' => $request->restaurant_address ?? '',
                'email'   => $request->email,
                'phone'   => $request->phone,
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