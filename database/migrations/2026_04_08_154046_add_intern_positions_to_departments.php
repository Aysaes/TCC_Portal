<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Define the exact department names you provided
        $departmentNames = [
            'Accounting',
            'Human Resources',
            'Information Technology',
            'Marketing',
            'Procurement',
            'Veterinary Technicians'
        ];

        // 2. Find the IDs for these departments
        $departments = DB::table('departments')
            ->whereIn('name', $departmentNames)
            ->get();

        $newPositions = [];

        // 3. Prepare the insertion data
        foreach ($departments as $dept) {
            $newPositions[] = [
                'department_id' => $dept->id,
                'name'          => 'Intern',
                'created_at'    => now(),
                'updated_at'    => now(),
            ];
        }

        // 4. Insert the new positions into the database
        if (!empty($newPositions)) {
            DB::table('positions')->insert($newPositions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the 'Intern' positions if the migration is rolled back
        DB::table('positions')->where('name', 'Intern')->delete();
    }
};