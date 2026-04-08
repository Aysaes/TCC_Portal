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
        Schema::table('company_contents', function (Blueprint $table) {
            $table->longText('content_html')->nullable()->after('content');
            $table->decimal('image_zoom', 8, 4)->nullable()->default(1)->after('image_path');
            $table->decimal('image_offset_x', 8, 4)->nullable()->default(0)->after('image_zoom');
            $table->decimal('image_offset_y', 8, 4)->nullable()->default(0)->after('image_offset_x');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_contents', function (Blueprint $table) {
            $table->dropColumn([
                'content_html',
                'image_zoom',
                'image_offset_x',
                'image_offset_y'
            ]);
        });
    }
};