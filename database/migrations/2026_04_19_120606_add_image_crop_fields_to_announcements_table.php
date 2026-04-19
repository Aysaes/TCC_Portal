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
        Schema::table('announcements', function (Blueprint $table) {
            $table->decimal('image_zoom', 8, 2)->nullable()->default(1);
            $table->decimal('image_offset_x', 8, 2)->nullable()->default(0);
            $table->decimal('image_offset_y', 8, 2)->nullable()->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn([
                'image_zoom', 
                'image_offset_x', 
                'image_offset_y'
            ]);
        });
    }
};