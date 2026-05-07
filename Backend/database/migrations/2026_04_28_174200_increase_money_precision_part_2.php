<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('amount', 16, 2)->change();
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->decimal('value', 16, 2)->change();
            $table->decimal('minimum_order', 16, 2)->change();
        });

        Schema::table('restaurants', function (Blueprint $table) {
            $table->decimal('delivery_cost', 16, 2)->change();
            $table->decimal('minimum_order', 16, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->change();
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->decimal('value', 8, 2)->change();
            $table->decimal('minimum_order', 8, 2)->change();
        });

        Schema::table('restaurants', function (Blueprint $table) {
            $table->decimal('delivery_cost', 8, 2)->change();
            $table->decimal('minimum_order', 8, 2)->change();
        });
    }
};
