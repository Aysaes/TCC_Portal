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
    Schema::table('products', function (Blueprint $table) {
        // Only add the status column if it doesn't already exist
        if (!Schema::hasColumn('products', 'status')) {
            $table->string('status')->nullable()->after('price');
        }
    });
}

public function down(): void
{
    Schema::table('products', function (Blueprint $table) {
        // Safely drop it if you ever need to rollback
        if (Schema::hasColumn('products', 'status')) {
            $table->dropColumn('status');
        }
    });
}
};
