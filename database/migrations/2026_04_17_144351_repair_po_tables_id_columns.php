<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Add this import

return new class extends Migration
{
    public function up(): void
    {
        // 1. Fix purchase_orders
        if (Schema::hasTable('purchase_orders')) {
            // We use raw SQL to ensure the Primary Key and Auto Increment are set at the same time
            DB::statement('ALTER TABLE purchase_orders MODIFY id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY');
        }

        // 2. Fix purchase_order_items
        if (Schema::hasTable('purchase_order_items')) {
            DB::statement('ALTER TABLE purchase_order_items MODIFY id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY');
        }
    }

    public function down(): void
    {
        // Down remains empty to protect data
    }
};