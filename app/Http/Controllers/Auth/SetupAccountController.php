<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Events\PasswordReset;
use App\Notifications\PasswordResetSuccess;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SetupAccountController extends Controller
{
    public function showSetupForm(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
        ]);

        $email = $request->email;
        $token = $request->token;

        // 1. Find the user by their email address
        $user = User::where('email', $email)->first();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Invalid request. Please contact IT support for assistance.');
        }

        // 2. Securely check the hashed token using the repository
        $isValidToken = Password::broker()->getRepository()->exists($user, $token);

        // 🟢 THE FIX: Removed the 'link.expired' logic.
        // If the token is invalid, send them directly back to the login page.
        if (!$isValidToken) {
            return redirect()->route('login')->with('error', 'This setup link is invalid or has expired. Please request a new one or contact IT support.');
        }

        // 3. Prevent already-active users from accessing this page
        if ($user->status === 'Active') {
             return redirect()->route('login')->with('status', 'Your account is already active. Please log in.');
        }

        // 4. Send the user to the React setup page
        return Inertia::render('Auth/SetupAccount', [
            'email' => $email,
            'token' => $token,
        ]);
    }

    public function setupPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                
                // Safety catch: Guarantee the red badge is cleared
                $user->status = 'Active'; 
                $user->save();
                
                event(new PasswordReset($user));

                // Notify the Admin team (Wrapped in try/catch to prevent 500 errors)
                try {
                    $admins = User::whereHas('role', function ($q) {
                        $q->where('name', 'Admin');
                    })->get();

                    if ($admins->isNotEmpty()) {
                        Notification::send($admins, new PasswordResetSuccess($user));
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send admin notification: ' . $e->getMessage());
                }
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('success', 'Password set successfully! You may now log in.');
        }   

        return back()->withErrors(['email' => __($status)]);
    }
}