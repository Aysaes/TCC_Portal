<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use App\Notifications\NewFeedbackAlert;

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', 
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('feedback_images', 'public');
        }

        // 🟢 1. Save the feedback to a variable
        $feedback = Feedback::create([
            'user_id' => Auth::id(), 
            'type' => $request->type,
            'subject' => $request->subject,
            'message' => $request->message,
            'image_path' => $imagePath,
        ]);

        // 🟢 2. Find the HR Team (Admins, HR, HRBP)
        $hrUsers = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['admin', 'HR', 'HRBP', 'Human Resources', 'Director of Corporate Services and Operations']);
        })->orWhereHas('position', function ($q) {
            $q->where('name', 'Human Resources');
        })->get();

        // 🟢 3. Fire the notification!
        if ($hrUsers->isNotEmpty()) {
            Notification::send($hrUsers, new NewFeedbackAlert($feedback->type, Auth::user()->name));
        }

        return back()->with('success', 'Thank you! Your feedback has been securely submitted to HR.');
    }
}
