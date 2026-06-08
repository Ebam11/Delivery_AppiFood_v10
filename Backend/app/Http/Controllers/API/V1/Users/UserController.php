<?php

namespace App\Http\Controllers\API\V1\Users;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * User Controller V1
 *
 * Maneja operaciones de perfil de usuario
 */
class UserController extends Controller
{
    use ApiResponse;

    /**
     * Show Current User Profile
     *
     * @authenticated true
     * @response 200 { "success": true, "data": { "id", "name", "email", "phone", "role" } }
     * @response 401 { "success": false, "message": "No autenticado" }
     */
    public function show(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if (!$user) {
                return $this->error('No autenticado', 401);
            }

            return $this->success(new UserResource($user), 'Perfil de usuario obtenido');
        } catch (\Exception $e) {
            return $this->error('Error al obtener perfil: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update User Profile
     *
     * @authenticated true
     * @bodyParam name string El nombre del usuario
     * @bodyParam email string El email del usuario
     * @bodyParam phone string El teléfono del usuario
     * @bodyParam birth_date string La fecha de nacimiento
     * @response 200 { "success": true, "data": { "id", "name", "email", "phone", "role" } }
     * @response 422 { "success": false, "message": "Validation errors" }
     */
    public function update(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if (!$user) {
                return $this->error('No autenticado', 401);
            }

            $validated = $request->validate([
                'name'       => 'sometimes|string|max:255',
                'email'      => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
                'phone'      => 'sometimes|string|max:20',
                'birth_date' => 'sometimes|date',
                'gender'     => 'sometimes|in:M,F,O',
            ]);

            $user->update($validated);

            return $this->success(new UserResource($user), 'Perfil actualizado exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al actualizar perfil: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update User Avatar
     *
     * @authenticated true
     * @bodyParam avatar file El archivo de imagen del avatar
     * @response 200 { "success": true, "data": { "avatar_url" } }
     * @response 422 { "success": false, "message": "Archivo inválido" }
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if (!$user) {
                return $this->error('No autenticado', 401);
            }

            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Aquí iría la lógica de subida de avatar (Cloudinary, etc)
            // Por ahora, retornamos un placeholder

            return $this->success([
                'avatar_url' => 'https://via.placeholder.com/150',
            ], 'Avatar actualizado exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al actualizar avatar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete User Account
     *
     * @authenticated true
     * @response 200 { "success": true, "message": "Cuenta eliminada exitosamente" }
     * @response 401 { "success": false, "message": "No autenticado" }
     */
    public function destroy(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if (!$user) {
                return $this->error('No autenticado', 401);
            }

            // Revocar todos los tokens
            $user->tokens()->delete();

            // Eliminar usuario
            $user->delete();

            return $this->success(null, 'Cuenta eliminada exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al eliminar cuenta: ' . $e->getMessage(), 500);
        }
    }
}
