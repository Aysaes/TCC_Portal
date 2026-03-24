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
        Schema::create('hr_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Links to the employee who requested it
            $table->string('type'); // '2316' or 'COE'
            $table->string('status')->default('Pending HR'); // Tracks the flow!
            
            // COE Specific Fields
            $table->string('name')->nullable();
            $table->string('reason')->nullable();
            $table->string('specific_details')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_requests');
    }
};
