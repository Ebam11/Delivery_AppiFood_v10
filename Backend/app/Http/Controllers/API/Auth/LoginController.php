<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if (!$user->status) {
            Auth::logout();
            return response()->json([
                'message' => 'Tu cuenta está desactivada. Contacta al administrador.',
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        // Generar refresh token
        $refreshToken = Str::random(128);
        $user->update([
            'refresh_token_hash' => Hash::make($refreshToken),
            'refresh_token_expires_at' => now()->addDays(30),
            'last_login_at' => now(),
        ]);

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'data' => [
                'access_token' => $token,
                'refresh_token' => $refreshToken,
                'expires_in' => 3600,
                'type' => 'Bearer',
                'user' => new UserResource($user),
            ]
        ]);
    }
}
