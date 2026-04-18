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
        
        if (!Schema::hasColumn('company_contents', 'content_html')) {
            $table->longText('content_html')->nullable()->after('content');
        }

        if (!Schema::hasColumn('company_contents', 'image_zoom')) {
            $table->decimal('image_zoom', 8, 4)->nullable()->default(1)->after('image_path');
        }

        if (!Schema::hasColumn('company_contents', 'image_offset_x')) {
            $table->decimal('image_offset_x', 8, 4)->nullable()->default(0)->after('image_zoom');
        }

        if (!Schema::hasColumn('company_contents', 'image_offset_y')) {
            $table->decimal('image_offset_y', 8, 4)->nullable()->default(0)->after('image_offset_x');
        }

    });
}

public function down(): void
{
    Schema::table('company_contents', function (Blueprint $table) {
        
        // Safely drop them only if they exist
        if (Schema::hasColumn('company_contents', 'content_html')) {
            $table->dropColumn('content_html');
        }
        if (Schema::hasColumn('company_contents', 'image_zoom')) {
            $table->dropColumn('image_zoom');
        }
        if (Schema::hasColumn('company_contents', 'image_offset_x')) {
            $table->dropColumn('image_offset_x');
        }
        if (Schema::hasColumn('company_contents', 'image_offset_y')) {
            $table->dropColumn('image_offset_y');
        }
        
    });
}
};