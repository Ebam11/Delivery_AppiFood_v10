<?php

namespace App\Http\Controllers\API\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Refresh Token Controller V1
 *
 * Maneja la renovación de tokens de acceso usando refresh tokens.
 * Permite que los usuarios mantengan sesión activa sin tener que hacer login.
 */
class RefreshTokenController extends Controller
{
    use ApiResponse;

    /**
     * Refresh Access Token
     *
     * Renovar token de acceso usando refresh token
     *
     * @authenticated false
     * @bodyParam refresh_token string required El refresh token del usuario
     * @response 200 { "success": true, "data": { "access_token", "refresh_token", "expires_in": 3600, "type": "Bearer" } }
     * @response 401 { "success": false, "message": "Refresh token inválido o expirado" }
     */
    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        try {
            $refreshToken = $request->refresh_token;

            // Buscar usuario por refresh token hash
            $user = User::whereNotNull('refresh_token_hash')
                ->where('refresh_token_expires_at', '>', now())
                ->first();

            if (!$user || !Hash::check($refreshToken, $user->refresh_token_hash ?? '')) {
                return $this->error('Refresh token inválido o expirado', 401);
            }

            // Verificar expiración
            if ($user->refresh_token_expires_at && $user->refresh_token_expires_at < now()) {
                return $this->error('Refresh token ha expirado', 401);
            }

            // Generar nuevo access token
            $newAccessToken = $user->createToken('api-token')->plainTextToken;

            // Generar nuevo refresh token
            $newRefreshToken = Str::random(128);

            // Guardar hash del nuevo refresh token
            $user->update([
                'refresh_token_hash'     => Hash::make($newRefreshToken),
                'refresh_token_expires_at' => now()->addDays(30),
            ]);

            return $this->success([
                'access_token'  => $newAccessToken,
                'refresh_token' => $newRefreshToken,
                'expires_in'    => 3600,
                'type'          => 'Bearer',
            ], 'Token renovado exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al renovar token: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Revoke Refresh Token (Logout)
     *
     * Revocar refresh token y cerrar sesión del usuario
     *
     * @authenticated true
     * @response 200 { "success": true, "message": "Sesión cerrada exitosamente" }
     * @response 401 { "success": false, "message": "No autenticado" }
     */
    public function revoke(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if (!$user) {
                return $this->error('No autenticado', 401);
            }

            // Revocar todos los tokens
            $user->tokens()->delete();

            // Limpiar refresh token
            $user->update([
                'refresh_token_hash'     => null,
                'refresh_token_expires_at' => null,
            ]);

            return $this->success(null, 'Sesión cerrada exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al revocar token: ' . $e->getMessage(), 500);
        }
    }
}
