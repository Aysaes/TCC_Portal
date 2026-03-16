<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Department;
use App\Models\Position;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $users = User::with(['department', 'position'])->get();
        $departments = Department::all();

        return Inertia::render('Admin/EmployeeManagement', [
            'users' => $users,
            'departments' => $departments,
        ]);
    }

    public function storePosition(Request $request)
    {
        try{
            $request->validate([
            'department_id' => 'required|exists:departments,id',
            'position_name' => 'required|string|max:255',
        ]);

        Position::create([
            'department_id' => $request->department_id,
            'name' => $request->position_name,
        ]);

        return redirect()->back()->with('success', 'Position added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while adding the position: ' . $e->getMessage());
        }
        
    }
}
