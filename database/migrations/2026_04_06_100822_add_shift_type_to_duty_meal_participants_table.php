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
            $table->string('shift_type')->default('Day Shift')->after('user_id'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('duty_meal_participants', function (Blueprint $table) {
            $table->dropColumn('shift_type');
        });
    }
};
