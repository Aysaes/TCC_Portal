<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =========================================================
        // 1. CREATE THE PARENT TABLE FIRST
        // =========================================================
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            
            // Explicit table targeting to prevent guessing errors
            $table->foreignId('purchase_request_id')->nullable()->constrained('purchase_requests')->nullOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->foreignId('prepared_by_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('po_number')->unique();
            $table->date('po_date');
            $table->date('delivery_date')->nullable();
            $table->string('payment_terms')->default('30 Days');
            
            $table->string('ship_to')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('attention')->nullable();
            $table->string('contact_no')->nullable();
            
            $table->text('purpose')->nullable();
            $table->string('department')->nullable();
            $table->string('delivery_location')->nullable();
            $table->text('special_instructions')->nullable();
            
            $table->decimal('gross_amount', 15, 2)->default(0);
            $table->decimal('discount_total', 15, 2)->default(0);
            $table->decimal('net_of_discount', 15, 2)->default(0);
            $table->decimal('vat_total', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            
            $table->string('status')->default('drafted');
            
            $table->timestamps();
        });

        // =========================================================
        // 2. CREATE THE CHILD TABLE SECOND
        // =========================================================
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            
            // Explicitly linking to the parent table created right above this
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            
            $table->text('description'); 
            $table->decimal('qty', 10, 2);
            $table->string('unit', 50)->nullable();
            $table->decimal('unit_price', 15, 2)->default(0);
            
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('vat_rate', 5, 2)->default(12.00); 
            $table->decimal('vat_amount', 15, 2)->default(0);
            $table->decimal('vat_inclusive', 15, 2)->default(0);
            $table->decimal('withholding_tax', 15, 2)->default(0);
            $table->decimal('net_payable', 15, 2)->default(0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Drop child first, then parent
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};