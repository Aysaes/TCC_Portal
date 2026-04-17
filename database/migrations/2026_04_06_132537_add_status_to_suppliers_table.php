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
    Schema::table('suppliers', function (Blueprint $table) {
        // Only add the status column if it doesn't already exist
        if (!Schema::hasColumn('suppliers', 'status')) {
            $table->string('status')->nullable()->after('contact_number');
        }
    });
}

public function down(): void
{
    Schema::table('suppliers', function (Blueprint $table) {
        // Safely drop it if you ever need to rollback
        if (Schema::hasColumn('suppliers', 'status')) {
            $table->dropColumn('status');
        }
    });
}
};
