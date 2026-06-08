<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración: Agregar soporte para Refresh Token
 *
 * Agrega campos necesarios para almacenar y validar refresh tokens
 */
return new class extends Migration
{
    /**
     * Ejecutar la migración
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Hash del refresh token almacenado
            $table->string('refresh_token_hash')->nullable()->after('password');

            // Fecha de expiración del refresh token
            $table->timestamp('refresh_token_expires_at')->nullable()->after('refresh_token_hash');

            // Última fecha de acceso (para analytics)
            $table->timestamp('last_login_at')->nullable()->after('refresh_token_expires_at');

            // Índice para búsquedas rápidas
            $table->index('refresh_token_expires_at');
        });
    }

    /**
     * Revertir la migración
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('refresh_token_hash');
            $table->dropColumn('refresh_token_expires_at');
            $table->dropColumn('last_login_at');
        });
    }
};
