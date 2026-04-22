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
    Schema::table('purchase_requests', function (Blueprint $table) {
       if(Schema::hasColumn('purchase_requests', 'no_of_quotations')) {
            $table->dropColumn('no_of_quotations');
        }
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table) {
            //
        });
    }
};
