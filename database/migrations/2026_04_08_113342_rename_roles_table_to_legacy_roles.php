<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // 🟢 Safely renames your old table without deleting any data
        Schema::rename('roles', 'legacy_roles');
    }

    public function down()
    {
        // Reverts it if we ever need to roll back
        Schema::rename('legacy_roles', 'roles');
    }
};
