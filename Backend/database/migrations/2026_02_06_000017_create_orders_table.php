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
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
        $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
        $table->string('delivery_address');
        $table->decimal('delivery_lat', 10, 8)->nullable();
        $table->decimal('delivery_lng', 11, 8)->nullable();
        $table->decimal('subtotal', 10, 2);
        $table->decimal('delivery_cost', 8, 2)->default(0);
        $table->decimal('discount', 8, 2)->default(0);
        $table->decimal('total', 10, 2);
        $table->enum('status', [
            'pending','confirmed','preparing',
            'on_the_way','delivered','cancelled'
        ])->default('pending');
        $table->text('notes')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
