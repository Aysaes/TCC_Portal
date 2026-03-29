<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Department;
use App\Models\Position;
use App\Models\Branch;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Skip empty rows or rows without an email
        if (!isset($row['name']) || !isset($row['email'])) {
            return null;
        }

        // 1. Resolve Relationships
        $department = Department::where('name', trim($row['department']))->first();
        $position = Position::where('name', trim($row['position']))->first();

        // 2. Create the User (Defaulting password to 'password123' so they can log in initially)
        $user = User::updateOrCreate(
            ['email' => trim($row['email'])], // Update if email exists, otherwise create
            [
                'name' => trim($row['name']),
                'department_id' => $department ? $department->id : null,
                'position_id' => $position ? $position->id : null,
                'password' => Hash::make('password123'),
                'is_rotating' => 0, // Default values for the rest
                'device_limit' => 1,
            ]
        );

        // 3. Handle Multiple Branches (Pivot Table)
        if (isset($row['branch'])) {
            // Split by comma in case they typed "Makati, Alabang"
            $branchNames = array_map('trim', explode(',', $row['branch']));
            
            // Find the IDs for those branch names
            $branchIds = Branch::whereIn('name', $branchNames)->pluck('id')->toArray();
            
            if (!empty($branchIds)) {
                // Sync updates the pivot table. 
                $user->branches()->sync($branchIds);
                
                
                $user->update(['branch_id' => $branchIds[0]]);
            }
        }

        return $user;
    }
}