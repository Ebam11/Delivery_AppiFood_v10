<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Obtiene la ruta de redireccion cuando el usuario no esta autenticado.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Backend solo API: null fuerza respuesta 401 en lugar de redireccion web.
        return null;
    }
}
