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
        Schema::create('company_contents', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // e.g., 'mission', 'vision', 'announcement'
            $table->string('title')->nullable(); 
            $table->longText('content')->nullable();
            $table->string('image_path')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_contents');
    }
};
