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
    Schema::create('coupons', function (Blueprint $table) {
        $table->id();
        $table->foreignId('restaurant_id')->nullable()->constrained()->nullOnDelete();
        $table->string('code')->unique();
        $table->enum('type', ['percentage', 'fixed']);
        $table->decimal('value', 8, 2);
        $table->decimal('minimum_order', 8, 2)->default(0);
        $table->unsignedInteger('max_uses')->nullable();
        $table->unsignedInteger('used_count')->default(0);
        $table->timestamp('starts_at')->nullable();
        $table->timestamp('expires_at')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
