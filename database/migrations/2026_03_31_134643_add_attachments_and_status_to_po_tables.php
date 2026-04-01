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
            $table->json('attachments')->nullable(); // Stores an array of file paths
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->string('status')->default('active'); // Can be 'active' or 'removed'
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
