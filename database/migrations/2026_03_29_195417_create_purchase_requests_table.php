<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // The person who created it
            $table->string('branch');
            $table->string('department');
            $table->date('date_prepared');
            $table->string('request_type')->nullable();
            $table->string('priority')->nullable();
            $table->date('date_needed')->nullable();
            $table->string('budget_status')->nullable();
            $table->string('budget_ref');
            $table->integer('no_of_quotations');
            $table->text('purpose_of_request')->nullable();
            $table->text('impact_if_not_procured')->nullable();
            $table->string('status')->default('pending_inventory_assistant'); // Initial status
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_requests');
    }
};