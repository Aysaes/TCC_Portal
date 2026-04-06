<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use App\Models\User;
use App\Models\Department;
use App\Models\Position;
use App\Models\Branch;
use App\Models\Role;
use App\Exports\UsersExport;
use App\Exports\UsersTemplateExport;
use App\Imports\UsersImport;
use Maatwebsite\Excel\Facades\Excel;
use App\Notifications\AccountActivation;
use App\Notifications\AdminPasswordReset;
use Inertia\Inertia;


class EmployeeController extends Controller
{
    public function index()
    {
        $users = User::with(['department', 'position', 'branches'])->get();
        $positions = Position::all();
        $departments = Department::all();
        $branches = Branch::all();
        $roles = Role::all();

        return Inertia::render('Admin/EmployeeManagement', [
            'users' => $users,
            'departments' => $departments,
            'positions' => $positions,
            'branches' => $branches,
            'roles' => $roles
        ]);
    }

        // ----------------Store User, Position, Branch functions ----------------

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'string|min:8|',
            'role_id' => 'required|exists:roles,id',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'branch_ids' => 'required|array',
            'branch_ids.*' => 'exists:branches,id',
        ]);
        try{
            $user = User::create([
            'name' => trim($request->name),
            'email' => trim($request->email),
            'password' => null,
            'role_id' => $request->role_id,
            'department_id' => $request->department_id,
            'position_id' => $request->position_id,
            'device_limit'=> $request->device_limit,
            'branch_id' => $request->branch_ids[0] ?? null,
            'is_rotating'=> count($request->branch_ids) > 1,
        ]);

        $user->branches()->attach($request->branch_ids);

        return redirect()->back()->with('success', 'Employee added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while adding the employee: ' . $e->getMessage());
        }
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

     public function storeBranch (Request $request)
    {
        try{
            $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Branch::create([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Branch added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while adding the branch: ' . $e->getMessage());
        }
    }

    public function storeDepartment (Request $request){
        try{
            $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',]);
            Department::create([
            'name' => $request->name,]);
            return back()->with('success', 'Department added successfully.');
        }catch(\Exception $e){
            return back()->with('error', 'An error occured while adding the department: ' . $e->getMessage());
        }
    }

    public function destroyDepartment(Department $department)
    {
        try {
            // 1. Check if the department has active employees
            if ($department->users()->exists()) {
                return back()->with('error', 'Cannot delete a department that has active employees.');
            }

            // 2. Check if the department still has positions assigned to it
            if ($department->positions()->exists()) {
                return back()->with('error', 'Cannot delete a department that has existing positions. Please reassign or delete the positions first.');
            }

            // 3. Safe to delete
            $department->delete();
            return back()->with('success', 'Department deleted successfully.');

        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while deleting the department: ' . $e->getMessage());
        }
    }

    public function storeRole (Request $request){
        try{
            $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        Role::create([
            'name' => $request->name,
        ]);

        return back()->with('success', 'System role added successfully.');
        }catch(\Exception $e){
            return back()->with('error', 'An error occured while adding the role: ' . $e->getMessage());
        }
    }

    public function destroyRole (Role $role){
        try{
            if (strtolower($role->name) === 'admin' || strtolower($role->name) === 'super admin') {
            return back()->withErrors(['name' => 'Cannot delete core system roles.']);
        }

        if ($role->users()->exists()) {
             return back()->withErrors(['name' => 'Cannot delete a role that is currently assigned to employees.']);
        }

        $role->delete();

        return back()->with('success', 'Role deleted successfully.');
        }catch(\Exception $e){
            return back()->with('error', 'An error occured while deleting the department: ' . $e->getMessage());
        }
    }

    // ----------------Edit, Device Reset, and Delete functions ----------------

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role_id' => 'required|exists:roles,id',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'device_limit' => 'nullable|integer|min:1',
            'branch_ids' => 'required|array|min:1',
            'branch_ids.*' => 'exists:branches,id',
        ]);

        try{
            $user->update([
                'name' => trim($request->name),
                'email' => trim($request->email),
                'role_id' => $request->role_id,
                'department_id' => $request->department_id,
                'position_id' => $request->position_id,
                'device_limit'=> $request->device_limit,
                'is_rotating'=> count($request->branch_ids) > 1,
            ]);

            $user->branches()->sync($request->branch_ids);

            return redirect()->back()->with('success', 'Employee updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while updating the employee: ' . $e->getMessage());
        }
    }

    public function resetDevice(User $user)
    {
        try{
            $user->authorized_device_ids = null;
            $user->save();
            return redirect()->back()->with('success', "Device successfully reset for {$user->name}.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to reset device: ' . $e->getMessage());
        }
    }

    public function destroy(User $user)
    {
        // 1. Log that the React frontend successfully reached this route
        Log::info("Delete route hit for user ID: {$user->id}");

        try {
            if (Auth::id() === $user->id) {
                Log::warning("Admin attempted to delete themselves. ID: {$user->id}");
                return back()->with('error', 'You cannot delete your own admin account!');
            }

            Log::info("Detaching branches for user ID: {$user->id}");
            $user->branches()->detach();

            Log::info("Attempting to delete user ID: {$user->id} from database");
            $user->delete();

            Log::info("Successfully deleted user ID: {$user->id}");
            return back()->with('success', "Employee {$user->name} has been permanently deleted.");
            
        } catch (\Exception $e) {
            // 2. Log the exact error message, file, and line number if it crashes
            Log::error("Failed to delete user ID {$user->id}. Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
            
            return back()->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
    }

    public function export(Request $request)
{
    return Excel::download(
        new UsersExport($request->search, $request->department, $request->branch), 
        'employees_export_' . now()->format('Ymd_His') . '.xlsx'
    );
}

public function downloadTemplate()
{
    return Excel::download(new UsersTemplateExport, 'employee_import_template.xlsx');
}

public function import(Request $request)
    {
        $request->validate(['import_file' => 'required|mimes:xlsx,xls,csv|max:10240']);
        
        try {
            Excel::import(new UsersImport, $request->file('import_file'));
            
            // 🟢 Triggers your GREEN toast automatically!
            return back()->with('success', 'Employees imported successfully.');
            
        } catch (\Exception $e) {
            // 🔴 Triggers your RED toast automatically! (Changed from withErrors)
            return back()->with('error', 'Failed to import. Please check your Excel format.');
        }
    }

  public function sendActivationLink(User $user)
    {

        if ($user->has_password) {
            return back()->with('error', 'This account is already active.');
        }

        /** @var \Illuminate\Auth\Passwords\PasswordBroker $broker */
        $broker = Password::broker();
        $token = $broker->createToken($user);
        
        $user->notify(new AccountActivation($token));

        return back()->with('success', 'Activation link sent to ' . $user->email);
    }

    public function sendResetLink(User $user)
    {
       


        /** @var \Illuminate\Auth\Passwords\PasswordBroker $broker */
        $broker = Password::broker();
        $token = $broker->createToken($user);
        
        $user->notify(new AdminPasswordReset($token));
        
        $user->update(['status' => null]);

        return back()->with('success', 'Reset link sent to ' . $user->email);
    }

    public function toggleStatus(User $user)
    {
        try {
            // Prevent the admin from accidentally disabling themselves!
            if (Auth::id() === $user->id) {
                return back()->with('error', 'You cannot disable your own admin account!');
            }

            if ($user->status === 'Disabled') {
                // If they are disabled, clear the status to re-enable them
                $user->update(['status' => null]);
                $message = "Account for {$user->name} has been re-enabled.";
            } else {
                // If they are active, disable them
                $user->update(['status' => 'Disabled']);
                $message = "Account for {$user->name} has been disabled.";
            }

            return back()->with('success', $message);
            
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update account status: ' . $e->getMessage());
        }
    }
}
