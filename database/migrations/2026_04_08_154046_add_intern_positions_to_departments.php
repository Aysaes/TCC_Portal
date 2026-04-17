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
    $departmentNames = [
        'Accounting',
        'Human Resources',
        'Information Technology',
        'Marketing',
        'Procurement',
        'Veterinary Technicians'
    ];

    // 1. Get the departments
    $departments = DB::table('departments')
        ->whereIn('name', $departmentNames)
        ->get();

    // 2. Loop and use updateOrInsert to prevent duplicates
    foreach ($departments as $dept) {
        DB::table('positions')->updateOrInsert(
            [
                'department_id' => $dept->id,
                'name'          => 'Intern'
            ],
            [
                'created_at'    => now(),
                'updated_at'    => now(),
            ]
        );
    }
}

public function down(): void
{
    // Clean up if you ever rollback
    DB::table('positions')->where('name', 'Intern')->delete();
}
};