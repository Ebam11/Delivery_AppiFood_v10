<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ALTER ... MODIFY no es compatible con SQLite; omitir en tests con sqlite
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE subscription_plans MODIFY monthly_price DECIMAL(10,2) NOT NULL');
        DB::statement('ALTER TABLE subscription_plans MODIFY annual_price DECIMAL(10,2) NOT NULL');
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE subscription_plans MODIFY monthly_price DECIMAL(8,2) NOT NULL');
        DB::statement('ALTER TABLE subscription_plans MODIFY annual_price DECIMAL(8,2) NOT NULL');
    }
};
