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
    Schema::table('purchase_order_items', function (Blueprint $table) {
        // Only add the notes column if it doesn't already exist
        if (!Schema::hasColumn('purchase_order_items', 'notes')) {
            $table->string('notes')->nullable()->after('description');
        }
    });
}

public function down(): void
{
    Schema::table('purchase_order_items', function (Blueprint $table) {
        // Safely drop it if you ever need to rollback
        if (Schema::hasColumn('purchase_order_items', 'notes')) {
            $table->dropColumn('notes');
        }
    });
}
};
