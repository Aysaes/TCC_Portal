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
    public function index(Request $request)
    {
        $query = Feedback::with('user')->latest();

        if ($request->filled('search')) {
            $query->where('subject', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $submissions = $query->paginate(10)->withQueryString()->through(function ($submission) {
            $submission->created_at_display = Carbon::parse($submission->created_at)
                ->timezone(config('app.timezone'))
                ->format('M j, Y');

            // 🟢 SECURITY: If anonymous, scrub the user data before sending to React
            if ($submission->is_anonymous) {
                $submission->unsetRelation('user'); 
                $submission->user_name_display = 'Anonymous';
            } else {
                $submission->user_name_display = $submission->user ? $submission->user->name : 'Unknown';
            }

            return $submission;
        });

        return Inertia::render('HR/Admin/FeedbackSubmissions', [
            'submissions' => $submissions,
            'filters' => $request->only(['search', 'type']) 
        ]);
    }

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', 
            'is_anonymous' => 'boolean', // 🟢 Validate the new field
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('feedback_images', 'public');
        }

        $isAnonymous = $request->boolean('is_anonymous'); // 🟢 Safely cast to boolean

        $feedback = Feedback::create([
            'user_id' => Auth::id(), 
            'type' => $request->type,
            'subject' => $request->subject,
            'message' => $request->message,
            'image_path' => $imagePath,
            'is_anonymous' => $isAnonymous, // 🟢 Save it
        ]);

        $hrUsers = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['admin', 'HR', 'HRBP', 'Human Resources', 'Director of Corporate Services and Operations']);
        })->orWhereHas('position', function ($q) {
            $q->where('name', 'Human Resources');
        })->get();

        if ($hrUsers->isNotEmpty()) {
            // 🟢 Send "Anonymous" or the actual name to the email notification
            $submitterName = $isAnonymous ? 'Anonymous' : Auth::user()->name;
            Notification::send($hrUsers, new NewFeedbackAlert($feedback->type, $submitterName));
        }

        return back()->with('success', 'Thank you! Your feedback has been securely submitted to HR.');
    }
}