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

    // NEW HELPER: We put the security check here so we don't have to write it twice!
    private function checkHrAccess()
    {
        // Safely grab the names, default to empty strings, and convert to lowercase
        $roleName = strtolower(auth()->user()->role?->name ?? '');
        $positionName = strtolower(auth()->user()->position?->name ?? '');

        // If they are NOT an Admin, NOT an HR role, and NOT a Human Resources position -> Kick them out!
        if ($roleName !== 'admin' && $roleName !== 'hr' && $positionName !== 'human resources') {
            abort(403, 'UNAUTHORIZED ACCESS. ONLY HR PERSONNEL CAN VIEW THIS PAGE.');
        }
    }

    public function adminIndex()
    {
        // 1. Run the new security check
        $this->checkHrAccess();

        // 2. If they pass, load the page!
        $requests = HrRequest::with('user')->latest()->get();
        
        return Inertia::render('HR/Admin/HRAdminOverview', [
            'requests' => $requests
        ]);
    }

    public function updateStatus(Request $request, HrRequest $hrRequest)
    {
        // 1. Run the new security check
        $this->checkHrAccess();

        $request->validate([
            'action' => 'required|in:accept,reject'
        ]);

        if ($request->action === 'reject') {
            $hrRequest->update(['status' => 'Rejected']);
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
} 