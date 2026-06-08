<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Modificar el enum de roles en la tabla users usando raw statement para evitar limitaciones de laravel
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'restaurant', 'user', 'driver') NOT NULL DEFAULT 'user'");

        // 2. Agregar la columna de puntos a los usuarios
        Schema::table('users', function (Blueprint $table) {
            $table->integer('points')->default(0)->after('is_premium');
        });

        // 3. Agregar el conductor asignado y sus coordenadas a las órdenes
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('driver_id')->nullable()->after('coupon_id')->constrained('users')->nullOnDelete();
            $table->decimal('driver_lat', 10, 8)->nullable()->after('delivery_lng');
            $table->decimal('driver_lng', 11, 8)->nullable()->after('driver_lat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['driver_id']);
            $table->dropColumn(['driver_id', 'driver_lat', 'driver_lng']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('points');
        });

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'restaurant', 'user') NOT NULL DEFAULT 'user'");
    }
};
