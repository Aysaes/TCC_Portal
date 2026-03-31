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
    Schema::create('system_logs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Nullable for failed logins from unknown users
        $table->string('module'); // e.g., 'Employee Management', 'Auth'
        $table->string('action'); // e.g., 'Create', 'Update', 'Delete', 'Login', 'Failed Login'
        $table->text('description'); 
        $table->string('ip_address')->nullable();
        $table->text('user_agent')->nullable();
        $table->string('status')->default('success'); // 'success', 'warning', 'danger'
        $table->timestamps(); // Created_at acts as our timestamp
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
