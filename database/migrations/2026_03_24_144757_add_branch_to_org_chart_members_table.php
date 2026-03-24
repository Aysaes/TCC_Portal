<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('org_chart_members', function (Blueprint $table) {
            // We add a default so any test members you already uploaded don't cause errors!
            $table->string('branch')->default('Executives')->after('position');
        });
    }

    public function down(): void
    {
        Schema::table('org_chart_members', function (Blueprint $table) {
            $table->dropColumn('branch');
        });
    }
};