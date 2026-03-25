<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    // Show the form
    public function create()
    {
        return Inertia::render('HR/Feedback');
    }

    // Save the submission
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string|max:50',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'is_anonymous' => 'boolean',
        ]);

        Feedback::create([
            // If they check anonymous, save 'null' instead of their ID
            'user_id' => $request->is_anonymous ? null : auth()->id(),
            'type' => $request->type,
            'subject' => $request->subject,
            'message' => $request->message,
            'is_anonymous' => $request->is_anonymous,
        ]);

        return back()->with('success', 'Thank you! Your feedback has been securely submitted to HR.');
    }
}