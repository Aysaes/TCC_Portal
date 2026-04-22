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
        Schema::table('duty_meal_participants', function (Blueprint $table) {
            // Adding the 'site' column right after 'choice'
            $table->string('site')->nullable()->after('choice');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('duty_meal_participants', function (Blueprint $table) {
            // This allows you to roll back if needed
            $table->dropColumn('site');
        });
    }
};