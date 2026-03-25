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
        Schema::table('manpower_requests', function (Blueprint $table) {
            // Change these columns to allow null values
        $table->unsignedBigInteger('requesting_manager_id')->nullable()->change();
        $table->string('manager_approval_status')->nullable()->change();
        $table->string('hr_approval_status')->nullable()->change();
        $table->string('director_approval_status')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('manpower_requests', function (Blueprint $table) {
            //
        });
    }
};
