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
        Schema::create('duty_meal_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('duty_meal_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('choice', ['main', 'alt', 'none'])->default('none');

            $table->boolean('is_graveyard')->default(false);
            
            $table->timestamps();

            $table->unique(['duty_meal_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('duty_meal_participants');
    }
};
