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
        
        Log::info('--- NEW MRF SUBMISSION STARTED ---', ['user' => Auth::user()->name, 'role' => Auth::user()->role->name]);

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

            Log::info('MARKER 2: Form validation passed successfully!');

            // 2. 🟢 THE NEW DYNAMIC WORKFLOW ROUTING 🟢
            $userRole = Auth::user()->role->name;

            $workflowPath = match($userRole) {
                'Clinic Assistant TL', 'Vet Tech TL' 
                    => ['Chief Vet', 'Operations Manager', 'Director of Corporate Services and Operations', 'HR'],
                'Chief Veterinarian', 'Cashier TL', 'Housekeeping TL', 'Inventory TL' 
                    => ['Operations Manager', 'Director of Corporate Services and Operations', 'HR'],
                'IT TL', 'HRBP', 'Marketing Manager', 'Operations Manager', 'Procurement TL', 'Auditor TL' 
                    => ['Director of Corporate Services and Operations', 'HR'],
                'Director of Corporate Services and Operations' 
                    => ['HR'],
                default => ['Director of Corporate Services and Operations', 'HR'],
            };

            Log::info('MARKER 3: Calculated Workflow Path', ['path' => $workflowPath]);

            // 3. Finalize data
            $validated['user_id'] = Auth::id();
            $validated['workflow_path'] = $workflowPath;
            $validated['current_step'] = 0; 

            // 🟢 AUTO-APPROVE DCSO REQUESTS 🟢
            if (isset($workflowPath[0]) && $workflowPath[0] === 'HR') {
                $validated['status'] = 'Approved'; 
                $successMessage = "Request auto-approved and forwarded to HR for reference.";
            } else {
                $validated['status'] = 'Pending';
                $firstApprover = $workflowPath[0] ?? 'Unknown';
                $successMessage = "Manpower Request submitted and routed to the {$firstApprover} for approval.";
            }

            Log::info('MARKER 4: Attempting to save to database...');

            // 4. Save to database
            ManpowerRequest::create($validated);

            Log::info('MARKER 5: Successfully saved to database! Redirecting...');

            return redirect()->route('hr.manpower-requests.index')
                ->with('success', $successMessage);

        } catch (\Illuminate\Validation\ValidationException $e) {
            
            Log::warning('MRF VALIDATION FAILED: User missed a required field.', $e->errors());
            throw $e; // Re-throw so Laravel safely returns the user to the form
            
        } catch (\Throwable $e) { 
            
            Log::error('MRF SUBMISSION CRASH: ' . $e->getMessage());
            Log::error('FILE: ' . $e->getFile() . ' on line ' . $e->getLine());
            
            
            dd([
                'CRASH REASON' => $e->getMessage(),
                'FILE' => $e->getFile(),
                'LINE' => $e->getLine()
            ]);
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
        if (in_array($userRole, ['TL', 'Marketing Manager'])) {
            // Team Leaders only see what they submitted
            $query->where('user_id', $user->id);
            
        } elseif (in_array($userRole, ['admin', 'HR','HRBP' ,'Director of Corporate Services and Operations'])) {
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