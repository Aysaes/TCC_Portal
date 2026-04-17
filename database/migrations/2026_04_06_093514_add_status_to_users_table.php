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
    Schema::table('users', function (Blueprint $table) {
        // 🟢 Only add the column if it doesn't already exist
        if (!Schema::hasColumn('users', 'status')) {
            $table->string('status')->nullable()->after('password'); 
        }
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        // Safely drop it if we ever need to rollback
        if (Schema::hasColumn('users', 'status')) {
            $table->dropColumn('status');
        }
    });
}
};
