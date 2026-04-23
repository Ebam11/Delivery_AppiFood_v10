<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * Base Controller
 *
 * Proporciona funcionalidad común a todos los controllers:
 * - ApiResponse trait para respuestas JSON consistentes
 * - Authorization y Validation
 *
 * Todos los controllers deben extender esta clase.
 */
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests, ApiResponse;
}
