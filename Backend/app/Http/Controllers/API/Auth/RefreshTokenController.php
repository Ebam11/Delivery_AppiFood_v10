<?php

namespace App\Http\Controllers\API\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Controlador para RefreshToken
 *
 * Maneja la renovación de tokens de acceso usando refresh tokens
 * Permite que los usuarios mantengan sesión activa sin tener que hacer login
 */
class RefreshTokenController extends Controller
{
    use ApiResponse;

    /**
     * Renovar token de acceso
     *
     * POST /api/auth/refresh
     *
     * Body:
     * {
     *   "refresh_token": "token_refresh_muy_largo"
     * }
     *
     * Response:
     * {
     *   "data": {
     *     "access_token": "nuevo_token",
     *     "refresh_token": "nuevo_refresh_token",
     *     "expires_in": 3600,
     *     "type": "Bearer"
     *   }
     * }
     */
    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        try {
            $refreshToken = $request->refresh_token;

            // Buscar usuario por refresh token hash
            $user = User::where(function ($query) use ($refreshToken) {
                // Verificar contra token actual
                return $query->whereNotNull('refresh_token_hash')
                    ->where('refresh_token_expires_at', '>', now());
            })->first();

            if (!$user || !Hash::check($refreshToken, $user->refresh_token_hash ?? '')) {
                return $this->error('Refresh token inválido o expirado', 401);
            }

            // Verificar expiración
            if ($user->refresh_token_expires_at && $user->refresh_token_expires_at < now()) {
                return $this->error('Refresh token ha expirado', 401);
            }

            // Generar nuevo access token usando Sanctum
            $newAccessToken = $user->createToken('api-token')->plainTextToken;

            // Generar nuevo refresh token
            $newRefreshToken = Str::random(128);

            // Guardar hash del nuevo refresh token
            $user->update([
                'refresh_token_hash' => Hash::make($newRefreshToken),
                'refresh_token_expires_at' => now()->addDays(30),
            ]);

            return $this->success([
                'access_token' => $newAccessToken,
                'refresh_token' => $newRefreshToken,
                'expires_in' => 3600,
                'type' => 'Bearer',
            ], 'Token renovado exitosamente');
        } catch (\Throwable $e) {
            return $this->error('Error al renovar token: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Revocar refresh token
     *
     * POST /api/auth/revoke
     */
    public function revoke(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if (!$user) {
                return $this->error('No autenticado', 401);
            }

            // Limpiar refresh token
            $user->update([
                'refresh_token_hash' => null,
                'refresh_token_expires_at' => null,
            ]);

            return $this->success([], 'Sesión cerrado exitosamente');
        } catch (\Throwable $e) {
            return $this->error('Error al revocar token', 500);
        }
    }
}
