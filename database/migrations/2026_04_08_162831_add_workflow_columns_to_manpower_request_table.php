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
    
        if (!Schema::hasColumn('manpower_request', 'workflow_path')) {
           $table->json('workflow_path')->nullable();
        }
        
     
        if (!Schema::hasColumn('manpower_request', 'current_step')) {
                $table->integer('current_step')->default(0);
        }
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