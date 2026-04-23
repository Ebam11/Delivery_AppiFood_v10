<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_payment_methods', function (Blueprint $table) {
            $table->string('exp_month', 2)->nullable()->after('last_four');
            $table->string('exp_year', 2)->nullable()->after('exp_month');
        });
    }

    public function down(): void
    {
        Schema::table('user_payment_methods', function (Blueprint $table) {
            $table->dropColumn(['exp_month', 'exp_year']);
        });
    }
};
