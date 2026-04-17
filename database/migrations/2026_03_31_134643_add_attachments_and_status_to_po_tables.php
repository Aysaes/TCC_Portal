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
        Schema::table('purchase_orders', function (Blueprint $table) {
        // Only add the column if it doesn't exist yet
        if (!Schema::hasColumn('purchase_orders', 'attachments')) {
            $table->json('attachments')->nullable();
        }
        
        // Do the same for the status column if it's in this file
        if (!Schema::hasColumn('purchase_orders', 'status')) {
            $table->string('status')->default('pending');
        }
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn('attachments');
        });
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
