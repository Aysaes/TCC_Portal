<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix for purchase_orders
        if (Schema::hasTable('purchase_orders')) {
            Schema::table('purchase_orders', function (Blueprint $table) {
                // bigIncrements() handles both PRIMARY KEY and AUTO_INCREMENT in one go
                $table->bigIncrements('id')->change();
            });
        }

        // Fix for purchase_order_items
        if (Schema::hasTable('purchase_order_items')) {
            Schema::table('purchase_order_items', function (Blueprint $table) {
                $table->bigIncrements('id')->change();
            });
        }
    }

    public function down(): void
    {
        // Usually, we don't downgrade primary keys as it risks data integrity
    }
};