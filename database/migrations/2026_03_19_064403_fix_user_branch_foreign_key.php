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
    Schema::table('users', function (Blueprint $table) {
        // 1. Drop the incorrect foreign key first
        $table->dropForeign(['branch_id']);
        
        // 2. Re-add it pointing to the 'branches' table
        $table->foreign('branch_id')
              ->references('id')
              ->on('branches')
              ->onDelete('set null');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
