<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('specifications')->nullable();
            $table->string('unit')->nullable();
            $table->integer('qty_requested')->default(0);
            $table->integer('qty_on_hand')->default(0);
            $table->integer('reorder_level')->default(0);
            $table->decimal('est_unit_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_request_items');
    }
};