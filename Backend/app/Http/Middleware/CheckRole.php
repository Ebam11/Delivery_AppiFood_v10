<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'No autenticado.',
            ], 401);
        }

        $currentRole = $user->role instanceof UserRole ? $user->role->value : (string) $user->role;

        if (!in_array($currentRole, $roles, true)) {
            return response()->json([
                'message' => 'No autorizado para acceder a este recurso.',
            ], 403);
        }

        return $next($request);
    }
}
