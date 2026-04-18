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
        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('suppliers', 'contact_person')) {
            $table->string('contact_person')->nullable()->after('name');
        }
        
        // Do the same for the status column if it's in this file
        if (!Schema::hasColumn('suppliers', 'contact_person')) {
             $table->string('contact_number')->nullable()->after('contact_person');
        }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['contact_person', 'contact_number']);
        });
    }
};
