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
use Exception;

class ManpowerRequestController extends Controller
{
    // ----------------------------------------------------------------------
    // 1. THE CREATION FORM
    // ----------------------------------------------------------------------
   public function create()
    {
        // Because of our web.php middleware, we already know the user is authorized by the time they reach this line!

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
        // 👇 We wrap EVERYTHING in the Throwable catch now
        try {
            // 1. Validate the incoming data
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

            // 2. 🟢 THE NEW DYNAMIC WORKFLOW ROUTING 🟢
            $userRole = Auth::user()->role->name;

            // Map the exact Requester Role to their specific approval path
            // IMPORTANT: Ensure these strings exactly match your database role names!
            $workflowPath = match($userRole) {
                // Medical Paths (4 Steps)
                'Clinic Assistant TL', 'Vet Tech TL' 
                    => ['Chief Vet', 'Operations Manager', 'Director of Corporate Services and Operations', 'HR'],
                
                // Medical & Ops Level 2 Paths (3 Steps)
                'Chief Veterinarian', 'Cashier TL', 'Housekeeping TL', 'Inventory TL' 
                    => ['Operations Manager', 'Director of Corporate Services and Operations', 'HR'],
                
                // Direct to DCSO Paths (2 Steps)
                'IT TL', 'HRBP', 'Marketing Manager', 'Operations Manager', 'Procurement TL', 'Auditor TL' 
                    => ['Director of Corporate Services and Operations', 'HR'],
                
                // Fallback (Safe Default)
                default => ['Director of Corporate Services and Operations', 'HR'],
            };

            // 3. Finalize data
            // We no longer need 'requesting_manager_id' because the workflow path dictates who sees it!
            $validated['user_id'] = Auth::id();
            $validated['status'] = 'Pending';
            $validated['workflow_path'] = $workflowPath;
            $validated['current_step'] = 0; // Starts at the first role in the array

            // 4. Save to database
            ManpowerRequest::create($validated);

            $firstApprover = $workflowPath[0];

            return redirect()->route('hr.manpower-requests.index')
                ->with('success', "Manpower Request submitted and routed to the {$firstApprover} for approval.");

        } catch (\Throwable $e) { 
            Log::error('MRF SUBMISSION CRASH: ' . $e->getMessage());
            return back()->withErrors(['form_error' => 'Submission failed. Check logs.']);
        }
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
            // Notice we removed 'requestingManager' because it is obsolete!
        ]);

        // 🟢 NEW DYNAMIC ROLE-BASED VISIBILITY 🟢
        if (str_contains($userRole, 'TL')) {
            // Team Leaders only see what they submitted
            $query->where('user_id', $user->id);
            
        } elseif (in_array($userRole, ['admin', 'HR', 'Director of Corporate Services and Operations'])) {
            // High-level roles pull everything. React will filter their specific "Action Required" tab.
            
        } else {
            // Middle Managers see their own submissions OR requests where their role is in the workflow path
            $query->where('user_id', $user->id)
                  ->orWhereJsonContains('workflow_path', $userRole);
        }

        return Inertia::render('HR/Admin/ApprovalRequest', [
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
            'status' => 'required|in:Approved,Rejected'
        ]);

        if ($request->status === 'Rejected') {
            // Instant rejection kills the request
            $manpowerRequest->update(['status' => 'Rejected']);
            return back()->with('success', "Request has been officially rejected.");
        } 
        
        if ($request->status === 'Approved') {
            // Move to the next step in the array
            $nextStep = $manpowerRequest->current_step + 1;
            $workflowPath = $manpowerRequest->workflow_path;

            // Check if the NEXT step is HR
            if (isset($workflowPath[$nextStep]) && $workflowPath[$nextStep] === 'HR') {
                // DCSO just approved it. It moves to HR for safekeeping.
                $manpowerRequest->update([
                    'current_step' => $nextStep,
                    'status' => 'Approved' // The master status is now officially complete!
                ]);
                return back()->with('success', "Final approval granted. Forwarded to HR for reference.");
            } else {
                // Just pass the baton to the next manager
                $manpowerRequest->update(['current_step' => $nextStep]);
                $nextRole = $workflowPath[$nextStep];
                return back()->with('success', "Endorsed and forwarded to the {$nextRole}.");
            }
        }
    }
}