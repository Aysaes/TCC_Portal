<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Check if the column already exists before trying to add it
        if (!Schema::hasColumn('duty_meal_participants', 'site')) {
            Schema::table('duty_meal_participants', function (Blueprint $table) {
                $table->string('site')->nullable()->after('choice');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('duty_meal_participants', 'site')) {
            Schema::table('duty_meal_participants', function (Blueprint $table) {
                $table->dropColumn('site');
            });
        }
    }
};