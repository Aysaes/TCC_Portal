<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\ManpowerRequest;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ManpowerRequestController extends Controller
{
    // ----------------------------------------------------------------------
    // 1. THE CREATION FORM
    // ----------------------------------------------------------------------
    public function create()
    {
        $userRole = Auth::user()->role->name ?? '';

        // SECURITY: Only Team Leaders, Admins, and HR can access the form
        abort_if(
            !str_contains($userRole, 'Team Leader') && !in_array($userRole, ['admin', 'HR']), 
            403, 
            'Unauthorized. Only Team Leaders can submit Manpower Requests.'
        );

        return Inertia::render('HR/ManpowerRequest', [
            'branches' => Branch::select('id', 'name')->orderBy('name')->get(),
            'departments' => Department::select('id', 'name')->orderBy('name')->get(),
            'positions' => Position::select('id', 'name', 'department_id')->orderBy('name')->get(),
            
            // Fetch users who hold Manager roles for the routing dropdown
            'managers' => User::whereHas('role', function ($query) {
                $query->whereIn('name', ['Chief Vet', 'Operations Manager', 'Clinic Manager']);
            })->select('id', 'name', 'position_id')->with('position')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $userRole = Auth::user()->role->name ?? '';

        abort_if(
            !str_contains($userRole, 'Team Leader') && !in_array($userRole, ['Admin', 'HR Manager']), 
            403, 
            'Unauthorized action.'
        );

        // 1. Validate the incoming data (Notice we removed requesting_manager_id)
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'is_budgeted' => 'required|boolean',
            'unbudgeted_purpose' => 'nullable|string',
            'headcount' => 'required|integer|min:1',
            'date_needed' => 'required|date',
            'educational_background' => 'required|string',
            'years_experience' => 'required|string',
            'skills_required' => 'required|string',
            'employment_status' => 'required|string',
            'reliever_info' => 'nullable|string',
            'purpose' => 'required|string',
            'is_new_position' => 'required|boolean',
            'job_description' => 'nullable|string',
            'is_replacement' => 'required|boolean',
            'replaced_employee_name' => 'nullable|string',
            'poc_name' => 'required|string',
        ]);

        // 2. 🟢 AUTOMATIC ROUTING LOGIC (Based on Position) 🟢
        
        // Fetch the actual Position they are requesting to hire
        $position = Position::findOrFail($request->position_id);

        // Map the exact Position Name to the correct Manager's Role Name
        // (Update these strings to match the exact names in your 'positions' table!)
        $targetRoleName = match($position->name) {
            'Junior Veterinarian', 'Senior Veterinarian', 'Veterinary Technician' => 'Chief Vet',
            'Inventory Clerk', 'Logistics Assistant' => 'Operations Manager',
            'Clinic Assistant', 'Front Desk Receptionist' => 'Clinic Manager',
            default => 'Operations Manager', // Fallback
        };

        Log::info('MRF Routing Attempt:', [
            'position_id' => $request->position_id,
            'position_name' => $position->name, // Logging the position now!
            'target_role_needed' => $targetRoleName
        ]);

        $manager = User::whereHas('role', function ($query) use ($targetRoleName) {
            $query->where('name', $targetRoleName);
        })->first();

        if (!$manager) {
            Log::error("MRF Routing Failed: Could not find any user assigned to the role of '{$targetRoleName}'.");
            abort(500, "System Error: No user with the role of '{$targetRoleName}' was found to approve this request.");
        }

        // 3. Finalize the data and create the request
        $validated['requesting_manager_id'] = $manager->id;
        $validated['user_id'] = Auth::id();
        $validated['status'] = 'Pending';

        ManpowerRequest::create($validated);

        return redirect()->route('hr.manpower-requests.index')->with('success', 'Manpower Request submitted and routed to the ' . $targetRoleName . ' for approval.');
    }

    // ----------------------------------------------------------------------
    // 2. THE DASHBOARDS (Approval Board & Staff Overview)
    // ----------------------------------------------------------------------
    public function index()
    {
        $user = Auth::user();
        $userRole = $user->role->name ?? '';

        $query = ManpowerRequest::with([
            'requester:id,name', 
            'branch:id,name', 
            'department:id,name', 
            'position:id,name',
            'requestingManager:id,name'
        ]);

        // APPLY STRICT ROLE-BASED VISIBILITY
        if (str_contains($userRole, 'Team Leader')) {
            // Team Leaders only see their own submissions
            $query->where('user_id', $user->id);
            
        } elseif (in_array($userRole, ['Chief Vet', 'Operations Manager', 'Clinic Manager'])) {
            // Managers see requests routed to them OR their own submissions
            $query->where('requesting_manager_id', $user->id)
                  ->orWhere('user_id', $user->id);
                  
        } elseif ($userRole === 'HR Manager') {
            // HR sees requests that passed the Manager stage (for their action), plus all others for monitoring
            // No strict where() clause needed for general viewing, React will filter the "Action Required" tab
            
        } elseif ($userRole === 'Director of Corporate Services and Operations') {
            // Director sees requests that passed both Manager and HR
            $query->where('hr_approval_status', 'Approved')
                  ->orWhere('user_id', $user->id);
        }

        return Inertia::render('HR/ManpowerRequest', [
            'requests' => $query->latest()->get(),
            'userRole' => $userRole,
        ]);
    }

    // ----------------------------------------------------------------------
    // 3. THE 3-STAGE APPROVAL WORKFLOW
    // ----------------------------------------------------------------------
    public function updateStatus(Request $request, ManpowerRequest $manpowerRequest)
    {
        $request->validate([
            'level' => 'required|in:manager,hr,director',
            'status' => 'required|in:Pending,Approved,Rejected,Fulfilled'
        ]);

        // Stage 1: Manager
        if ($request->level === 'manager') {
            $manpowerRequest->update(['manager_approval_status' => $request->status]);
            if ($request->status === 'Rejected') {
                $manpowerRequest->update(['status' => 'Rejected']);
            }
        } 
        
        // Stage 2: HR
        elseif ($request->level === 'hr') {
            // Ensure Manager approved first
            abort_if($manpowerRequest->manager_approval_status !== 'Approved', 403, 'Manager must approve first.');
            
            $manpowerRequest->update(['hr_approval_status' => $request->status]);
            if ($request->status === 'Rejected') {
                $manpowerRequest->update(['status' => 'Rejected']);
            }
        } 
        
        // Stage 3: Director (Final)
        elseif ($request->level === 'director') {
            // Ensure HR approved first
            abort_if($manpowerRequest->hr_approval_status !== 'Approved', 403, 'HR must endorse first.');
            
            $manpowerRequest->update(['director_approval_status' => $request->status]);
            
            if ($request->status === 'Approved') {
                $manpowerRequest->update(['status' => 'Approved']); // Officially approved!
            } elseif ($request->status === 'Rejected') {
                $manpowerRequest->update(['status' => 'Rejected']);
            }
        }

        return back()->with('success', "Approval status updated.");
    }
}