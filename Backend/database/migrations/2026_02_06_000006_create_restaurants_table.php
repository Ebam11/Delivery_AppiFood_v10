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
    Schema::create('restaurants', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('name');
        $table->text('description')->nullable();
        $table->string('logo')->nullable();
        $table->string('banner')->nullable();
        $table->string('address');
        $table->decimal('lat', 10, 8)->nullable();
        $table->decimal('lng', 11, 8)->nullable();
        $table->string('phone', 20)->nullable();
        $table->string('email')->nullable();
        $table->decimal('average_rating', 3, 2)->default(0);
        $table->unsignedInteger('total_reviews')->default(0);
        $table->decimal('delivery_cost', 8, 2)->default(0);
        $table->decimal('minimum_order', 8, 2)->default(0);
        $table->unsignedSmallInteger('delivery_time_min')->default(30);
        $table->boolean('is_active')->default(true);
        $table->boolean('is_verified')->default(false);
        $table->timestamps();
    });


    Schema::create('restaurant_restaurant_category', function (Blueprint $table) {
        $table->foreignId('restaurant_id')
              ->constrained()
              ->onDelete('cascade');
        $table->foreignId('restaurant_category_id')
              ->constrained()
              ->onDelete('cascade');
        $table->primary(['restaurant_id', 'restaurant_category_id']);
    });
}

public function down(): void
{
    Schema::dropIfExists('restaurant_restaurant_category');
    Schema::dropIfExists('restaurants');
}
};
