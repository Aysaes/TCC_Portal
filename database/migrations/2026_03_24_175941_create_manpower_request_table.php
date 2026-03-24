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
        Schema::create('manpower_request', function (Blueprint $table) {
            $table->id();

            // Core Relations
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // The creator/TL
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->foreignId('position_id')->constrained()->cascadeOnDelete();
            
            // Plantilla / Budget
            $table->boolean('is_budgeted')->default(true);
            $table->text('unbudgeted_purpose')->nullable();
            
            // Requirements
            $table->integer('headcount')->default(1);
            $table->date('date_needed');
            $table->string('educational_background');
            $table->string('years_experience');
            $table->text('skills_required');
            
            // Employment Details
            $table->string('employment_status'); 
            $table->string('reliever_info')->nullable();
            
            // Purpose & Job Details
            $table->text('purpose');
            $table->boolean('is_new_position')->default(false);
            $table->text('job_description')->nullable();
            $table->boolean('is_replacement')->default(false);
            $table->string('replaced_employee_name')->nullable();
            
            // Signatories & Routing
            $table->string('poc_name'); 
            $table->foreignId('requesting_manager_id')->constrained('users'); 
            
            // The 3-Step Workflow Trackers
            $table->string('manager_approval_status')->default('Pending');
            $table->string('hr_approval_status')->default('Pending');
            $table->string('director_approval_status')->default('Pending');
            
            // Master Status (Pending, Approved, Rejected, Fulfilled)
            $table->string('status')->default('Pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manpower_request');
    }
};
