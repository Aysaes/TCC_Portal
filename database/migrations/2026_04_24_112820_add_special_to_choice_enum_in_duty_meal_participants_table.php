<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Using raw SQL is the safest way to update an ENUM column in MySQL
        DB::statement("ALTER TABLE duty_meal_participants MODIFY COLUMN choice ENUM('none', 'main', 'alt', 'special') DEFAULT 'none'");
    }

    public function down()
    {
        DB::statement("ALTER TABLE duty_meal_participants MODIFY COLUMN choice ENUM('none', 'main', 'alt') DEFAULT 'none'");
    }
};