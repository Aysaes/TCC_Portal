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
           
            if (Schema::hasColumn('announcements', 'priority')) {
                $table->dropColumn('priority');
            }
            if (Schema::hasColumn('announcements', 'priority_color')) {
                $table->dropColumn('priority_color');
                
            }

            $table->foreignId('priority_level_id')->nullable()->constrained('priority_levels')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            //
        });
    }
};
