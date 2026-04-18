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
        // Only add the column if it doesn't already exist
        if (!Schema::hasColumn('duty_meal_participants', 'shift_type')) {
            $table->string('shift_type')->default('Day Shift')->after('user_id'); 
        }
    });
}

public function down(): void
{
    Schema::table('duty_meal_participants', function (Blueprint $table) {
        // Safely drop it if we rollback
        if (Schema::hasColumn('duty_meal_participants', 'shift_type')) {
            $table->dropColumn('shift_type');
        }
    });
}
};
