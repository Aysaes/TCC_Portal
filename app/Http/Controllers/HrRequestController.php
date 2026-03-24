<?php

namespace App\Http\Controllers;

use App\Models\HrRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrRequestController extends Controller
{
    // Load the user's HR dashboard and their past requests
    public function index()
    {
        $requests = HrRequest::where('user_id', auth()->id())->latest()->get();
        return Inertia::render('HR/Dashboard', ['requests' => $requests]);
    }

    // Save a new 2316 or COE request
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
            'status' => 'Pending HR', // Automatically starts at HR
            'name' => $request->name,
            'reason' => $request->reason,
            'specific_details' => $request->specific_details,
        ]);

        return back()->with('success', 'Your request has been submitted to HR.');
    }
}