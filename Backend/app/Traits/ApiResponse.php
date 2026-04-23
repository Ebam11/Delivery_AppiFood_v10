<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * Trait ApiResponse
 *
 * Proporciona métodos helper para respuestas JSON consistentes
 * en toda la API.
 *
 * Respuestas estandarizadas:
 * - success() → Respuesta exitosa
 * - error() → Error genérico
 * - unauthorized() → 401 Unauthorized
 * - forbidden() → 403 Forbidden
 * - notFound() → 404 Not Found
 * - unprocessable() → 422 Unprocessable Entity (validación)
 * - created() → 201 Created
 *
 * @example
 * return $this->success(['user' => $user], 'Usuario creado', 201);
 * return $this->error('Algo salió mal', 500);
 * return $this->notFound('Usuario no encontrado');
 */
trait ApiResponse
{
    /**
     * Respuesta exitosa
     *
     * @param mixed $data Datos a retornar
     * @param string $message Mensaje de éxito
     * @param int $statusCode Código HTTP (default: 200)
     * @return JsonResponse
     */
    protected function success($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Respuesta de error genérica
     *
     * @param string $message Mensaje de error
     * @param int $statusCode Código HTTP (default: 500)
     * @param array $errors Errores adicionales
     * @return JsonResponse
     */
    protected function error(string $message = 'Error', int $statusCode = 500, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $statusCode);
    }

    /**
     * Recurso creado exitosamente
     *
     * @param mixed $data Datos creados
     * @param string $message Mensaje
     * @return JsonResponse
     */
    protected function created($data = null, string $message = 'Recurso creado exitosamente'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    /**
     * Error de validación (422)
     *
     * @param array $errors Errores de validación
     * @param string $message Mensaje
     * @return JsonResponse
     */
    protected function unprocessable(array $errors, string $message = 'Validación fallida'): JsonResponse
    {
        return $this->error($message, 422, $errors);
    }

    /**
     * No autorizado (401)
     *
     * @param string $message Mensaje
     * @return JsonResponse
     */
    protected function unauthorized(string $message = 'No autorizado'): JsonResponse
    {
        return $this->error($message, 401);
    }

    /**
     * Acceso denegado (403)
     *
     * @param string $message Mensaje
     * @return JsonResponse
     */
    protected function forbidden(string $message = 'Acceso denegado'): JsonResponse
    {
        return $this->error($message, 403);
    }

    /**
     * Recurso no encontrado (404)
     *
     * @param string $message Mensaje
     * @return JsonResponse
     */
    protected function notFound(string $message = 'Recurso no encontrado'): JsonResponse
    {
        return $this->error($message, 404);
    }

    /**
     * Conflicto (409) - Ej: registro duplicado
     *
     * @param string $message Mensaje
     * @return JsonResponse
     */
    protected function conflict(string $message = 'Conflicto con recurso existente'): JsonResponse
    {
        return $this->error($message, 409);
    }

    /**
     * Recurso ya existe (para crear cuando existe)
     *
     * @param string $message Mensaje
     * @return JsonResponse
     */
    protected function alreadyExists(string $message = 'El recurso ya existe'): JsonResponse
    {
        return $this->conflict($message);
    }

    /**
     * Error del servidor (500)
     *
     * @param string $message Mensaje
     * @param \Throwable|null $exception Excepción (opcional, para debug)
     * @return JsonResponse
     */
    protected function serverError(string $message = 'Error del servidor', ?\Throwable $exception = null): JsonResponse
    {
        $errors = [];

        if (config('app.debug') && $exception) {
            $errors = [
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'message' => $exception->getMessage(),
            ];
        }

        return $this->error($message, 500, $errors);
    }
}
