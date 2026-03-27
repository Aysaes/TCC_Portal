<?php

namespace App\Http\Controllers;

use App\Models\HrRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrRequestController extends Controller
{
    // --- USER (STAFF) FUNCTIONS ---

    public function index()
    {
        $requests = HrRequest::where('user_id', auth()->id())->latest()->get();
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

        HrRequest::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'status' => 'Pending HR', 
            'name' => $request->name,
            'reason' => $request->reason,
            'specific_details' => $request->specific_details,
        ]);

        return back()->with('success', 'Your request has been submitted to HR.');
    }


    // --- HR ADMIN FUNCTIONS ---

    private function checkHrAccess()
    {
        // Safely grab the names, default to empty strings, and convert to lowercase
        $roleName = strtolower(auth()->user()->role?->name ?? '');
        $positionName = strtolower(auth()->user()->position?->name ?? '');

        // ALLOWED ROLES (Including HRBP!)
        $allowedRoles = ['admin', 'hr', 'hrbp'];

        // If they are NOT in the allowed roles, and NOT a Human Resources position -> Kick them out
        if (!in_array($roleName, $allowedRoles) && $positionName !== 'human resources') {
            abort(403, 'UNAUTHORIZED ACCESS. ONLY HR PERSONNEL CAN VIEW THIS PAGE.');
        }
    }

    public function adminIndex()
    {
        $this->checkHrAccess();

        $requests = HrRequest::with('user')->latest()->get();
        
        return Inertia::render('HR/Admin/HRAdminOverview', [
            'requests' => $requests
        ]);
    }

    public function updateStatus(Request $request, HrRequest $hrRequest)
    {
        $this->checkHrAccess();

        $request->validate([
            'action' => 'required|in:accept,reject',
            'remarks' => 'nullable|string' // MUST validate remarks so they save!
        ]);

        if ($request->action === 'reject') {
            // Save the rejection and attach the "HR|" prefix
            $hrRequest->update([
                'status' => 'Rejected',
                'remarks' => $request->filled('remarks') ? 'HR|' . $request->remarks : null
            ]);
            return back()->with('success', 'Request has been rejected.');
        }

        if ($hrRequest->type === '2316') {
            $hrRequest->update(['status' => 'General Accounting']);
            return back()->with('success', '2316 Request forwarded to General Accounting.');
        } else {
            $hrRequest->update(['status' => 'Released']);
            return back()->with('success', 'COE Request marked as Released.');
        }
    }
    
    // --- ACCOUNTING FUNCTIONS ---

    public function accountingApprovals()
    {
        $requests = HrRequest::where('type', '2316')
                        ->whereIn('status', ['General Accounting', 'Released', 'Rejected'])
                        ->latest()
                        ->get();

        return inertia('HR/AccountingApprovals', [
            'requests' => $requests
        ]);
    }

    public function updateAccountingStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Released,Rejected',
            'remarks' => 'nullable|string'
        ]);

        $docRequest = HrRequest::findOrFail($id);
        $docRequest->status = $request->status;

        // Save the rejection and attach the "ACCOUNTING|" prefix
        if ($request->status === 'Rejected' && $request->filled('remarks')) {
            $docRequest->remarks = 'ACCOUNTING|' . $request->remarks; 
        }

        $docRequest->save();

        return redirect()->back()->with('success', 'Document status updated successfully.');
    }
}