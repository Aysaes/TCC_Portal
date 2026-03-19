<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // We iterate through every user to sync their primary branch
        User::all()->each(function ($user) {
            // Get the ID of the first branch they are attached to in the pivot table
            $primaryBranchId = DB::table('branch_user')
                ->where('user_id', $user->id)
                ->value('branch_id');

            // If a relationship exists, update the main users table
            if ($primaryBranchId) {
                $user->update(['branch_id' => $primaryBranchId]);
            }
        });
    }

    public function down(): void
    {
        // No need to reverse this as it's a data sync
    }
};