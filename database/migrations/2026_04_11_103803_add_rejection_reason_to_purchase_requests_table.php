<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::table('purchase_requests', function (Blueprint $table) {
        // Only add the rejection_reason if it doesn't already exist
        if (!Schema::hasColumn('purchase_requests', 'rejection_reason')) {
            $table->text('rejection_reason')->nullable()->after('status');
        }
    });
}

public function down(): void
{
    Schema::table('purchase_requests', function (Blueprint $table) {
        // Safely drop it if you ever need to rollback
        if (Schema::hasColumn('purchase_requests', 'rejection_reason')) {
            $table->dropColumn('rejection_reason');
        }
    });
}
};