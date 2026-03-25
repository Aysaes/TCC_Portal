<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function create()
    {
        return Inertia::render('HR/Staff/Feedback');
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string|max:50',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // Up to 5MB images allowed
        ]);

        // Handle the image upload if one is provided
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('feedback_images', 'public');
        }

        Feedback::create([
            'user_id' => auth()->id(), 
            'type' => $request->type,
            'subject' => $request->subject,
            'message' => $request->message,
            'image_path' => $imagePath, // Save the path to the database
        ]);

        return back()->with('success', 'Thank you! Your feedback has been securely submitted to HR.');
    }
}