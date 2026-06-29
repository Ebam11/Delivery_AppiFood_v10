<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para sanitizar automáticamente todas las entradas del request.
 * Elimina etiquetas HTML y scripts maliciosos de las strings.
 */
class SanitizeInputs
{
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        array_walk_recursive($input, function (&$value) {
            if (is_string($value)) {
                // Elimina etiquetas HTML y PHP
                $value = strip_tags($value);
                // Escapa caracteres especiales de HTML
                $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            }
        });

        $request->merge($input);

        return $next($request);
    }
}
