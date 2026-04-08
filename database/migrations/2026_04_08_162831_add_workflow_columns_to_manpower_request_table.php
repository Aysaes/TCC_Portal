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
        Schema::table('manpower_request', function (Blueprint $table) {
            // Adds the JSON column to store the array of approvers
            $table->json('workflow_path')->nullable();
            
            // Adds the integer column to track which step the request is currently on
            $table->integer('current_step')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('manpower_request', function (Blueprint $table) {
            $table->dropColumn(['workflow_path', 'current_step']);
        });
    }
};