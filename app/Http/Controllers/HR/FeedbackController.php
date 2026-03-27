<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class FeedbackController extends Controller
{
    // ---> NEW METHOD FOR ADMIN VIEW <---
    public function index(Request $request)
    {
        $query = Feedback::with('user')->latest();

        // Optional: Handle the search filter
        if ($request->filled('search')) {
            $query->where('subject', 'like', '%' . $request->search . '%');
        }

        // Optional: Handle the type dropdown filter
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Paginate results (e.g., 10 per page) and keep query strings for pagination links
        $submissions = $query->paginate(10)->withQueryString()->through(function ($submission) {
            $submission->created_at_display = Carbon::parse($submission->created_at)
                ->timezone(config('app.timezone'))
                ->format('M j, Y');

            return $submission;
        });

        return Inertia::render('HR/Admin/FeedbackSubmissions', [
            'submissions' => $submissions,
            'filters' => $request->only(['search', 'type']) // Pass filters back to React to keep input states
        ]);
    }

    // Existing create method
    public function create()
    {
        return Inertia::render('HR/Staff/Feedback');
    }

    // Existing store method
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
