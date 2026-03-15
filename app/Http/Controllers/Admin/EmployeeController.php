<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $users = User::with(['department', 'position'])->get();
        return Inertia::render('Admin/EmployeeManagement', [
            'users' => $users,
        ]);
    }
}
