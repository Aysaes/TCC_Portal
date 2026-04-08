<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use App\Notifications\PasswordResetAlert;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
       $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_id' => 'required|string',
       ]);

       // Finds user in database
        $user = User::where('email', $request->email)->first();

       // If user exists and password is correct, check device authorization
        if ($user && Hash::check ($request->password, $user->password )){

        // Get approved devices list   
            $currentDevices = $user->authorized_device_ids ?? [];
            $attemptDevice = $request->device_id;

        //  If current devices not on the list
            if (!in_array($attemptDevice, $currentDevices)) {

        // Check if user has reached device limit
                if (count($currentDevices) >= $user->device_limit) {
                    throw ValidationException::withMessages([
                        'email' => "Device limit reached ($user->device_limit allowed). Please contact IT support for assistance.",
                    ]);
                } 

            // Authorize new device
            $currentDevices[] = $attemptDevice;

            $user->authorized_device_ids = $currentDevices;
            $user->save();
            }
        }

        // Proceed with normal authentication flow
        $request->authenticate();

        // 🟢 THE KILL SWITCH CHECK
        if ($request->user()->status === 'Disabled') {
            
            // Immediately log them back out
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Kick them back to the login screen with an error
            throw ValidationException::withMessages([
                'email' => 'This account has been disabled. Please contact the administrator.',
            ]);
        }

        // If they are active, let them in!
        $request->session()->regenerate();

        // --- START OF LOGGING CODE (SUCCESSFUL LOGIN) ---
        // Placed here because they successfully passed the kill switch and device checks!
        \App\Models\SystemLog::create([
            'user_id' => Auth::id(), 
            'module' => 'Auth',
            'action' => 'Login',
            'description' => 'User logged in successfully.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'success',
        ]);
        // --- END OF LOGGING CODE ---

        return redirect()->intended('/dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Grab the user ID BEFORE logging them out so we can log it
        $userId = Auth::id();

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        // --- START OF LOGGING CODE (LOGOUT) ---
        if ($userId) {
            \App\Models\SystemLog::create([
                'user_id' => $userId,
                'module' => 'Auth',
                'action' => 'Logout',
                'description' => 'User logged out of the system.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'success',
            ]);
        }
        // --- END OF LOGGING CODE ---

        return redirect('/');
    }

    public function requestPasswordReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'We could not find an account with that email address.'
        ]);

        // 1. Find the user
        $user = User::where('email', $request->email)->first();

        // 2. Change their status to "Password reset"
        $user->update(['status' => 'Password reset']);

        // 3. Find the Admins and notify them
        $admins = User::whereHas('role', function ($q) {
            $q->where('name', 'Admin');
        })->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new PasswordResetAlert($user));
        }

        return back()->with('status', 'The Admin team has been notified to reset your password.');
    }
}