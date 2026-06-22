<?php

namespace App\Http\Controllers\API\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirige al usuario a la página de autenticación de Google.
     */
    public function redirectToGoogle()
    {
        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
        $driver = Socialite::driver('google');
        return $driver->stateless()->redirect();
    }

    /**
     * Maneja el callback de Google.
     */
    public function handleGoogleCallback()
    {
        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->stateless()->user();
            
            // Buscar si ya existe el usuario por google_id o por email
            $user = User::where('google_id', $googleUser->id)
                        ->orWhere('email', $googleUser->email)
                        ->first();

            if (!$user) {
                // Crear nuevo usuario si no existe
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => null, // O usar bcrypt(Str::random(16))
                    'role' => UserRole::USER->value,
                    'status' => true,
                ]);
            } else {
                // Actualizar google_id si ya existía por email
                $user->update([
                    'google_id' => $googleUser->id,
                ]);
            }

            // Generar token de Sanctum
            $token = $user->createToken('api-token')->plainTextToken;

            // Redirigir al frontend con el token y datos del usuario
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $userData = base64_encode(json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ]));

            return redirect()->away("{$frontendUrl}/login?token={$token}&user={$userData}");

        } catch (Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away("{$frontendUrl}/login?error=" . urlencode($e->getMessage()));
        }
    }
}
