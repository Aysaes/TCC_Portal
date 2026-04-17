<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
{
    // Make sure the column exists before we try to update data inside it!
    if (Schema::hasColumn('users', 'status')) {
        
        // 1. If they already have a password set, they are Active
        DB::table('users')
            ->whereNull('status')
            ->whereNotNull('password')
            ->update(['status' => 'Active']);

        // 2. If their password column is null, they are Pending Setup
        DB::table('users')
            ->whereNull('status')
            ->whereNull('password')
            ->update(['status' => 'Pending Setup']);

        // 3. Now alter the column safely
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->nullable()->default('Pending Setup')->change();
        });
    }
}

public function down(): void
{
    // If you need to rollback, you can remove the default value
    if (Schema::hasColumn('users', 'status')) {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->nullable()->default(null)->change();
        });
    }
}
};