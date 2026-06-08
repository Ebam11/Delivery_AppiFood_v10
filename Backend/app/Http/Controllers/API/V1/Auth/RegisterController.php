<?php

namespace App\Http\Controllers\API\V1\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Http\Traits\ApiResponse;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    use ApiResponse;

    /**
     * User Registration
     *
     * @authenticated false
     * @response 201 { "success": true, "data": { "access_token", "refresh_token", "expires_in": 3600, "user": {...} } }
     * @response 422 { "success": false, "message": "Validation errors" }
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = User::create([
                'name'       => $request->name,
                'email'      => $request->email,
                'password'   => $request->password,
                'phone'      => $request->phone,
                'id_number'  => $request->id_number,
                'birth_date' => $request->birth_date,
                'gender'     => $request->gender,
                'role'       => $request->role ?? UserRole::USER->value,
                'status'     => true,
            ]);

            // Crear restaurante si el rol es RESTAURANT
            if (($request->role ?? UserRole::USER->value) === UserRole::RESTAURANT->value) {
                Restaurant::create([
                    'user_id'     => $user->id,
                    'name'        => $request->restaurant_name ?: $request->name,
                    'address'     => $request->address ?? 'Por confirmar',
                    'phone'       => $request->phone ?? null,
                    'email'       => $request->email ?? null,
                    'is_active'   => true,
                    'is_verified' => true,
                ]);
            }

            // Generar access token
            $accessToken = $user->createToken('api-token')->plainTextToken;

            // Generar refresh token
            $refreshToken = Str::random(128);
            $user->update([
                'refresh_token_hash'     => Hash::make($refreshToken),
                'refresh_token_expires_at' => now()->addDays(30),
                'last_login_at'          => now(),
            ]);

            return $this->success([
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_in'    => 3600,
                'type'          => 'Bearer',
                'user'          => new UserResource($user),
            ], 'Registro exitoso', 201);
        } catch (\Exception $e) {
            return $this->error('Error al registrar usuario: ' . $e->getMessage(), 500);
        }
    }
}
