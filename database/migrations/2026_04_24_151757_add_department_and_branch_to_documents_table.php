<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable()->after('category');
            $table->unsignedBigInteger('branch_id')->nullable()->after('department_id'); // Null = "All Branches"

            // Optional: Add Foreign Keys if you want strict referential integrity
            // $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            // $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['department_id', 'branch_id']);
        });
    }
};