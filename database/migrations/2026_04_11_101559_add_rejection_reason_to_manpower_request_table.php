<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('manpower_request', function (Blueprint $table) {
        // Only add the column if it doesn't already exist
        if (!Schema::hasColumn('manpower_request', 'rejection_reason')) {
            $table->text('rejection_reason')->nullable()->after('status');
        }
    });
}

public function down(): void
{
    Schema::table('manpower_request', function (Blueprint $table) {
        // Safely drop it if you ever need to rollback
        if (Schema::hasColumn('manpower_request', 'rejection_reason')) {
            $table->dropColumn('rejection_reason');
        }
    });
}
};