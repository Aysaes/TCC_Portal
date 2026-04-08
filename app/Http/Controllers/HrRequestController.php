<?php

namespace App\Http\Controllers;

use App\Models\HrRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use App\Notifications\DocumentRequestAlert;
use Inertia\Inertia;

class HrRequestController extends Controller
{
    // --- USER (STAFF) FUNCTIONS ---

    public function index()
    {
        $requests = HrRequest::where('user_id', Auth::id())->latest()->get();
        return Inertia::render('HR/Staff/StaffOverview', ['requests' => $requests]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:2316,COE',
            'name' => 'required_if:type,COE|nullable|string|max:255',
            'reason' => 'required_if:type,COE|nullable|string|max:255',
            'specific_details' => 'nullable|string|max:255',
        ]);

        // 1. Save the request to a variable so we can pass it to the notification
        $hrRequest = HrRequest::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'status' => 'Pending HR', 
            'name' => $request->name,
            'reason' => $request->reason,
            'specific_details' => $request->specific_details,
        ]);

        // 2. Find all HR Personnel
        $hrUsers = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['Admin', 'HR', 'HRBP', 'Human Resources']);
        })->orWhereHas('position', function ($q) {
            $q->where('name', 'Human Resources');
        })->get();

        // 3. Send the in-app notification!
        if ($hrUsers->isNotEmpty()) {
            Notification::send($hrUsers, new DocumentRequestAlert($hrRequest, Auth::user()->name));
        }

        return back()->with('success', 'Your request has been submitted to HR.');
    }


    // --- HR ADMIN FUNCTIONS ---

    // 🟢 GATEKEEPER 1: For VIEWING the page (HR Assistants, HRBP, Admin)
    private function checkHrAccess()
    {
        $roleName = strtolower(Auth::user()?->role?->name ?? '');
        $positionName = strtolower(Auth::user()?->position?->name ?? '');

        // Expanded allowed roles to catch variations of HR Assistant
        $allowedRoles = [
            'admin', 
            'hr', 
            'hrbp', 
            'HR Assistant',
            'HR Assist', 
            'human resources assistant', 
            'human resources'
        ];

        // Check if the role is in the list, OR if the position contains 'human resources'
        $hasRole = in_array($roleName, $allowedRoles);
        $hasPosition = str_contains($positionName, 'human resources') || str_contains($positionName, 'hr assistant');

        if (!$hasRole && !$hasPosition) {
            abort(403, 'UNAUTHORIZED ACCESS. ONLY HR PERSONNEL CAN VIEW THIS PAGE.');
        }
    }

    // 🟢 GATEKEEPER 2: For ACTIONS (Only HRBP & Admin)
    private function checkHrbpAccess()
    {
        $roleName = strtolower(Auth::user()?->role?->name ?? '');

        // Only Admin and HRBP can approve/reject
        $allowedRoles = ['admin', 'hrbp'];

        if (!in_array($roleName, $allowedRoles)) {
            abort(403, 'UNAUTHORIZED ACCESS. ONLY HRBP CAN ACCEPT OR ENDORSE REQUESTS.');
        }
    }

    public function adminIndex()
    {
        // HR Assistants can pass this gate and see the data
        $this->checkHrAccess();

        $requests = HrRequest::with('user')->latest()->get();
        
        return Inertia::render('HR/Admin/HRAdminOverview', [
            'requests' => $requests
        ]);
    }

   public function updateStatus(Request $request, HrRequest $hrRequest)
    {
        // 🟢 NEW: HR Assistants will hit a brick wall here and get a 403 error!
        $this->checkHrbpAccess();

        $request->validate([
            'action' => 'required|in:accept,reject',
            'remarks' => 'nullable|string' 
        ]);

        $originalRequester = $hrRequest->user;

        if ($request->action === 'reject') {
            $hrRequest->update([
                'status' => 'Rejected',
                'remarks' => $request->filled('remarks') ? 'HR|' . $request->remarks : null
            ]);
            
            if ($originalRequester) {
                $originalRequester->notify(new \App\Notifications\DocumentStatusUpdate($hrRequest, "Rejected by HR."));
            }
            
            return back()->with('success', 'Request has been rejected.');
        }

        if ($hrRequest->type === '2316') {
            $hrRequest->update(['status' => 'General Accounting']);
            
            if ($originalRequester) {
                $originalRequester->notify(new \App\Notifications\DocumentStatusUpdate($hrRequest, "Forwarded to General Accounting."));
            }
            
            return back()->with('success', '2316 Request forwarded to General Accounting.');
        
        } else {
            $hrRequest->update(['status' => 'Released']);
            
            if ($originalRequester) {
                $originalRequester->notify(new \App\Notifications\DocumentStatusUpdate($hrRequest, "Your COE is ready for release!"));
            }
            
            return back()->with('success', 'COE Request marked as Released.');
        }
    }
    
    // --- ACCOUNTING FUNCTIONS ---

    private function checkAccountingAccess()
    {
        $roleName = strtolower(Auth::user()?->role?->name ?? '');

        $allowedRoles = [
            'admin', 
            'director of corporate services and operations', 
            'general accounting'
        ];

        if (!in_array($roleName, $allowedRoles)) {
            abort(403, 'UNAUTHORIZED ACCESS. ONLY ACCOUNTING OR AUTHORIZED PERSONNEL CAN VIEW THIS.');
        }
    }

    public function accountingApprovals()
    {
        $this->checkAccountingAccess();

        $requests = HrRequest::with('user') 
                        ->where('type', '2316')
                        ->whereIn('status', ['General Accounting', 'Released', 'Rejected'])
                        ->latest()
                        ->get();

        return inertia('HR/AccountingApprovals', [
            'requests' => $requests
        ]);
    }

    public function updateAccountingStatus(Request $request, $id)
    {
        $this->checkAccountingAccess();

        $request->validate([
            'status' => 'required|in:Released,Rejected',
            'remarks' => 'nullable|string'
        ]);

        $docRequest = HrRequest::findOrFail($id);
        $docRequest->status = $request->status;

        if ($request->status === 'Rejected' && $request->filled('remarks')) {
            $docRequest->remarks = 'ACCOUNTING|' . $request->remarks; 
        }

        $docRequest->save();

        $originalRequester = $docRequest->user;

        if ($originalRequester) {
            if ($request->status === 'Released') {
                $originalRequester->notify(new \App\Notifications\DocumentStatusUpdate($docRequest, "Your 2316 is ready for release!"));
            } elseif ($request->status === 'Rejected') {
                $originalRequester->notify(new \App\Notifications\DocumentStatusUpdate($docRequest, "Rejected by General Accounting."));
            }
        }

        return redirect()->back()->with('success', 'Document status updated successfully.');
    }
}