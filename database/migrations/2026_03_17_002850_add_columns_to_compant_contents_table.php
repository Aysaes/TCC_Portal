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
            $table->string('type')->after('id'); 
            $table->string('title')->nullable()->after('type'); 
            $table->longText('content')->nullable()->after('title'); 
            $table->string('image_path')->nullable()->after('content');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_contents', function (Blueprint $table) {
         $table->dropColumn(['type', 'title', 'content', 'image_path']);
        });
    }
};
