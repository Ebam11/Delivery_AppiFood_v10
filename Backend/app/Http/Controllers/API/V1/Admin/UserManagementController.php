<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Admin User Management Controller V1
 *
 * Maneja operaciones CRUD de usuarios para administradores
 */
class UserManagementController extends Controller
{
    use ApiResponse;

    /**
     * List All Users (Admin Only)
     *
     * @authenticated true
     * @response 200 { "success": true, "data": [...] }
     */
    public function index(): JsonResponse
    {
        try {
            $users = User::paginate(20);
            return $this->success(UserResource::collection($users), 'Usuarios obtenidos');
        } catch (\Exception $e) {
            return $this->error('Error al obtener usuarios: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get User Details
     *
     * @authenticated true
     * @param int $id
     * @response 200 { "success": true, "data": {...} }
     */
    public function show($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            return $this->success(new UserResource($user), 'Usuario obtenido');
        } catch (\Exception $e) {
            return $this->error('Usuario no encontrado', 404);
        }
    }

    /**
     * Create User (Admin Only)
     *
     * @authenticated true
     * @response 201 { "success": true, "data": {...} }
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users',
                'password' => 'required|string|min:8',
                'role'     => 'required|in:user,admin,restaurant',
            ]);

            $user = User::create($validated);
            return $this->success(new UserResource($user), 'Usuario creado exitosamente', 201);
        } catch (\Exception $e) {
            return $this->error('Error al crear usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update User
     *
     * @authenticated true
     * @param int $id
     * @response 200 { "success": true, "data": {...} }
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $validated = $request->validate([
                'name'   => 'sometimes|string|max:255',
                'email'  => ['sometimes', 'email', Rule::unique('users')->ignore($id)],
                'role'   => 'sometimes|in:user,admin,restaurant',
                'status' => 'sometimes|boolean',
            ]);

            $user->update($validated);
            return $this->success(new UserResource($user), 'Usuario actualizado exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al actualizar usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete User
     *
     * @authenticated true
     * @param int $id
     * @response 200 { "success": true, "message": "Usuario eliminado" }
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return $this->success(null, 'Usuario eliminado exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al eliminar usuario: ' . $e->getMessage(), 500);
        }
    }
}
