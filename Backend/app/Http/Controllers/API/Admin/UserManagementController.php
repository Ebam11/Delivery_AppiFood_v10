<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::included()->filter()->sort()->getOrPaginate();

        return response()->json(
            UserResource::collection($users)->response()->getData(true)
        );
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with('restaurant', 'orders')->included()->findOrFail($id);
        return response()->json(['data' => new UserResource($user)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name'  => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $id],
            'role'  => ['sometimes', 'in:' . implode(',', UserRole::values())],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::findOrFail($id);
        $user->update($request->only('name', 'email', 'role', 'phone'));

        return response()->json([
            'message' => 'Usuario actualizado.',
            'data'    => new UserResource($user->fresh()),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'No puedes eliminar un administrador.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado.']);
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'No puedes desactivar un administrador.'], 403);
        }

        $user->update(['status' => !$user->status]);

        return response()->json([
            'message' => $user->status ? 'Usuario activado.' : 'Usuario desactivado.',
            'status'  => $user->status,
        ]);
    }
}
